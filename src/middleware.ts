import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/dashboard', '/profil', '/facturation', '/guide']

function isProtected(pathname: string, routes: string[]) {
  return routes.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Security headers ──────────────────────────────────────────────────────
  const res = NextResponse.next()
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  )

  // ── Rate-limit hint header (actual rate limiting via Vercel/Supabase) ─────
  res.headers.set('X-RateLimit-Policy', 'standard')

  const needsAuth = isProtected(pathname, AUTH_ROUTES) || isProtected(pathname, ADMIN_ROUTES)
  if (!needsAuth) return res

  // ── Auth check via Supabase SSR ───────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const login = req.nextUrl.clone()
    login.pathname = '/connexion'
    login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  // ── Admin guard — only allow users with role=admin ────────────────────────
  if (isProtected(pathname, ADMIN_ROUTES)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profil/:path*',
    '/facturation/:path*',
    '/guide/:path*',
    '/admin/:path*',
    // Apply security headers to all non-static routes
    '/((?!_next/static|_next/image|favicon|icon|manifest|sw\\.js|apple|robots|sitemap).*)',
  ],
}
