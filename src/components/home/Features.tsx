'use client'
import { useEffect, useRef } from 'react'

const features = [
  {
    icon: '🎟️',
    title: 'Billetterie avec QR billet',
    desc: 'Créez un événement, gérez les inscriptions et générez un QR billet unique pour chaque participant. Validation à l\'entrée en un scan.',
    color: '#7c3aed', bg: '#F5F3FF',
  },
  {
    icon: '💳',
    title: 'Paiement Mobile Money QR',
    desc: 'Recevez des paiements Wave, Orange Money et MTN MoMo directement via QR. Montant fixe ou libre, aucune caisse enregistreuse nécessaire.',
    color: '#16a34a', bg: '#F0FDF4',
  },
  {
    icon: '📋',
    title: 'Formulaires de prospects',
    desc: 'Créez des formulaires personnalisés accessibles par QR. Collectez noms, emails, numéros — sans site web, sans application.',
    color: '#0ea5e9', bg: '#F0F9FF',
  },
  {
    icon: '🏢',
    title: 'Organisations & équipes',
    desc: 'Gérez vos QR codes en équipe. Invitez des collaborateurs, définissez des rôles (admin, éditeur) et partagez vos ressources.',
    color: '#041B4D', bg: '#EEF2FF',
  },
  {
    icon: '🎁',
    title: 'Programme de parrainage',
    desc: 'Gagnez des crédits en invitant vos contacts. Chaque filleul inscrit vous rapporte 50 crédits, lui 20. Lien de parrainage personnalisé.',
    color: '#FF6A00', bg: '#FFF7ED',
  },
  {
    icon: '🎨',
    title: 'Studio de design complet',
    desc: 'Couleurs, logo centré, 14 styles de cadre, formes de modules. Téléchargement PNG, SVG et PDF inclus.',
    color: '#ec4899', bg: '#FDF2F8',
  },
  {
    icon: '⚡',
    title: 'QR Dynamiques',
    desc: 'Modifiez la destination sans réimprimer. Menu restaurant, coupon promo, bio links — tous mis à jour en temps réel.',
    color: '#3b82f6', bg: '#EFF6FF',
  },
  {
    icon: '📊',
    title: 'Analytics détaillés',
    desc: 'Scans par jour, appareils, pays d\'origine. Graphique 14 jours et stats en direct sur chaque QR.',
    color: '#10b981', bg: '#ECFDF5',
  },
  {
    icon: '🍽️',
    title: 'Menu & Catalogue digital',
    desc: 'Menu restaurant mis à jour sans réimprimer, catalogue produits avec photos et prix. Le client scanne, il voit tout.',
    color: '#f97316', bg: '#FFF7ED',
  },
  {
    icon: '💬',
    title: 'WhatsApp & réseaux',
    desc: 'QR WhatsApp avec message prérempli. Instagram, TikTok, Facebook, LinkedIn — le canal n°1 en Afrique.',
    color: '#25d366', bg: '#F0FDF4',
  },
  {
    icon: '🪪',
    title: 'vCard Plus interactive',
    desc: 'Carte de visite digitale avec photo, réseaux sociaux, bouton WhatsApp et lien de téléchargement du contact.',
    color: '#8b5cf6', bg: '#F5F3FF',
  },
  {
    icon: '🔒',
    title: 'Sécurité & fiabilité',
    desc: 'Infrastructure Supabase + Vercel. Données chiffrées, RLS activé, liens sécurisés. Vos QR ne tombent jamais en panne.',
    color: '#64748b', bg: '#F8FAFC',
  },
]

function FeatureCard({ f, delay }: { f: typeof features[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(32px)'
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          el.style.transition = 'opacity .6s ease, transform .6s ease'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }, delay)
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: f.bg }}>
        {f.icon}
      </div>
      <div>
        <h3 className="font-bold text-[#041B4D] mb-1 text-base">{f.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
            La plateforme QR la plus complète d&apos;Afrique
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Billetterie, paiements Mobile Money, formulaires, organisations — des outils professionnels adaptés au marché africain
          </p>
        </div>

        {/* Top 3 features — highlighted */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {features.slice(0, 3).map((f, i) => (
            <div key={f.title} className="bg-white rounded-2xl border-2 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              style={{ borderColor: f.color + '33' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                style={{ background: f.bg }}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-[#041B4D] mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full self-start"
                style={{ background: f.bg, color: f.color }}>
                Nouveau ✦
              </span>
            </div>
          ))}
        </div>

        {/* Remaining features — grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.slice(3).map((f, i) => (
            <FeatureCard key={f.title} f={f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  )
}
