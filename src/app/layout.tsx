import type { Metadata, Viewport } from 'next'
import { Poppins, Nunito } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { isRTL, type Locale } from '@/i18n/config'
import WhatsAppBubble from '@/components/ui/WhatsAppBubble'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-nunito',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'QR CODE EXPRESS — Vos QR codes en un clic | IBIG SOFT',
  description: 'Créez, personnalisez et gérez vos QR codes professionnels. Menu restaurant, billetterie, paiement Mobile Money, formulaires. Par IBIG SOFT, Abidjan.',
  keywords: 'QR code, générateur QR, QR dynamique, menu restaurant QR, billetterie QR, paiement Mobile Money, Wave, Orange Money, MTN MoMo, Côte d\'Ivoire, Afrique',
  authors: [{ name: 'IBIG SOFT', url: 'https://qrcode-express.com' }],
  creator: 'IBIG SOFT',
  publisher: 'IBIG SOFT',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QR Express',
  },
  openGraph: {
    title: 'QR CODE EXPRESS — Vos QR codes en un clic',
    description: 'Menu, billetterie, paiement Mobile Money, formulaires. La plateforme QR professionnelle d\'Afrique.',
    siteName: 'QR CODE EXPRESS par IBIG SOFT',
    locale: 'fr_CI',
    type: 'website',
    url: 'https://qrcode-express.com',
    images: [
      {
        url: 'https://qrcode-express.com/og-default.png',
        width: 1200,
        height: 630,
        alt: 'QR CODE EXPRESS — La plateforme QR professionnelle d\'Afrique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR CODE EXPRESS',
    description: 'La plateforme QR professionnelle d\'Afrique — IBIG SOFT',
    images: ['https://qrcode-express.com/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://qrcode-express.com',
    languages: {
      'fr': 'https://qrcode-express.com',
      'en': 'https://qrcode-express.com',
      'pt': 'https://qrcode-express.com',
      'ar': 'https://qrcode-express.com',
      'x-default': 'https://qrcode-express.com',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#041B4D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

async function IntlShell({ children }: { children: React.ReactNode }) {
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${poppins.variable} ${nunito.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://frdihtzfzhmcdxyzdmay.supabase.co" />
        <link rel="dns-prefetch" href="https://frdihtzfzhmcdxyzdmay.supabase.co" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="QR Express" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <Suspense>
          <IntlShell>{children}</IntlShell>
        </Suspense>
        <Suspense><WhatsAppBubble /></Suspense>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
          }
        `}} />
      </body>
    </html>
  )
}
