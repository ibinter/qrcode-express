import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PLANS: Record<string, { amount: number; label: string }> = {
  essential: { amount: 1000, label: 'QR CODE EXPRESS — Plan Essentiel' },
  pro:       { amount: 2500, label: 'QR CODE EXPRESS — Plan Pro' },
  business:  { amount: 6000, label: 'QR CODE EXPRESS — Plan Business' },
}

export async function POST(request: NextRequest) {
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

  const reference = `QRE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express-ibig.vercel.app'

  // Enregistrer la transaction en attente
  const admin = createAdminClient()
  const { error: txError } = await admin.from('transactions').insert({
    user_id: user.id,
    type: 'debit',
    amount: planConfig.amount,
    currency: 'XOF',
    description: planConfig.label,
    reference,
    status: 'pending',
    metadata: { plan },
  })

  if (txError) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }

  // Appel GeniusPay pour créer le lien de paiement
  const geniusRes = await fetch('https://api.geniuspay.io/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.GENIUSPAY_API_KEY!,
      'Authorization': `Bearer ${process.env.GENIUSPAY_API_SECRET}`,
    },
    body: JSON.stringify({
      amount: planConfig.amount,
      currency: 'XOF',
      description: planConfig.label,
      reference,
      customer_email: user.email,
      callback_url: `${appUrl}/api/payment/webhook`,
      return_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/dashboard?payment=cancelled`,
    }),
  })

  if (!geniusRes.ok) {
    return NextResponse.json({ error: 'Erreur GeniusPay' }, { status: 502 })
  }

  const genius = await geniusRes.json()
  return NextResponse.json({ payment_url: genius.payment_url ?? genius.url })
}
