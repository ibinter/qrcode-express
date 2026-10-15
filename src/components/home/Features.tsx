'use client'
import { useEffect, useRef } from 'react'

const features = [
  {
    icon: '🎨',
    title: 'Studio de design complet',
    desc: 'Couleurs, logo centré, 14 styles de cadre, formes de modules. Téléchargement PNG, SVG et PDF inclus.',
    color: '#FF6A00', bg: '#FFF7ED',
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
    icon: '💬',
    title: 'WhatsApp & réseaux',
    desc: 'QR WhatsApp avec message prérempli. Instagram, TikTok, Facebook, LinkedIn — le canal n°1 en Afrique.',
    color: '#25d366', bg: '#F0FDF4',
  },
  {
    icon: '📱',
    title: 'Mobile Money intégré',
    desc: 'Paiement via Orange Money, Wave, MTN et carte bancaire. Accès Pro en quelques secondes.',
    color: '#f59e0b', bg: '#FFFBEB',
  },
  {
    icon: '🔒',
    title: 'Sécurité & anti-fraude',
    desc: 'Analyse des liens malveillants, protection anti-quishing. Vos utilisateurs sont en sécurité.',
    color: '#8b5cf6', bg: '#F5F3FF',
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
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            La plateforme QR professionnelle, conçue pour l'Afrique
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  )
}
