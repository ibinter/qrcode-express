import type { Metadata } from 'next'
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
  title: 'QR CODE EXPRESS — Vos QR codes en un clic',
  description: 'Créez, personnalisez et gérez vos QR codes gratuitement. Générateur QR professionnel par IBIG SOFT.',
  keywords: 'QR code, générateur QR, QR dynamique, QR code gratuit, Côte d\'Ivoire',
  openGraph: {
    title: 'QR CODE EXPRESS',
    description: 'Vos QR codes en un clic',
    siteName: 'QR CODE EXPRESS par IBIG SOFT',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${nunito.variable}`}>
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
