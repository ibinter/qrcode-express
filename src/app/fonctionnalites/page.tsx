import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Features from '@/components/home/Features'
import HowItWorks from '@/components/home/HowItWorks'
import ShowcaseSlider from '@/components/home/ShowcaseSlider'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Fonctionnalités QR CODE EXPRESS | QR codes, Codes-barres, Étiquettes, Analytics',
  description: 'QR codes professionnels, 26 formats de codes-barres, 31 gabarits d\'étiquettes PDF, billetterie, paiements Wave & Orange Money, menus digitaux, analytics avancés.',
  openGraph: {
    title: 'Fonctionnalités | QR CODE EXPRESS',
    description: "QR codes, 26 formats codes-barres, 31 gabarits étiquettes, billetterie, Mobile Money — la plateforme complète d'Afrique.",
    url: 'https://qrcode-express.com/fonctionnalites',
    type: 'website',
    images: [{ url: 'https://qrcode-express.com/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Fonctionnalités | QR CODE EXPRESS' },
  alternates: { canonical: 'https://qrcode-express.com/fonctionnalites' },
}

export default function FonctionnalitesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <ShowcaseSlider />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </>
  )
}
