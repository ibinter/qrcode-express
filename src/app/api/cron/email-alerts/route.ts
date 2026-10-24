import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendQuotaWarningEmail, sendPlanExpirationEmail } from '@/lib/email'

// Called by Vercel Cron or external cron service — protected by CRON_SECRET
export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()

  // --- Quota warnings (sent when user reaches 80% of their plan's QR limit) ---
  const PLAN_LIMITS: Record<string, number> = {
    free: 3, essential: 10, pro: 50, business: 200, agency: 1000, enterprise: 9999,
  }

  const { data: profiles } = await admin.from('profiles').select('id, plan, credits, full_name')

  let quotaAlerts = 0
  let expirationAlerts = 0

  if (profiles) {
    for (const profile of profiles) {
      const limit = PLAN_LIMITS[profile.plan] ?? 3
      const { count } = await admin.from('qr_codes').select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id).neq('status', 'archived')
      const used = count ?? 0
      const pct = used / limit

      if (pct >= 0.8 && pct < 1.0) {
        const { data: authUser } = await admin.auth.admin.getUserById(profile.id)
        if (authUser?.user?.email) {
          await sendQuotaWarningEmail(authUser.user.email, profile.full_name ?? '', used, limit, profile.plan)
          quotaAlerts++
        }
      }
    }
  }

  // --- Fin effective des abonnements : période terminée → statut « expired » et retour au plan gratuit ---
  const nowTs = new Date().toISOString()
  const { data: ended } = await admin.from('subscriptions').select('id, user_id').eq('status', 'active').lt('period_end', nowTs)
  let expiredCount = 0
  for (const sub of ended ?? []) {
    await admin.from('subscriptions').update({ status: 'expired' }).eq('id', sub.id)
    const { count: stillActive } = await admin.from('subscriptions').select('id', { count: 'exact', head: true }).eq('user_id', sub.user_id).eq('status', 'active')
    if (!stillActive) await admin.from('profiles').update({ plan: 'free' }).eq('id', sub.user_id)
    expiredCount++
  }

  // --- Expiration warnings (3 days and 1 day before plan expiry) ---
  const now = new Date()
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)

  const { data: subs } = await admin.from('subscriptions')
    .select('user_id, plan, period_end')
    .eq('status', 'active')
    .gte('period_end', now.toISOString())
    .lte('period_end', in3Days.toISOString())

  for (const sub of subs ?? []) {
    const periodEnd = new Date(sub.period_end)
    const msLeft = periodEnd.getTime() - now.getTime()
    const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000))

    if (daysLeft <= 3) {
      const { data: authUser } = await admin.auth.admin.getUserById(sub.user_id)
      if (authUser?.user?.email) {
        const { data: profile } = await admin.from('profiles').select('full_name').eq('id', sub.user_id).single()
        await sendPlanExpirationEmail(authUser.user.email, profile?.full_name ?? '', sub.plan, daysLeft)
        expirationAlerts++
      }
    }
  }

  return NextResponse.json({ ok: true, quotaAlerts, expirationAlerts })
}
