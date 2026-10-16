import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Features from '@/components/home/Features'
import HowItWorks from '@/components/home/HowItWorks'
import ShowcaseSlider from '@/components/home/ShowcaseSlider'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Fonctionnalités QR CODE EXPRESS | Billetterie, Paiement, Menu, Analytics',
  description: 'Billetterie QR, paiements Wave & Orange Money, menus digitaux, vCard, formulaires, analytics avancés — tout ce que QR CODE EXPRESS peut faire pour votre business.',
  openGraph: {
    title: 'Fonctionnalités | QR CODE EXPRESS',
    description: "Billetterie, paiement Mobile Money, menu digital, analytics — la plateforme QR complète d'Afrique.",
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
