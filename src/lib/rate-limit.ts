/**
 * Simple in-memory rate limiter.
 * Works per Vercel serverless instance — not distributed, but effective against naive abuse.
 * For production-grade limiting, use Upstash Redis.
 */

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>()

// Clean up expired entries periodically
function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  cleanup()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }

  entry.count++
  const remaining = Math.max(0, limit - entry.count)
  return { ok: entry.count <= limit, remaining }
}

/** Extract a stable key from the request: IP + optional suffix */
export function getIp(request: Request): string {
  const h = request.headers
  return (
    h.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('cf-connecting-ip') ||
    'unknown'
  )
}
