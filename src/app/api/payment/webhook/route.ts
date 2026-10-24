import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHmac } from 'crypto'
import { sendPaymentConfirmationEmail } from '@/lib/email'

// GeniusPay webhook payload format:
// { id, event, timestamp, data: { reference, status, metadata, ... }, environment }
// Signature header: X-Webhook-Signature = HMAC-SHA256(X-Webhook-Timestamp + "." + raw body) with whsec_... secret
// (format documenté par GeniusPay ; l'ancien format sans timestamp reste accepté)

function verifySignature(payload: string, timestamp: string, signature: string): boolean {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET
  if (!secret) return false
  const sign = (data: string) => createHmac('sha256', secret).update(data).digest('hex')
  return (timestamp !== '' && sign(`${timestamp}.${payload}`) === signature) || sign(payload) === signature
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-webhook-signature') || request.headers.get('x-geniuspay-signature') || ''
  const timestamp = request.headers.get('x-webhook-timestamp') || ''

  const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET
  if (webhookSecret && (!signature || !verifySignature(rawBody, timestamp, signature))) {
    console.error('[webhook] Signature invalide ou manquante')
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })
  }

  console.log('[webhook] Event reçu:', event.event, 'ref:', event.data?.reference)

  // On ne traite que les paiements réussis
  if (event.event !== 'payment.success') {
    return NextResponse.json({ received: true })
  }

  const reference: string = event.data?.reference ?? ''
  const meta = (event.data?.metadata ?? {}) as Record<string, unknown>
  const userId: string = (meta.user_id as string) ?? ''

  if (!reference) {
    console.error('[webhook] Référence manquante')
    return NextResponse.json({ received: true })
  }

  const admin = createAdminClient()

  // Trouver la transaction par référence GeniusPay
  const { data: tx } = await admin
    .from('transactions')
    .select('id, user_id, metadata, status')
    .eq('reference', reference)
    .single()

  // Le compte marchand GeniusPay est partagé par plusieurs sites : sans transaction connue ni marqueur
  // de ce site, le paiement appartient à un autre site et n'est pas traité ici.
  if (!tx && meta.site !== 'qrcode-express') {
    console.log('[webhook] Paiement d un autre site, ignoré. ref:', reference)
    return NextResponse.json({ received: true })
  }

  // Idempotence : si déjà traité, ignorer
  if (tx?.status === 'success') {
    return NextResponse.json({ received: true })
  }

  // Résoudre user_id : depuis la transaction ou depuis les metadata
  const resolvedUserId = tx?.user_id ?? userId
  if (!resolvedUserId) {
    console.error('[webhook] Impossible de résoudre user_id pour ref:', reference)
    return NextResponse.json({ received: true })
  }

  const txMeta = (tx?.metadata ?? meta) as Record<string, unknown>

  // Marquer la transaction réussie (ou créer si manquante)
  if (tx) {
    await admin.from('transactions').update({ status: 'success' }).eq('id', tx.id)
  } else {
    await admin.from('transactions').insert({
      user_id: resolvedUserId,
      type: 'debit',
      amount: Number(event.data?.amount ?? 0),
      currency: 'XOF',
      reference,
      status: 'success',
      metadata: txMeta,
    })
  }

  // Cas : achat de crédits
  if (txMeta.type === 'credits') {
    const creditsToAdd = Number(txMeta.credits ?? 0)
    if (creditsToAdd > 0) {
      await admin.rpc('add_credits', { user_uuid: resolvedUserId, amount: creditsToAdd })
      console.log('[webhook] Crédits ajoutés:', creditsToAdd, 'pour', resolvedUserId)
    }
    return NextResponse.json({ received: true })
  }

  // Cas : paiement QR marchand (type payment)
  if (txMeta.type === 'payment') {
    return NextResponse.json({ received: true })
  }

  // Cas : abonnement (mensuel, semestriel ou annuel)
  const plan = (txMeta.plan as string) ?? 'essential'
  // Repli (transaction sans basePlan) : noms affichés → codes internes décalés (voir lib/plan-utils.ts)
  const UI_TO_INTERNAL: Record<string, string> = { starter: 'essential', essential: 'pro', pro: 'business', business: 'agency' }
  const uiPlan = plan.replace(/_semi$|_annual$/, '')
  const basePlan = (txMeta.basePlan as string) ?? UI_TO_INTERNAL[uiPlan] ?? uiPlan
  const durationDays = Number(txMeta.durationDays ?? 30)

  const now = new Date()
  const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

  // Vérifier si abonnement actif existant (prolonger depuis period_end)
  const { data: existingSub } = await admin
    .from('subscriptions')
    .select('id, period_end')
    .eq('user_id', resolvedUserId)
    .eq('status', 'active')
    .order('period_end', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingSub) {
    const existingEnd = new Date(existingSub.period_end)
    const startFrom = existingEnd > now ? existingEnd : now
    const newPeriodEnd = new Date(startFrom.getTime() + durationDays * 24 * 60 * 60 * 1000)

    await admin.from('subscriptions').update({
      plan: basePlan,
      period_start: now.toISOString(),
      period_end: newPeriodEnd.toISOString(),
      provider_ref: reference,
    }).eq('id', existingSub.id)
  } else {
    await admin.from('subscriptions').insert({
      user_id: resolvedUserId,
      plan: basePlan,
      status: 'active',
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
      auto_renew: false,
      provider_ref: reference,
    })
  }

  // Mettre à jour le plan utilisateur
  await admin.from('profiles').update({ plan: basePlan }).eq('id', resolvedUserId)
  console.log('[webhook] Abonnement activé:', basePlan, 'pour', resolvedUserId)

  // Email de confirmation (fire-and-forget)
  const { data: authUser } = await admin.auth.admin.getUserById(resolvedUserId)
  if (authUser?.user?.email) {
    const { data: userProfile } = await admin.from('profiles').select('full_name').eq('id', resolvedUserId).single()
    sendPaymentConfirmationEmail(
      authUser.user.email,
      userProfile?.full_name ?? '',
      basePlan,
      Number(event.data?.amount ?? 0),
      reference,
    ).catch(() => {})
  }

  return NextResponse.json({ received: true })
}
