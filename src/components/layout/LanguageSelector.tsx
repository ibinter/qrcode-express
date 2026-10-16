'use client'
import { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useLocale } from 'next-intl'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config'

function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
  window.location.reload()
}

export default function LanguageSelector() {
  const currentLocale = useLocale() as Locale
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors"
        aria-label="Language"
        aria-expanded={open}
      >
        <Globe size={15} />
        <span className="hidden sm:inline">{localeFlags[currentLocale]}</span>
        <span className="text-xs font-semibold uppercase">{currentLocale}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 min-w-[140px]">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => {
                setOpen(false)
                if (locale !== currentLocale) setLocaleCookie(locale)
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                locale === currentLocale ? 'font-bold text-[#FF6A00]' : 'text-gray-700'
              }`}
            >
              <span>{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
              {locale === currentLocale && <span className="ml-auto text-[#FF6A00]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
