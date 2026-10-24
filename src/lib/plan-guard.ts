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

import { PLAN_DISPLAY_NAMES } from '@/lib/plan-utils'

const PLAN_NAMES: Record<Plan, string> = PLAN_DISPLAY_NAMES as Record<Plan, string>

// Static QR limits per plan (undefined = unlimited)
export const STATIC_QR_LIMITS: Partial<Record<Plan, number>> = {
  free: 5,
  essential: 20,  // UI Starter
  pro: 100,       // UI Essentiel
  // business / agency / enterprise = unlimited
}

// Dynamic QR limits per plan (undefined = unlimited)
export const DYNAMIC_QR_LIMITS: Partial<Record<Plan, number>> = {
  free: 0,
  essential: 5,
  pro: 20,
  business: 100,
  // agency / enterprise = unlimited (not in the object)
}

/**
 * Credit cost per QR type creation (charged when plan is insufficient).
 * Minimum 30 credits to ensure ≥ 350 FCFA at the best pack rate (12 FCFA/credit).
 */
export const QR_TYPE_CREDIT_COST: Partial<Record<string, number>> = {
  giftcard: 30, job: 30,
  ticket: 35, appointment: 35, download: 35,
  loyalty: 50, survey: 50,
  menu: 35, coupon: 35, biolink: 35, vcard_plus: 35,
  catalog: 35, review: 35, event: 35, lead: 35,
  payment: 50, gallery: 35, video: 35, audio: 35,
}

/**
 * Barcode type → minimum plan required for download (server-side internal names).
 * UI 'starter' = internal 'essential', UI 'essential' = internal 'pro'.
 */
export const BARCODE_MIN_PLAN: Partial<Record<string, Plan>> = {
  ean8: 'essential', upca: 'essential', upce: 'essential',
  code39: 'essential', code39ext: 'essential', code93: 'essential',
  codabar: 'essential', interleaved2of5: 'essential',
  itf14: 'pro', code93ext: 'pro', code11: 'pro', industrial2of5: 'pro',
  code32: 'pro', ean128: 'pro', sscc18: 'pro', isbn: 'pro',
  msimodified: 'pro', datamatrix: 'pro', gs1datamatrix: 'pro',
  pdf417: 'pro', postnet: 'pro', planet: 'pro', qrcode: 'pro', azteccode: 'pro',
}

export const BARCODE_CREDIT_COST: Partial<Record<string, number>> = {
  ean8: 30, upca: 30, upce: 30, code39: 30, code39ext: 30, code93: 30,
  codabar: 30, interleaved2of5: 30,
  itf14: 35, code93ext: 35, code11: 35, industrial2of5: 35, code32: 35,
  ean128: 35, sscc18: 35, isbn: 35, msimodified: 35, datamatrix: 35,
  gs1datamatrix: 35, pdf417: 35, postnet: 35, planet: 35, qrcode: 35, azteccode: 35,
}

/** Credit cost for a label PDF without watermark (≥350 FCFA at best pack rate). */
export const LABEL_CREDIT_COST = 30

/**
 * QR types unlocked per minimum plan level.
 * Types not listed here are available to all plans (static generation).
 */
export const QR_TYPE_MIN_PLAN: Partial<Record<string, Plan>> = {
  // Starter (essential) — simple landing pages, no persistent DB
  giftcard: 'essential',
  job: 'essential',

  // Essentiel (pro) — landing pages with tracking/organisation features
  ticket: 'pro',
  appointment: 'pro',
  download: 'pro',

  // Pro (business) — real-time customer interaction with persistent data
  loyalty: 'business',
  survey: 'business',

  // Already gated types (existing)
  menu: 'pro',
  coupon: 'pro',
  biolink: 'pro',
  vcard_plus: 'pro',
  catalog: 'pro',
  review: 'pro',
  event: 'pro',
  lead: 'pro',
  payment: 'business',
  gallery: 'pro',
  video: 'pro',
  audio: 'pro',
}

/**
 * Returns the minimum plan required for a QR type, or 'free' if unrestricted.
 */
export function getMinPlanForType(type: string): Plan {
  return QR_TYPE_MIN_PLAN[type] ?? 'free'
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
  if ((PLAN_RANK[userPlan] ?? 0) >= PLAN_RANK[minPlan]) {
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
