import { NextRequest, NextResponse } from 'next/server'
import { requirePlan, LABEL_CREDIT_COST } from '@/lib/plan-guard'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/label/check-access — verify auth + plan/credits before generating a label PDF
// Body: { templateMinPlan: 'starter' | 'essential' | 'pro' | 'free' }
// Returns { ok: true, isStarterPlus: boolean } — client uses isStarterPlus for label limit and watermark
// UI tier 'starter' = internal 'essential', 'essential' = 'pro', 'pro' = 'business'
const UI_TIER_TO_PLAN: Record<string, 'essential' | 'pro' | 'business'> = {
  starter: 'essential',
  essential: 'pro',
  pro: 'business',
}

const PLAN_RANK: Record<string, number> = {
  free: 0, essential: 1, pro: 2, business: 3, agency: 4, enterprise: 5,
}

export async function POST(req: NextRequest) {
  const { templateMinPlan } = await req.json()

  // Free templates: determine user plan server-side for label limit and watermark decision
  if (!templateMinPlan || templateMinPlan === 'free') {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ ok: true, isStarterPlus: false })
      const admin = createAdminClient()
      const { data: profile } = await admin.from('profiles').select('plan').eq('id', user.id).single()
      const isStarterPlus = (PLAN_RANK[profile?.plan ?? 'free'] ?? 0) >= 1
      return NextResponse.json({ ok: true, isStarterPlus })
    } catch {
      return NextResponse.json({ ok: true, isStarterPlus: false })
    }
  }

  const minPlan = UI_TIER_TO_PLAN[templateMinPlan]
  if (!minPlan) return NextResponse.json({ ok: true, isStarterPlus: true })

  const { ok, error: planError } = await requirePlan(minPlan, LABEL_CREDIT_COST)
  if (!ok) return planError

  return NextResponse.json({ ok: true, isStarterPlus: true })
}
