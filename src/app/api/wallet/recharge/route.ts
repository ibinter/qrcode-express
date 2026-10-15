import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const CREDIT_PACKS: Record<string, { credits: number; amount: number; label: string }> = {
  starter:  { credits: 50,   amount: 1000,  label: 'Pack Starter — 50 crédits' },
  boost:    { credits: 200,  amount: 3500,  label: 'Pack Boost — 200 crédits' },
  pro:      { credits: 500,  amount: 7500,  label: 'Pack Pro — 500 crédits' },
  ultimate: { credits: 1000, amount: 12000, label: 'Pack Ultimate — 1 000 crédits' },
}

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

  const reference = `QRE-CR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express-ibig.vercel.app'

  const admin = createAdminClient()
  const { error: txError } = await admin.from('transactions').insert({
    user_id: user.id,
    type: 'debit',
    amount: packConfig.amount,
    currency: 'XOF',
    description: packConfig.label,
    reference,
    status: 'pending',
    metadata: { type: 'credits', pack, credits: packConfig.credits },
  })

  if (txError) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }

  const geniusRes = await fetch('https://api.geniuspay.io/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.GENIUSPAY_API_KEY!,
      'Authorization': `Bearer ${process.env.GENIUSPAY_API_SECRET}`,
    },
    body: JSON.stringify({
      amount: packConfig.amount,
      currency: 'XOF',
      description: packConfig.label,
      reference,
      customer_email: user.email,
      callback_url: `${appUrl}/api/payment/webhook`,
      return_url: `${appUrl}/portefeuille?recharge=success`,
      cancel_url: `${appUrl}/portefeuille?recharge=cancelled`,
    }),
  })

  if (!geniusRes.ok) {
    return NextResponse.json({ error: 'Erreur GeniusPay' }, { status: 502 })
  }

  const genius = await geniusRes.json()
  return NextResponse.json({ payment_url: genius.payment_url ?? genius.url })
}
