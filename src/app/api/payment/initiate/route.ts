import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getIp } from '@/lib/rate-limit'

const GENIUSPAY_URL = 'https://geniuspay.ci/api/v1/merchant/payments'

// Amounts in FCFA — monthly × months paid (1 free for semi, 2 free for annual)
// Base prices: starter=4900, essential=9900, pro=19900, business=29900
const PLANS: Record<string, { amount: number; label: string; basePlan: string; durationDays: number }> = {
  // ── Monthly ─────────────────────────────────────
  starter:   { amount: 4900,  label: 'QR CODE EXPRESS — Plan Starter (mensuel)',      basePlan: 'starter',   durationDays: 30  },
  essential: { amount: 9900,  label: 'QR CODE EXPRESS — Plan Essentiel (mensuel)',    basePlan: 'essential', durationDays: 30  },
  pro:       { amount: 19900, label: 'QR CODE EXPRESS — Plan Pro (mensuel)',           basePlan: 'pro',       durationDays: 30  },
  business:  { amount: 29900, label: 'QR CODE EXPRESS — Plan Business (mensuel)',      basePlan: 'business',  durationDays: 30  },

  // ── Semestriel (6 mois, payer 5) ────────────────
  starter_semi:   { amount: 24500, label: 'QR CODE EXPRESS — Plan Starter (6 mois)',    basePlan: 'starter',   durationDays: 183 },
  essential_semi: { amount: 49500, label: 'QR CODE EXPRESS — Plan Essentiel (6 mois)',  basePlan: 'essential', durationDays: 183 },
  pro_semi:       { amount: 99500, label: 'QR CODE EXPRESS — Plan Pro (6 mois)',         basePlan: 'pro',       durationDays: 183 },
  business_semi:  { amount: 149500,label: 'QR CODE EXPRESS — Plan Business (6 mois)',    basePlan: 'business',  durationDays: 183 },

  // ── Annuel (12 mois, payer 10) ──────────────────
  starter_annual:   { amount: 49000,  label: 'QR CODE EXPRESS — Plan Starter (annuel)',    basePlan: 'starter',   durationDays: 365 },
  essential_annual: { amount: 99000,  label: 'QR CODE EXPRESS — Plan Essentiel (annuel)',  basePlan: 'essential', durationDays: 365 },
  pro_annual:       { amount: 199000, label: 'QR CODE EXPRESS — Plan Pro (annuel)',         basePlan: 'pro',       durationDays: 365 },
  business_annual:  { amount: 299000, label: 'QR CODE EXPRESS — Plan Business (annuel)',    basePlan: 'business',  durationDays: 365 },
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
