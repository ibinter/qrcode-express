import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  alternates: { canonical: 'https://qrcode-express.com' },
}

const FAQ_ITEMS = [
  { q: 'Est-ce que QR CODE EXPRESS est gratuit ?', a: 'Oui ! Le plan gratuit vous permet de créer des QR codes statiques, 2 codes-barres (EAN-13 et Code 128) et 2 gabarits d\'étiquettes sans carte bancaire. Les fonctions avancées (QR dynamiques, 26 formats de codes-barres, 31 gabarits, analytics) sont disponibles dès le plan Starter à 4 900 FCFA/mois.' },
  { q: 'Quels formats de codes-barres sont disponibles ?', a: 'La plateforme supporte 26 formats : EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, Code 93, Code 11, Codabar, ITF-14, GS1-128, SSCC-18, ISBN, Data Matrix, GS1 DataMatrix, PDF417, POSTNET, PLANET, QR Code, Aztec et plus. Export PNG haute résolution ou SVG vectoriel.' },
  { q: 'Comment fonctionnent les étiquettes ?', a: 'Choisissez parmi 31 gabarits répartis en 10 catégories (commerce, pharmacie, mode, bijoux, logistique…), uploadez votre logo, saisissez vos informations et téléchargez un PDF compatible imprimantes Avery. Plans Starter+ pour accéder à tous les gabarits.' },
  { q: 'Quelle est la différence entre un QR statique et un QR dynamique ?', a: 'Un QR statique pointe vers une adresse fixe et ne peut pas être modifié après impression. Un QR dynamique vous permet de modifier la destination depuis votre tableau de bord sans jamais réimprimer.' },
  { q: 'Quels modes de paiement sont acceptés ?', a: 'Wave CI, Orange Money, MTN MoMo et Moov Money pour votre abonnement. Pour les QR de paiement que vous créez : Wave, Orange Money et MTN MoMo.' },
  { q: 'Mes QR codes fonctionnent-ils si j\'arrête mon abonnement ?', a: 'Les QR statiques et codes-barres restent téléchargeables indéfiniment. Les QR dynamiques passent en mode pause mais reprennent dès le renouvellement. Vos données sont conservées.' },
  { q: 'Comment fonctionne la billetterie QR ?', a: 'Créez votre événement, définissez le nombre de places. Vos participants reçoivent un billet QR unique. À l\'entrée, le contrôleur scanne et le système valide instantanément.' },
  { q: 'Y a-t-il une limite de scans par QR code ?', a: 'Non, il n\'y a pas de limite de scans sur les plans payants. Vos QR peuvent être scannés un nombre illimité de fois.' },
]

const HOME_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'QR CODE EXPRESS',
    url: 'https://qrcode-express.com',
    description: 'Plateforme complète : QR codes professionnels, 26 formats de codes-barres, 31 gabarits d\'étiquettes. Menu restaurant, billetterie, paiement Mobile Money, formulaires.',
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
  const th = await getTranslations('homeProducts')
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
      />
      <Header />
      <Hero />
      <StatsBar />
      {/* 3 produits — QR · Codes-barres · Étiquettes */}
      <section className="py-16 px-4 bg-[#041B4D]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              {th('badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              {th('title')}
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {th('subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* QR */}
            <a href="/#generateur" className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF6A00]/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-[#FF6A00] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-[#FF6A00]/20 rounded-2xl flex items-center justify-center text-3xl mb-4">📱</div>
              <h3 className="text-white font-extrabold text-xl mb-2">{th('qr_title')}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">{th('qr_desc')}</p>
              <div className="flex flex-wrap gap-2">
                {['33 types', 'Dynamic', 'Analytics', 'Social', 'Fidélité'].map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6A00]/20 text-[#FF6A00]">{tag}</span>
                ))}
              </div>
              <p className="text-[#FF6A00] text-sm font-bold mt-4 group-hover:translate-x-1 transition-transform">{th('qr_cta')}</p>
            </a>
            {/* Codes-barres */}
            <a href="/barcode" className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-blue-400/20 rounded-2xl flex items-center justify-center text-3xl mb-4">📊</div>
              <h3 className="text-white font-extrabold text-xl mb-2">{th('bc_title')}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">{th('bc_desc')}</p>
              <div className="flex flex-wrap gap-2">
                {['26 formats', 'PNG + SVG', 'CSV import', 'ZIP batch'].map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-300">{tag}</span>
                ))}
              </div>
              <p className="text-blue-300 text-sm font-bold mt-4 group-hover:translate-x-1 transition-transform">{th('bc_cta')}</p>
            </a>
            {/* Étiquettes */}
            <a href="/labels" className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-purple-400/20 rounded-2xl flex items-center justify-center text-3xl mb-4">🏷️</div>
              <h3 className="text-white font-extrabold text-xl mb-2">{th('lb_title')}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">{th('lb_desc')}</p>
              <div className="flex flex-wrap gap-2">
                {['31 templates', 'Upload logo', 'Avery PDF', 'Thermal'].map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300">{tag}</span>
                ))}
              </div>
              <p className="text-purple-300 text-sm font-bold mt-4 group-hover:translate-x-1 transition-transform">{th('lb_cta')}</p>
            </a>
          </div>
        </div>
      </section>
      <ShowcaseSlider />
      <section id="generateur" className="relative py-16 px-4 bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04] blur-3xl pointer-events-none"
          style={{ background: '#FF6A00' }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-orange-50 text-[#FF6A00] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-orange-100">
              {th('gen_badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
              {t('title')}
            </h2>
            <p className="text-gray-500 text-lg">{t('subtitle')}</p>
          </div>
          <QRGeneratorClient />
        </div>
      </section>
      {/* Section Codes-barres */}
      <section id="barcode" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-blue-100">
                {th('bc_sect_badge')}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-4">
                {th('bc_sect_h')} <span className="text-blue-600">{th('bc_sect_h_em')}</span>
              </h2>
              <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                {th('bc_sect_p')}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: '🖨️', label: th('bc_f1') },
                  { icon: '📋', label: th('bc_f2') },
                  { icon: '📦', label: th('bc_f3') },
                  { icon: '🎨', label: th('bc_f4') },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{f.icon}</span>
                    <span className="font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
              <a href="/barcode" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #041B4D, #1e3a8a)' }}>
                {th('bc_sect_cta')}
              </a>
            </div>
            <div className="relative bg-gradient-to-br from-slate-900 to-[#041B4D] rounded-3xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10" />
              <div className="space-y-4">
                {[
                  { label: 'EAN-13', bars: [3,1,2,3,1,2,1,3,2,1,3,1,2,3,1,2,1,3,2,1,3,1,2,3] },
                  { label: 'Code 128', bars: [2,1,3,2,1,2,3,1,2,3,1,2,1,3,2,1,3,2,1,2,3,1,2] },
                  { label: 'QR Code', bars: null },
                ].map((item, i) => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/40 text-xs mb-3 font-mono">{item.label}</p>
                    {item.bars ? (
                      <div className="flex items-end gap-[2px] h-10">
                        {item.bars.map((w, j) => (
                          <div key={j} className="bg-white rounded-sm" style={{ width: w * 3 + 'px', height: '100%', opacity: j % 2 === 0 ? 1 : 0 }} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-7 gap-[2px] w-16">
                        {Array.from({ length: 49 }, (_, j) => (
                          <div key={j} className="aspect-square rounded-[1px]"
                            style={{ background: [0,1,2,6,7,8,14,16,20,21,22,27,28,29,35,36,42,43,44,45,46,48].includes(j) ? 'white' : 'transparent' }} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Étiquettes */}
      <section id="etiquettes" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: th('card_retail'), bg: '#FF6A00', text: 'white', size: th('card_retail_size'), emoji: '🏷️' },
                  { label: th('card_pharma'), bg: '#041B4D', text: 'white', size: th('card_pharma_size'), emoji: '💊' },
                  { label: th('card_logistics'), bg: '#10b981', text: 'white', size: th('card_logistics_size'), emoji: '📦' },
                  { label: th('card_luxury'), bg: '#8b5cf6', text: 'white', size: th('card_luxury_size'), emoji: '💎' },
                ].map(card => (
                  <div key={card.label} className="rounded-xl p-4 shadow-sm" style={{ background: card.bg }}>
                    <p className="text-2xl mb-1">{card.emoji}</p>
                    <p className="text-xs font-bold" style={{ color: card.text }}>{card.label}</p>
                    <p className="text-[10px] mt-0.5 font-mono" style={{ color: card.text, opacity: 0.6 }}>{card.size}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-block bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-purple-100">
                {th('lb_sect_badge')}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-4">
                {th('lb_sect_h')} <span className="text-purple-600">{th('lb_sect_h_em')}</span>
              </h2>
              <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                {th('lb_sect_p')}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: '📤', label: th('lb_f1') },
                  { icon: '📄', label: th('lb_f2') },
                  { icon: '🎨', label: th('lb_f3') },
                  { icon: '🔥', label: th('lb_f4') },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{f.icon}</span>
                    <span className="font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
              <a href="/labels" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}>
                {th('lb_sect_cta')}
              </a>
            </div>
          </div>
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
