import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type Plan = 'free' | 'essential' | 'pro' | 'business' | 'agency' | 'enterprise'

const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  essential: 1,
  pro: 2,
  business: 3,
  agency: 4,
  enterprise: 5,
}

const PLAN_NAMES: Record<Plan, string> = {
  free: 'Gratuit',
  essential: 'Essentiel',
  pro: 'Pro',
  business: 'Business',
  agency: 'Agency',
  enterprise: 'Enterprise',
}

// Dynamic QR limits per plan (undefined = unlimited)
export const DYNAMIC_QR_LIMITS: Partial<Record<Plan, number>> = {
  free: 0,
  essential: 5,
  pro: 50,
}

type UserProfile = { id: string; plan: Plan; email: string; credits: number }

type GuardResult =
  | { ok: true; user: UserProfile; usedCredits: boolean; error: undefined }
  | { ok: false; user: undefined; usedCredits: false; error: NextResponse }

/**
 * Verifies auth + minimum plan.
 * If plan is insufficient but creditCost > 0 and user has enough credits → debit & allow.
 * Returns { ok, user, usedCredits } or { ok: false, error }.
 */
export async function requirePlan(minPlan: Plan, creditCost = 0): Promise<GuardResult> {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return { ok: false as const, user: undefined, usedCredits: false as const,
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, plan, credits')
    .eq('id', authUser.id)
    .single()

  const userPlan = (profile?.plan ?? 'free') as Plan
  const userCredits = profile?.credits ?? 0

  // Plan is sufficient → allow without credits
  if (PLAN_RANK[userPlan] >= PLAN_RANK[minPlan]) {
    return {
      ok: true as const,
      user: { id: authUser.id, plan: userPlan, email: authUser.email ?? '', credits: userCredits },
      usedCredits: false as const,
      error: undefined,
    }
  }

  // Plan insufficient but credit fallback available
  if (creditCost > 0 && userCredits >= creditCost) {
    await admin.rpc('add_credits', { user_uuid: authUser.id, amount: -creditCost })
    return {
      ok: true as const,
      user: { id: authUser.id, plan: userPlan, email: authUser.email ?? '', credits: userCredits - creditCost },
      usedCredits: true as const,
      error: undefined,
    }
  }

  // Determine error message
  const needsUpgrade = creditCost === 0 || userCredits < creditCost
  const errorMsg = creditCost > 0
    ? `Cette fonctionnalité nécessite le plan ${PLAN_NAMES[minPlan]} ou ${creditCost} crédit${creditCost > 1 ? 's' : ''} (solde actuel : ${userCredits}).`
    : `Cette fonctionnalité nécessite le plan ${PLAN_NAMES[minPlan]} ou supérieur.`

  return {
    ok: false as const,
    user: undefined,
    usedCredits: false as const,
    error: NextResponse.json(
      {
        error: errorMsg,
        requiredPlan: minPlan,
        currentPlan: userPlan,
        creditCost,
        currentCredits: userCredits,
        upgradeUrl: '/tarifs',
        rechargeUrl: '/portefeuille',
      },
      { status: 403 }
    ),
  }
}
