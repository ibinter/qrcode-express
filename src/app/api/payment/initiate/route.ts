import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getIp } from '@/lib/rate-limit'

const GENIUSPAY_URL = 'https://geniuspay.ci/api/v1/merchant/payments'

// Amounts in FCFA — monthly × months paid (1 free for semi, 2 free for annual)
const PLANS: Record<string, { amount: number; label: string; basePlan: string; durationDays: number }> = {
  // ── Monthly ─────────────────────────────────────
  essential: { amount: 1500,  label: 'QR CODE EXPRESS — Plan Essentiel (mensuel)',    basePlan: 'essential', durationDays: 30  },
  pro:       { amount: 3500,  label: 'QR CODE EXPRESS — Plan Pro (mensuel)',           basePlan: 'pro',       durationDays: 30  },
  business:  { amount: 8000,  label: 'QR CODE EXPRESS — Plan Business (mensuel)',      basePlan: 'business',  durationDays: 30  },

  // ── Semestriel (6 mois, payer 5) ────────────────
  essential_semi: { amount: 7500,  label: 'QR CODE EXPRESS — Plan Essentiel (6 mois)', basePlan: 'essential', durationDays: 183 },
  pro_semi:       { amount: 17500, label: 'QR CODE EXPRESS — Plan Pro (6 mois)',        basePlan: 'pro',       durationDays: 183 },
  business_semi:  { amount: 40000, label: 'QR CODE EXPRESS — Plan Business (6 mois)',   basePlan: 'business',  durationDays: 183 },

  // ── Annuel (12 mois, payer 10) ──────────────────
  essential_annual: { amount: 15000, label: 'QR CODE EXPRESS — Plan Essentiel (annuel)', basePlan: 'essential', durationDays: 365 },
  pro_annual:       { amount: 35000, label: 'QR CODE EXPRESS — Plan Pro (annuel)',        basePlan: 'pro',       durationDays: 365 },
  business_annual:  { amount: 80000, label: 'QR CODE EXPRESS — Plan Business (annuel)',   basePlan: 'business',  durationDays: 365 },
}

export async function POST(request: NextRequest) {
  // 10 payment initiations per IP per hour
  const { ok } = rateLimit(getIp(request), 10, 60 * 60 * 1000)
  if (!ok) return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une heure.' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { plan } = await request.json()
  const planConfig = PLANS[plan]
  if (!planConfig) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express.com').replace(/^ï»¿/, '')

  // Appel GeniusPay
  let geniusRes: Response
  try {
    geniusRes = await fetch(GENIUSPAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.GENIUSPAY_API_KEY!,
        'X-API-Secret': process.env.GENIUSPAY_API_SECRET!,
      },
      body: JSON.stringify({
        amount: planConfig.amount,
        currency: 'XOF',
        description: planConfig.label,
        customer: { email: user.email },
        success_url: `${appUrl}/dashboard?payment=success`,
        error_url: `${appUrl}/dashboard?payment=cancelled`,
        metadata: { plan, basePlan: planConfig.basePlan, durationDays: planConfig.durationDays, user_id: user.id },
      }),
    })
  } catch (e: any) {
    console.error('[payment/initiate] GeniusPay fetch error:', e?.message)
    return NextResponse.json({ error: `Erreur réseau GeniusPay: ${e?.message}` }, { status: 502 })
  }

  if (!geniusRes.ok) {
    const errText = await geniusRes.text().catch(() => '')
    console.error('[payment/initiate] GeniusPay HTTP error:', geniusRes.status, errText)
    return NextResponse.json({ error: `Erreur GeniusPay ${geniusRes.status}: ${errText}` }, { status: 502 })
  }

  const genius = await geniusRes.json()
  console.log('[payment/initiate] GeniusPay response:', JSON.stringify(genius))

  const geniusRef: string = genius.data?.reference ?? ''
  const checkoutUrl: string = genius.data?.checkout_url ?? genius.data?.payment_url ?? ''

  if (!checkoutUrl) {
    return NextResponse.json({ error: 'Pas de lien de paiement retourné' }, { status: 502 })
  }

  // Enregistrer la transaction avec la référence GeniusPay
  const admin = createAdminClient()
  await admin.from('transactions').insert({
    user_id: user.id,
    type: 'debit',
    amount: planConfig.amount,
    currency: 'XOF',
    description: planConfig.label,
    reference: geniusRef || `QRE-${Date.now()}`,
    status: 'pending',
    metadata: { plan, basePlan: planConfig.basePlan, durationDays: planConfig.durationDays },
  })

  return NextResponse.json({ payment_url: checkoutUrl })
}
