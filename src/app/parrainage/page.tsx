import type { Metadata } from 'next'
﻿import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import ReferralDashboard from './ReferralDashboard'


export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const instant = false

const REFERRER_CREDITS = 50   // credits given to referrer per signup
const REFERRED_CREDITS = 20   // welcome bonus for new user

export default async function ParrainagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const admin = createAdminClient()

  let { data: profile } = await admin
    .from('profiles')
    .select('referral_code, credits, full_name')
    .eq('id', user.id)
    .single()

  // Ensure profile exists and has a referral_code
  if (!profile || !profile.referral_code) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    const { data: upserted } = await admin
      .from('profiles')
      .upsert(
        { id: user.id, referral_code: code },
        { onConflict: 'id', ignoreDuplicates: false }
      )
      .select('referral_code, credits, full_name')
      .single()
    if (upserted) profile = upserted
    else {
      // upsert may not return if referral_code was already set by concurrent request — refetch
      const { data: refetched } = await admin
        .from('profiles')
        .select('referral_code, credits, full_name')
        .eq('id', user.id)
        .single()
      if (refetched) profile = refetched
    }
  }

  // Referrals I made
  const { data: rewards } = await admin
    .from('referral_rewards')
    .select('id, credits_given, status, created_at, referred_id, profiles!referred_id(full_name)')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  const totalEarned = (rewards || [])
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.credits_given, 0)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express.com'
  const referralLink = `${appUrl}/inscription?ref=${profile?.referral_code || ''}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-[#041B4D] mb-1">🎁 Parrainage</h1>
        <p className="text-sm text-gray-500 mb-6">
          Invitez vos amis et gagnez <strong>{REFERRER_CREDITS} crédits</strong> pour chaque inscription confirmée.
          Votre filleul reçoit <strong>{REFERRED_CREDITS} crédits</strong> de bienvenue.
        </p>

        <ReferralDashboard
          referralCode={profile?.referral_code || ''}
          referralLink={referralLink}
          totalEarned={totalEarned}
          totalReferrals={(rewards || []).length}
          confirmedReferrals={(rewards || []).filter((r) => r.status === 'confirmed').length}
          currentCredits={profile?.credits || 0}
          rewards={(rewards || []).map((r) => ({
            id: r.id,
            status: r.status,
            credits_given: r.credits_given,
            created_at: r.created_at,
            referred_name: ((Array.isArray(r.profiles) ? r.profiles[0] : r.profiles) as { full_name: string | null } | null)?.full_name ?? null,
          }))}
          referrerCredits={REFERRER_CREDITS}
          referredCredits={REFERRED_CREDITS}
        />
      </div>
  </div>
  )
}
