import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { amount, payer_name, payer_phone } = await req.json()

  if (!amount || Number(amount) < 100) {
    return NextResponse.json({ error: 'Montant minimum : 100 FCFA' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, content, status, user_id')
    .eq('id', id)
    .eq('type', 'payment')
    .single()

  if (!qr || qr.status === 'archived') {
    return NextResponse.json({ error: 'Lien de paiement introuvable' }, { status: 404 })
  }
  if (qr.status === 'paused') {
    return NextResponse.json({ error: 'Ce lien de paiement est désactivé' }, { status: 409 })
  }

  let payment: Record<string, unknown> = {}
  try { payment = JSON.parse(qr.content || '{}') } catch {}

  const fixedAmount = Number(payment.amount) || 0
  const customAmount = !!payment.custom_amount
  const finalAmount = customAmount ? Number(amount) : fixedAmount || Number(amount)

  if (finalAmount < 100) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
  }

  const reference = `QRE-PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express.com'
  const description = (payment.description as string) || (payment.merchant as string) || 'Paiement QR'

  // Create pending transaction (tied to QR owner)
  await admin.from('transactions').insert({
    user_id: qr.user_id,
    type: 'credit',
    amount: finalAmount,
    currency: 'XOF',
    description,
    reference,
    status: 'pending',
    metadata: {
      type: 'payment',
      qr_id: id,
      payer_name: payer_name || null,
      payer_phone: payer_phone || null,
    },
  })

  const geniusRes = await fetch('https://api.geniuspay.io/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.GENIUSPAY_API_KEY!,
      'Authorization': `Bearer ${process.env.GENIUSPAY_API_SECRET}`,
    },
    body: JSON.stringify({
      amount: finalAmount,
      currency: 'XOF',
      description,
      reference,
      customer_name: payer_name || undefined,
      customer_phone: payer_phone || undefined,
      callback_url: `${appUrl}/api/payment/webhook`,
      return_url: `${appUrl}/pay/success?ref=${reference}`,
      cancel_url: `${appUrl}/pay/${id}?cancelled=1`,
    }),
  })

  if (!geniusRes.ok) {
    return NextResponse.json({ error: 'Erreur GeniusPay — veuillez réessayer' }, { status: 502 })
  }

  const genius = await geniusRes.json()
  return NextResponse.json({ payment_url: genius.payment_url ?? genius.url })
}
