import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  alternates: { canonical: 'https://qrcode-express.com' },
}

const FAQ_ITEMS = [
  { q: 'Est-ce que QR CODE EXPRESS est gratuit ?', a: 'Oui ! Le plan gratuit vous permet de créer jusqu\'à 3 QR codes statiques sans limite de temps, sans carte bancaire. Les QR dynamiques et les analytics sont disponibles dès le plan Essentiel à partir de 1 500 FCFA/mois.' },
  { q: 'Quelle est la différence entre un QR statique et un QR dynamique ?', a: 'Un QR statique pointe vers une adresse fixe et ne peut pas être modifié après impression. Un QR dynamique vous permet de modifier la destination depuis votre tableau de bord sans jamais réimprimer.' },
  { q: 'Quels modes de paiement sont acceptés ?', a: 'Wave CI, Orange Money, MTN MoMo et Moov Money pour votre abonnement. Pour les QR de paiement que vous créez : Wave, Orange Money et MTN MoMo.' },
  { q: 'Mes QR codes fonctionnent-ils si j\'arrête mon abonnement ?', a: 'Les QR statiques restent actifs indéfiniment. Les QR dynamiques passent en mode pause mais reprennent dès le renouvellement. Vos données sont conservées.' },
  { q: 'Comment fonctionne la billetterie QR ?', a: 'Créez votre événement, définissez le nombre de places. Vos participants reçoivent un billet QR unique. À l\'entrée, le contrôleur scanne et le système valide instantanément.' },
  { q: 'Y a-t-il une limite de scans par QR code ?', a: 'Non, il n\'y a pas de limite de scans sur les plans payants. Vos QR peuvent être scannés un nombre illimité de fois.' },
]

const HOME_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'QR CODE EXPRESS',
    url: 'https://qrcode-express.com',
    description: 'Créez, personnalisez et gérez vos QR codes professionnels. Menu restaurant, billetterie, paiement Mobile Money, formulaires.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://qrcode-express.com/guide?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IBIG SOFT',
    url: 'https://qrcode-express.com',
    logo: 'https://qrcode-express.com/icon-192.png',
    sameAs: ['https://qrcode-express.com'],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+225-07-79-38-07-04',
      contactType: 'customer support',
      availableLanguage: ['French', 'English', 'Arabic'],
      areaServed: ['CI', 'SN', 'ML', 'BF', 'TG', 'BJ', 'GN', 'CM'],
    },
    address: { '@type': 'PostalAddress', addressCountry: 'CI', addressLocality: 'Abidjan' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
]
import Hero from '@/components/home/Hero'
import StatsBar from '@/components/home/StatsBar'
import ShowcaseSlider from '@/components/home/ShowcaseSlider'
import QRGeneratorClient from '@/components/qr/QRGeneratorClient'
import Features from '@/components/home/Features'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/home/Testimonials'
import Pricing from '@/components/home/Pricing'
import FAQ from '@/components/home/FAQ'
import CTAFinal from '@/components/home/CTAFinal'
import Footer from '@/components/layout/Footer'

export default async function HomePage() {
  const t = await getTranslations('generator')
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
      />
      <Header />
      <Hero />
      <StatsBar />
      <ShowcaseSlider />
      <section id="generateur" className="relative py-16 px-4 bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04] blur-3xl pointer-events-none"
          style={{ background: '#FF6A00' }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-orange-50 text-[#FF6A00] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-orange-100">
              ✦ Générateur gratuit
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
              {t('title')}
            </h2>
            <p className="text-gray-500 text-lg">{t('subtitle')}</p>
          </div>
          <QRGeneratorClient />
        </div>
      </section>
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTAFinal />
      <Footer />
    </main>
  )
}
