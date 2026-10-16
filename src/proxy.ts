import { NextResponse, type NextRequest } from 'next/server'
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request })
  }

  const langParam = request.nextUrl.searchParams.get('lang')
  if (langParam && locales.includes(langParam as Locale)) {
    const response = NextResponse.redirect(new URL(pathname, request.url))
    response.cookies.set('NEXT_LOCALE', langParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return response
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

  return NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers.entries()),
        'x-locale': locale,
      }),
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
