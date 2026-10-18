import { NextRequest, NextResponse } from 'next/server'
import { requirePlan, LABEL_CREDIT_COST } from '@/lib/plan-guard'

// POST /api/label/check-access — verify auth + plan/credits before generating a label PDF
// Body: { templateMinPlan: 'starter' | 'essential' | 'pro' | 'free' }
// UI tier 'starter' = internal 'essential', 'essential' = 'pro', 'pro' = 'business'
const UI_TIER_TO_PLAN: Record<string, 'essential' | 'pro' | 'business'> = {
  starter: 'essential',
  essential: 'pro',
  pro: 'business',
}

export async function POST(req: NextRequest) {
  const { templateMinPlan } = await req.json()

  // Free templates: allow all (watermark handled client-side for free users)
  if (!templateMinPlan || templateMinPlan === 'free') {
    return NextResponse.json({ ok: true })
  }

  const minPlan = UI_TIER_TO_PLAN[templateMinPlan]
  if (!minPlan) {
    return NextResponse.json({ ok: true })
  }

  const { ok, error: planError } = await requirePlan(minPlan, LABEL_CREDIT_COST)
  if (!ok) return planError

  return NextResponse.json({ ok: true })
}
