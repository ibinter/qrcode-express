import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const CREDIT_PACKS: Record<string, { credits: number; amount: number; label: string }> = {
  starter:  { credits: 50,   amount: 1000,  label: 'Pack Starter — 50 crédits' },
  boost:    { credits: 200,  amount: 3500,  label: 'Pack Boost — 200 crédits' },
  pro:      { credits: 500,  amount: 7500,  label: 'Pack Pro — 500 crédits' },
  ultimate: { credits: 1000, amount: 12000, label: 'Pack Ultimate — 1 000 crédits' },
}

const GENIUSPAY_URL = 'https://geniuspay.ci/api/v1/merchant/payments'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { pack } = await request.json()
  const packConfig = CREDIT_PACKS[pack]
  if (!packConfig) {
    return NextResponse.json({ error: 'Pack invalide' }, { status: 400 })
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express.com').replace(/^ï»¿/, '')

  // Appel GeniusPay — la référence est générée par GeniusPay, pas nous
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
        amount: packConfig.amount,
        currency: 'XOF',
        description: packConfig.label,
        customer: { email: user.email },
        success_url: `${appUrl}/portefeuille?recharge=success`,
        error_url: `${appUrl}/portefeuille?recharge=cancelled`,
        metadata: { site: 'qrcode-express', type: 'credits', pack, credits: packConfig.credits, user_id: user.id },
      }),
    })
  } catch (e: any) {
    console.error('[wallet/recharge] GeniusPay fetch error:', e?.message)
    return NextResponse.json({ error: 'Le service de paiement est momentanément injoignable. Réessayez dans quelques minutes.' }, { status: 502 })
  }

  if (!geniusRes.ok) {
    const errText = await geniusRes.text().catch(() => '')
    console.error('[wallet/recharge] GeniusPay HTTP error:', geniusRes.status, errText)
    return NextResponse.json({ error: 'Le service de paiement est momentanément indisponible. Réessayez dans quelques minutes.' }, { status: 502 })
  }

  const genius = await geniusRes.json()
  console.log('[wallet/recharge] GeniusPay response:', JSON.stringify(genius))

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
    amount: packConfig.amount,
    currency: 'XOF',
    description: packConfig.label,
    reference: geniusRef || `QRE-CR-${Date.now()}`,
    status: 'pending',
    metadata: { site: 'qrcode-express', type: 'credits', pack, credits: packConfig.credits },
  })

  return NextResponse.json({ payment_url: checkoutUrl })
}
