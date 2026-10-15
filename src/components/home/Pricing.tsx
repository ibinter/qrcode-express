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
      { text: '10 QR statiques', ok: true },
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
  {
    id: 'enterprise',
    name: 'Entreprise',
    price: 'Sur mesure',
    unit: '',
    badge: '🏢 Illimité',
    highlight: false,
    desc: 'Pour les grandes structures',
    features: [
      { text: 'QR codes illimités', ok: true },
      { text: 'QR dynamiques illimités', ok: true },
      { text: 'Tous les types de QR', ok: true },
      { text: 'Collaborateurs illimités', ok: true },
      { text: 'Génération en lot illimitée', ok: true },
      { text: 'API REST illimitée', ok: true },
      { text: 'White label (votre marque)', ok: true },
      { text: 'SLA + Support dédié', ok: true },
    ],
    cta: 'Nous contacter',
    href: 'https://wa.me/2250778551234?text=Bonjour%2C%20je%20souhaite%20un%20devis%20Entreprise%20pour%20QR%20CODE%20EXPRESS',
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

        {/* 4 plans principaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start mb-6">
          {plans.filter(p => p.id !== 'enterprise').map((p) => (
            <PricingCard key={p.id} p={p} onPay={handlePay} loading={loading} />
          ))}
        </div>

        {/* Plan Entreprise — bannière pleine largeur */}
        {(() => {
          const ent = plans.find(p => p.id === 'enterprise')!
          return (
            <div className="rounded-2xl overflow-hidden border-2 border-[#041B4D] shadow-lg mb-8"
              style={{ background: 'linear-gradient(135deg, #041B4D 0%, #0d2d6e 60%, #1a1a2e 100%)' }}>
              <div className="flex flex-col md:flex-row items-center gap-6 p-7">
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🏢</span>
                    <div>
                      <h3 className="font-extrabold text-2xl">{ent.name}</h3>
                      <p className="text-blue-300 text-sm">{ent.desc}</p>
                    </div>
                  </div>
                  <p className="text-blue-200 text-sm mb-4">
                    Solution sur mesure pour grandes structures, administrations et agences — volumes importants, intégration API, white label.
                  </p>
                  <a href={ent.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                    💬 Nous contacter sur WhatsApp →
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 flex-shrink-0 w-full md:w-auto">
                  {ent.features.map(f => (
                    <div key={f.text} className="flex items-center gap-2 text-sm text-white/90 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                      <span className="text-green-400 font-bold">✓</span> {f.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}

        {/* À la carte — sans compte */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">⚡</span>
                <h3 className="font-extrabold text-[#041B4D] text-lg">Formule Libre — Sans compte</h3>
                <span className="text-[10px] font-bold bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20 px-2 py-0.5 rounded-full">À LA CARTE</span>
              </div>
              <p className="text-sm text-gray-500">Payez uniquement ce dont vous avez besoin, une seule fois. Aucun abonnement, aucun compte requis.</p>
            </div>
            <a href="#generateur"
              className="flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
              Créer un QR →
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { icon: '🖼️', label: 'PNG standard', price: '0 FCFA', sub: 'toujours gratuit' },
              { icon: '🎨', label: 'PNG HD + logo', price: '500 FCFA', sub: 'par téléchargement' },
              { icon: '✏️', label: 'SVG vectoriel', price: '500 FCFA', sub: 'par téléchargement' },
              { icon: '📄', label: 'PDF imprimable', price: '500 FCFA', sub: 'par téléchargement' },
              { icon: '🖼️', label: 'Cadre premium', price: '500 FCFA', sub: 'par QR généré' },
              { icon: '🔄', label: 'QR dynamique', price: '1 000 FCFA', sub: 'valable 30 jours' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center px-4 py-5 hover:bg-gray-50 transition-colors">
                <span className="text-2xl mb-2">{item.icon}</span>
                <p className="text-xs font-bold text-[#041B4D] mb-1 leading-tight">{item.label}</p>
                <p className="text-base font-extrabold text-[#FF6A00]">{item.price}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
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
              ['Puis-je utiliser la plateforme sans créer un compte ?', 'Oui ! Avec la Formule Libre, vous payez chaque service à l\'unité (SVG, PDF, logo, QR dynamique) sans inscription.'],
              ['Puis-je annuler mon abonnement à tout moment ?', 'Oui, aucun engagement. Vous gérez votre abonnement depuis votre profil, aucun frais caché.'],
              ['Les QR statiques expirent-ils ?', 'Non. Vos QR statiques fonctionnent pour toujours, même sans abonnement ni compte.'],
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
