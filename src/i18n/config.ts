export const locales = ['fr', 'en', 'ar', 'pt'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
  pt: 'Português',
}

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  ar: '🇸🇦',
  pt: '🇧🇷',
}

export const rtlLocales: Locale[] = ['ar']

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale)
}
