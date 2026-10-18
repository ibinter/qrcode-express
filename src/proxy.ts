import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale, type Locale } from './i18n/config'

const BYPASS_PREFIXES = [
  '/api/',
  '/_next/',
  '/favicon',
  '/icon',
  '/manifest',
  '/robots',
  '/sitemap',
  '/sw.js',
]

const AUTH_ROUTES = ['/dashboard', '/profil', '/facturation']
const ADMIN_ROUTES = ['/admin']

function isProtected(pathname: string, routes: string[]) {
  return routes.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return addSecurityHeaders(NextResponse.next({ request }))
  }

  // ── Auth guard ─────────────────────────────────────────────────────────────
  const needsAuth = isProtected(pathname, AUTH_ROUTES) || isProtected(pathname, ADMIN_ROUTES)
  if (needsAuth) {
    const res = NextResponse.next({ request })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
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
      const login = request.nextUrl.clone()
      login.pathname = '/connexion'
      login.searchParams.set('next', pathname)
      return NextResponse.redirect(login)
    }

    if (isProtected(pathname, ADMIN_ROUTES)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return addSecurityHeaders(res)
  }

  // ── Locale detection ───────────────────────────────────────────────────────
  const langParam = request.nextUrl.searchParams.get('lang')
  if (langParam && locales.includes(langParam as Locale)) {
    const response = NextResponse.redirect(new URL(pathname, request.url))
    response.cookies.set('NEXT_LOCALE', langParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return addSecurityHeaders(response)
  }

  const cookie = request.cookies.get('NEXT_LOCALE')?.value as Locale | undefined
  let locale: Locale = defaultLocale

  if (cookie && locales.includes(cookie)) {
    locale = cookie
  } else {
    const acceptLang = request.headers.get('accept-language') ?? ''
    const primary = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase()
    if (primary && locales.includes(primary as Locale)) {
      locale = primary as Locale
    }
  }

  return addSecurityHeaders(
    NextResponse.next({
      request: {
        headers: new Headers({
          ...Object.fromEntries(request.headers.entries()),
          'x-locale': locale,
        }),
      },
    }),
  )
}

function addSecurityHeaders(res: NextResponse) {
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
