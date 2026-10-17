import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Pricing from '@/components/home/Pricing'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Tarifs & Plans QR CODE EXPRESS | Gratuit, Starter, Essentiel, Pro, Business',
  description: 'Découvrez les plans QR CODE EXPRESS : Gratuit, Starter (4 900 FCFA), Essentiel, Pro et Business. QR codes, codes-barres, étiquettes PDF. Paiement Wave, Orange Money, MTN MoMo.',
  openGraph: {
    title: 'Tarifs & Plans | QR CODE EXPRESS',
    description: 'Plans à partir de 4 900 FCFA/mois. QR codes, 26 formats codes-barres, 31 gabarits. Mobile Money accepté.',
    url: 'https://qrcode-express.com/tarifs',
    type: 'website',
    images: [{ url: 'https://qrcode-express.com/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Tarifs | QR CODE EXPRESS' },
  alternates: { canonical: 'https://qrcode-express.com/tarifs' },
}

export default function TarifsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-8">
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
