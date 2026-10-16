import { headers } from 'next/headers'
import type { Lang } from './i18n'

export async function getLang(): Promise<Lang> {
  try {
    const h = await headers()
    const accept = h.get('accept-language') || ''
    const primary = accept.split(',')[0]?.split(';')[0]?.toLowerCase().trim() ?? 'fr'
    if (primary.startsWith('ar')) return 'ar'
    if (primary.startsWith('en')) return 'en'
    return 'fr'
  } catch {
    return 'fr'
  }
}
