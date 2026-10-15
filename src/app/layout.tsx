import type { Metadata, Viewport } from 'next'
import { Poppins, Nunito } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'QR CODE EXPRESS — Vos QR codes en un clic | IBIG SOFT',
  description: 'Créez, personnalisez et gérez vos QR codes professionnels. Menu restaurant, billetterie, paiement Mobile Money, formulaires. Par IBIG SOFT, Abidjan.',
  keywords: 'QR code, générateur QR, QR dynamique, menu restaurant QR, billetterie QR, paiement Mobile Money, Wave, Orange Money, MTN MoMo, Côte d\'Ivoire, Afrique',
  authors: [{ name: 'IBIG SOFT', url: 'https://qrcode-express-ibig.vercel.app' }],
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR CODE EXPRESS',
    description: 'La plateforme QR professionnelle d\'Afrique — IBIG SOFT',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#041B4D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${nunito.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="QR Express" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
