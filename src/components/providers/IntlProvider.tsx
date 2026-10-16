import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { isRTL, type Locale } from '@/i18n/config'

export async function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = await getLocale() as Locale
  const messages = await getMessages()
  const dir = isRTL(locale) ? 'rtl' : 'ltr'

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div lang={locale} dir={dir} style={{ display: 'contents' }}>
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
