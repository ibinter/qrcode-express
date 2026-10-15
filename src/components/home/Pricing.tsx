'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0',
    unit: '',
    badge: null,
    highlight: false,
    desc: 'Pour découvrir la plateforme',
    features: [
      { text: '3 QR statiques max', ok: true },
      { text: 'PNG uniquement', ok: true },
      { text: 'Couleurs de base', ok: true },
      { text: 'Sans inscription', ok: true },
      { text: 'SVG / PDF', ok: false },
      { text: 'Logo & cadres avancés', ok: false },
      { text: 'QR dynamiques', ok: false },
      { text: 'Analytics', ok: false },
    ],
    cta: 'Essayer gratuitement',
    href: '#generateur',
  },
  {
    id: 'essential',
    name: 'Essentiel',
    price: '1 500',
    unit: 'FCFA / mois',
    badge: null,
    highlight: false,
    desc: 'Pour les indépendants',
    features: [
      { text: '20 QR statiques', ok: true },
      { text: 'PNG + SVG + PDF', ok: true },
      { text: '5 QR dynamiques', ok: true },
      { text: 'Logo centré sur QR', ok: true },
      { text: '14 styles de cadre', ok: true },
      { text: 'Stats de base (30 jours)', ok: true },
      { text: 'Menu / Coupon / Bio Links', ok: false },
      { text: 'Analytics pays & appareils', ok: false },
    ],
    cta: 'Choisir Essentiel',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '3 500',
    unit: 'FCFA / mois',
    badge: '⭐ Populaire',
    highlight: true,
    desc: 'Pour les professionnels',
    features: [
      { text: 'QR statiques illimités', ok: true },
      { text: 'PNG + SVG + PDF illimité', ok: true },
      { text: '50 QR dynamiques', ok: true },
      { text: 'Menu, Coupon, Bio Links', ok: true },
      { text: 'Logo + 14 cadres', ok: true },
      { text: 'Analytics complets (pays, appareils)', ok: true },
      { text: 'Édition QR en temps réel', ok: true },
      { text: 'vCard Plus + App Store + PDF', ok: true },
    ],
    cta: 'Choisir Pro',
  },
  {
    id: 'business',
    name: 'Business',
    price: '8 000',
    unit: 'FCFA / mois',
    badge: null,
    highlight: false,
    desc: 'Pour les équipes & agences',
    features: [
      { text: 'QR dynamiques illimités', ok: true },
      { text: 'Tous les types Pro', ok: true },
      { text: '5 collaborateurs', ok: true },
      { text: 'Analytics avancés', ok: true },
      { text: 'Génération en lot (1 000 QR)', ok: true },
      { text: 'Tests A/B de contenu', ok: true },
      { text: 'API REST', ok: true },
      { text: 'Support prioritaire WhatsApp', ok: true },
    ],
    cta: 'Choisir Business',
  },
]

function PricingCard({ p, onPay, loading }: { p: typeof plans[0]; onPay: (id: string) => void; loading: string | null }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(24px)'
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.transition = 'opacity .5s ease, transform .5s ease'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        observer.disconnect()
      }
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-1 ${
        p.highlight
          ? 'border-2 border-[#FF6A00] shadow-xl shadow-orange-500/10 bg-white scale-105 z-10'
          : 'border border-gray-200 shadow-sm bg-white'
      }`}
    >
      {p.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-[#FF6A00] text-white text-xs font-bold px-4 py-1 rounded-full shadow-md whitespace-nowrap">
            {p.badge}
          </span>
        </div>
      )}

      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-[#041B4D] text-lg mb-0.5">{p.name}</h3>
        <p className="text-xs text-gray-400 mb-4">{p.desc}</p>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold text-[#041B4D]">{p.price}</span>
          {p.unit && <span className="text-sm text-gray-400 mb-1">{p.unit}</span>}
        </div>
      </div>

      <ul className="flex-1 p-6 space-y-2.5">
        {p.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            <span className={`mt-0.5 flex-shrink-0 font-bold ${f.ok ? 'text-green-500' : 'text-gray-300'}`}>
              {f.ok ? '✓' : '✗'}
            </span>
            <span className={f.ok ? 'text-gray-700' : 'text-gray-350 line-through'}>{f.text}</span>
          </li>
        ))}
      </ul>

      <div className="p-6 pt-0">
        {p.id === 'free' ? (
          <a
            href="#generateur"
            className="block w-full text-center py-2.5 rounded-xl font-semibold text-sm border-2 border-[#041B4D] text-[#041B4D] hover:bg-[#041B4D] hover:text-white transition-colors"
          >
            {p.cta}
          </a>
        ) : (
          <button
            onClick={() => onPay(p.id)}
            disabled={loading === p.id}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60 ${
              p.highlight
                ? 'text-white shadow-md hover:shadow-lg'
                : 'border-2 border-[#041B4D] text-[#041B4D] hover:bg-[#041B4D] hover:text-white'
            }`}
            style={p.highlight ? { background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' } : {}}
          >
            {loading === p.id ? 'Redirection…' : p.cta}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function handlePay(planId: string) {
    setLoading(planId)
    const res = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
    if (res.status === 401) {
      router.push(`/connexion?redirect=/&plan=${planId}`)
      setLoading(null)
      return
    }
    const data = await res.json()
    if (data.payment_url) {
      window.location.href = data.payment_url
    } else {
      alert('Erreur lors de l\'initiation du paiement. Réessayez.')
      setLoading(null)
    }
  }

  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
            Tarifs simples et transparents
          </h2>
          <p className="text-gray-500 text-lg">
            Sans engagement · Mobile Money · Résiliable à tout moment
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {plans.map((p) => (
            <PricingCard key={p.id} p={p} onPay={handlePay} loading={loading} />
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 mb-3 font-medium">Méthodes de paiement acceptées</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['🟠 Orange Money', '🔵 Wave', '🟡 MTN Mobile Money', '🟢 Moov Money', '💳 Carte bancaire'].map((m) => (
              <span key={m} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-600 font-medium shadow-sm">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* FAQ mini */}
        <div className="mt-10 max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#041B4D] mb-4 text-center">Questions fréquentes</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Puis-je annuler à tout moment ?', 'Oui, aucun engagement. Vous gérez votre abonnement depuis votre profil.'],
              ['Les QR statiques expirent-ils ?', 'Non. Vos QR statiques fonctionnent pour toujours, même sans abonnement.'],
              ['Que se passe-t-il si je descends de plan ?', 'Vos QR dynamiques passent en lecture seule. Vos données sont conservées 30 jours.'],
            ].map(([q, a]) => (
              <details key={q} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer font-semibold text-[#041B4D] hover:bg-gray-50">
                  {q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="px-4 pb-3 text-gray-500">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
