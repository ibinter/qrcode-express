// Shared plan mapping utilities — no server-side imports, safe for client and server components

/** UI display names for internal Supabase plan codes */
export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free:       'Gratuit',
  essential:  'Starter',
  pro:        'Essentiel',
  business:   'Pro',
  agency:     'Business',
  enterprise: 'Enterprise',
}

/** Converts a Supabase internal plan name to its UI tier name (used in PlanGate.tsx).
 *  essential→starter, pro→essential, business→pro, agency→business */
export const INTERNAL_TO_UI_TIER: Record<string, 'free' | 'starter' | 'essential' | 'pro' | 'business'> = {
  free:       'free',
  essential:  'starter',
  pro:        'essential',
  business:   'pro',
  agency:     'business',
  enterprise: 'business',
}
