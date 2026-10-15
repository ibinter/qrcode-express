import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHmac } from 'crypto'

const PLAN_DURATION_DAYS: Record<string, number> = {
  essential: 30,
  pro: 30,
  business: 30,
}

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET || process.env.GENIUSPAY_API_SECRET
  if (!secret) return false
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return expected === signature
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-geniuspay-signature') || ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.status !== 'success' && event.event !== 'payment.success') {
    return NextResponse.json({ received: true })
  }

  const reference: string = event.reference
  const admin = createAdminClient()

  const { data: tx } = await admin
    .from('transactions')
    .select('id, user_id, metadata, status')
    .eq('reference', reference)
    .single()

  if (!tx || tx.status === 'success') {
    return NextResponse.json({ received: true })
  }

  const meta = (tx.metadata ?? {}) as Record<string, unknown>

  // Marquer la transaction réussie
  await admin.from('transactions').update({ status: 'success' }).eq('id', tx.id)

  // Cas 1 : achat de crédits
  if (meta.type === 'credits') {
    const creditsToAdd = Number(meta.credits ?? 0)
    if (creditsToAdd > 0) {
      await admin.rpc('add_credits', { user_uuid: tx.user_id, amount: creditsToAdd })
    }
    return NextResponse.json({ received: true })
  }

  // Cas 2 : abonnement
  const plan = (meta.plan as string) ?? 'essential'
  const days = PLAN_DURATION_DAYS[plan] ?? 30
  const now = new Date()
  const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const { data: existingSub } = await admin
    .from('subscriptions')
    .select('id')
    .eq('user_id', tx.user_id)
    .eq('status', 'active')
    .single()

  if (existingSub) {
    await admin.from('subscriptions').update({
      plan,
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
      provider_ref: reference,
    }).eq('id', existingSub.id)
  } else {
    await admin.from('subscriptions').insert({
      user_id: tx.user_id,
      plan,
      status: 'active',
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
      auto_renew: false,
      provider_ref: reference,
    })
  }

  return NextResponse.json({ received: true })
}
