import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getIp } from '@/lib/rate-limit'
import { sendReferralNotificationEmail } from '@/lib/email'

const REFERRER_CREDITS = 50
const REFERRED_CREDITS = 20

export async function POST(req: NextRequest) {
  // 5 referral claims per IP per day
  const { ok } = rateLimit(`ref:${getIp(req)}`, 5, 24 * 60 * 60 * 1000)
  if (!ok) return NextResponse.json({ error: 'Trop de tentatives. Réessayez demain.' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { referral_code } = await req.json()
  if (!referral_code?.trim()) return NextResponse.json({ error: 'Code requis' }, { status: 400 })

  const admin = createAdminClient()

  // Check this user hasn't already been referred
  const { data: existing } = await admin
    .from('referral_rewards')
    .select('id')
    .eq('referred_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Vous avez déjà été parrainé' }, { status: 409 })
  }

  // Find referrer by code (cannot refer yourself)
  const { data: referrer } = await admin
    .from('profiles')
    .select('id')
    .eq('referral_code', referral_code.trim().toUpperCase())
    .neq('id', user.id)
    .single()

  if (!referrer) {
    return NextResponse.json({ error: 'Code de parrainage invalide' }, { status: 404 })
  }

  // Update referred_by on the new user
  await admin.from('profiles').update({ referred_by: referrer.id }).eq('id', user.id)

  // Give welcome bonus to referred user
  await admin.rpc('add_credits', { user_uuid: user.id, amount: REFERRED_CREDITS })

  // Give reward credits to referrer
  await admin.rpc('add_credits', { user_uuid: referrer.id, amount: REFERRER_CREDITS })

  // Record the reward
  await admin.from('referral_rewards').insert({
    referrer_id: referrer.id,
    referred_id: user.id,
    credits_given: REFERRER_CREDITS,
    bonus_given: REFERRED_CREDITS,
    status: 'confirmed',
  })

  // Count total confirmed referrals for this referrer
  const { count: totalReferrals } = await admin
    .from('referral_rewards')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', referrer.id)
    .eq('status', 'confirmed')

  // Fetch referrer email + names for notification
  const { data: referrerAuth } = await admin.auth.admin.getUserById(referrer.id)
  const { data: referrerProfile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', referrer.id)
    .single()
  const { data: referredProfile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  if (referrerAuth?.user?.email) {
    sendReferralNotificationEmail(
      referrerAuth.user.email,
      referrerProfile?.full_name ?? '',
      referredProfile?.full_name ?? user.email ?? 'Anonyme',
      REFERRER_CREDITS,
      totalReferrals ?? 1,
    ).catch(() => {})
  }

  return NextResponse.json({ ok: true, credits_earned: REFERRED_CREDITS })
}
