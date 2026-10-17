'use client'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

const TESTIMONIALS = [
  {
    name: 'Kouamé Brou',
    role: 'Gérant, Restaurant Le Savoureux',
    city: '🇨🇮 Abidjan, Côte d\'Ivoire',
    avatar: 'KB',
    color: '#FF6A00',
    stars: 5,
    text: 'Avant, je réimprimais mes menus toutes les semaines à cause des changements de prix. Maintenant je modifie tout depuis mon téléphone en 2 minutes. Mes clients adorent scanner le QR sur la table.',
  },
  {
    name: 'Fatou Diallo',
    role: 'Organisatrice d\'événements',
    city: '🇸🇳 Dakar, Sénégal',
    avatar: 'FD',
    color: '#7c3aed',
    stars: 5,
    text: 'J\'ai utilisé QR CODE EXPRESS pour mon gala de 200 personnes à Dakar. Chaque invité avait son billet QR unique. La validation à l\'entrée se faisait en 3 secondes par billet. Zéro fraude, zéro stress.',
  },
  {
    name: 'Ama Konan',
    role: 'Responsable marketing, Boutique Mode',
    city: '🇨🇮 Abidjan, Côte d\'Ivoire',
    avatar: 'AK',
    color: '#ec4899',
    stars: 5,
    text: 'Le QR de paiement Wave a changé ma boutique. Les clients paient directement, je reçois la confirmation instantanément. Plus besoin de rendre la monnaie ou d\'attendre les virements.',
  },
  {
    name: 'Moussa Ouédraogo',
    role: 'Directeur commercial, Agence digitale',
    city: '🇧🇫 Ouagadougou, Burkina Faso',
    avatar: 'MO',
    color: '#0ea5e9',
    stars: 5,
    text: 'Les formulaires de prospects par QR sont incroyables pour nos salons professionnels. J\'ai collecté 120 contacts en une journée à l\'expo de Ouaga. Avant j\'utilisais des fiches papier !',
  },
  {
    name: 'Ibrahim Koné',
    role: 'Gérant, Hôtel Akwaba',
    city: '🇲🇱 Bamako, Mali',
    avatar: 'IK',
    color: '#16a34a',
    stars: 5,
    text: 'Nos clients scannent le QR à la réception pour voir toutes les infos de l\'hôtel, les services, le restaurant. Les analytics nous montrent ce qui les intéresse le plus. C\'est précieux pour nous améliorer.',
  },
  {
    name: 'Mariam Traoré',
    role: 'Coach & Formatrice',
    city: '🇹🇬 Lomé, Togo',
    avatar: 'MT',
    color: '#8b5cf6',
    stars: 5,
    text: 'Ma carte de visite digitale vCard me distingue de la concurrence. Je partage mon QR lors de chaque formation et les participants ont tous mes contacts, mes réseaux sociaux et mon lien de réservation en un scan.',
  },
]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="text-yellow-400 text-sm">★</span>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const t = useTranslations('testimonials')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cards = el.querySelectorAll<HTMLElement>('.tcard')
    cards.forEach((c) => { c.style.opacity = '0'; c.style.transform = 'translateY(24px)' })
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        cards.forEach((c, i) => {
          setTimeout(() => {
            c.style.transition = 'opacity .5s ease, transform .5s ease'
            c.style.opacity = '1'
            c.style.transform = 'translateY(0)'
          }, i * 80)
        })
        observer.disconnect()
      }
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-20 px-4 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="text-center mb-14">
          <span className="inline-block bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-yellow-100">
            {t('badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
            {t('title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="tcard bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              {/* Quote mark */}
              <div className="text-4xl font-black leading-none" style={{ color: t.color + '33' }}>"</div>

              {/* Stars */}
              <Stars n={t.stars} />

              {/* Text */}
              <p className="text-sm text-gray-600 leading-relaxed flex-1 -mt-2">
                {t.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}bb)` }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#041B4D] leading-tight">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: t.color }}>📍 {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating summary */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
          <div>
            <p className="text-5xl font-black text-[#041B4D]">4.9</p>
            <Stars n={5} />
            <p className="text-xs text-gray-400 mt-1">{t('rating_label')}</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-gray-100" />
          <div>
            <p className="text-5xl font-black text-[#041B4D]">500+</p>
            <p className="text-sm font-semibold text-gray-500">{t('qr_label')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('qr_sub')}</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-gray-100" />
          <div>
            <p className="text-5xl font-black text-[#041B4D]">98%</p>
            <p className="text-sm font-semibold text-gray-500">{t('satisfied_label')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('satisfied_sub')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
