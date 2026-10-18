'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { INTERNAL_TO_UI_TIER } from '@/lib/plan-utils'

export type PlanTier = 'free' | 'starter' | 'essential' | 'pro' | 'business'

const PLAN_ORDER: PlanTier[] = ['free', 'starter', 'essential', 'pro', 'business']

function tierFromPlanId(planId: string | null): PlanTier {
  if (!planId) return 'free'
  if (planId.startsWith('business')) return 'business'
  if (planId.startsWith('pro')) return 'pro'
  if (planId.startsWith('essential')) return 'essential'
  if (planId.startsWith('starter')) return 'starter'
  return 'free'
}

export function tierAtLeast(userTier: PlanTier, required: PlanTier) {
  return PLAN_ORDER.indexOf(userTier) >= PLAN_ORDER.indexOf(required)
}

export function usePlan() {
  const [tier, setTier] = useState<PlanTier>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return }

      // Primary: active subscription record
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_id, status')
        .eq('user_id', data.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (sub?.plan_id) {
        setTier(tierFromPlanId(sub.plan_id))
        setLoading(false)
        return
      }

      // Fallback: profiles.plan (set by admin or manual upgrade)
      // profiles.plan uses internal names — translate via INTERNAL_TO_UI_TIER before comparing
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', data.user.id)
        .single()
      const planVal = profile?.plan as string | null
      if (planVal) {
        const uiTier = INTERNAL_TO_UI_TIER[planVal]
        if (uiTier) setTier(uiTier)
      }
      setLoading(false)
    })
  }, [])

  return { tier, loading }
}

const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Gratuit',
  starter: 'Starter',
  essential: 'Essentiel',
  pro: 'Pro',
  business: 'Business',
}

const PLAN_COLORS: Record<PlanTier, string> = {
  free: '#64748b',
  starter: '#3b82f6',
  essential: '#0ea5e9',
  pro: '#FF6A00',
  business: '#041B4D',
}

interface UpgradeBannerProps {
  requiredTier: PlanTier
  currentTier: PlanTier
  featureName: string
}

export function UpgradeBanner({ requiredTier, currentTier, featureName }: UpgradeBannerProps) {
  if (tierAtLeast(currentTier, requiredTier)) return null
  return (
    <div className="rounded-xl border border-[#FF6A00]/30 bg-orange-50 px-4 py-3 flex items-center gap-3 text-sm">
      <span className="text-xl flex-shrink-0">🔒</span>
      <div className="flex-1">
        <span className="font-semibold text-[#041B4D]">{featureName}</span>
        <span className="text-gray-500"> — disponible à partir du plan </span>
        <span className="font-bold" style={{ color: PLAN_COLORS[requiredTier] }}>{PLAN_LABELS[requiredTier]}</span>
      </div>
      <Link
        href="/tarifs"
        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
      >
        Passer au {PLAN_LABELS[requiredTier]} →
      </Link>
    </div>
  )
}

interface LockBadgeProps {
  requiredTier: PlanTier
  currentTier: PlanTier
}

export function LockBadge({ requiredTier, currentTier }: LockBadgeProps) {
  if (tierAtLeast(currentTier, requiredTier)) return null
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-[#b84d00] ml-1">
      🔒 {PLAN_LABELS[requiredTier]}
    </span>
  )
}

interface PlanHeaderBannerProps {
  currentTier: PlanTier
  toolName: string
  freeLimit: string
  starterLimit?: string
  essentialLimit?: string
}

export function PlanHeaderBanner({ currentTier, toolName, freeLimit, starterLimit, essentialLimit }: PlanHeaderBannerProps) {
  const isFree = currentTier === 'free'
  const isStarter = currentTier === 'starter'
  const isEssential = currentTier === 'essential'

  if (!isFree && !isStarter && !(isEssential && essentialLimit)) return null

  const limit = isFree ? freeLimit : isStarter ? starterLimit : essentialLimit

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-lg">ℹ️</span>
        <div className="text-sm">
          <span className="font-semibold text-[#041B4D]">Plan {PLAN_LABELS[currentTier]} — {toolName} : </span>
          <span className="text-gray-600">{limit}</span>
        </div>
      </div>
      <Link
        href="/tarifs"
        className="flex-shrink-0 text-xs font-bold text-[#FF6A00] hover:underline whitespace-nowrap"
      >
        Voir les plans premium →
      </Link>
    </div>
  )
}
