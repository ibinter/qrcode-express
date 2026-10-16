import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { defaultLocale, locales, type Locale } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headersList = await headers()

  // 1. Cookie (user-selected)
  let locale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined

  // 2. Accept-Language header fallback
  if (!locale || !locales.includes(locale)) {
    const acceptLang = headersList.get('accept-language') ?? ''
    const primary = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase()
    if (primary && locales.includes(primary as Locale)) {
      locale = primary as Locale
    }
  }

  // 3. Default
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
