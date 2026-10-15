'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Feature = { text: string; ok: boolean; note?: string }
type Plan = {
  id: string
  name: string
  price: string
  unit: string
  badge: string | null
  highlight: boolean
  desc: string
  color: string
  groups: { label: string; features: Feature[] }[]
  cta: string
  href?: string
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0',
    unit: '',
    badge: null,
    highlight: false,
    color: '#64748b',
    desc: 'Pour découvrir la plateforme',
    cta: 'Essayer gratuitement',
    href: '#generateur',
    groups: [
      {
        label: '📱 QR Codes',
        features: [
          { text: '10 QR statiques', ok: true },
          { text: 'PNG uniquement', ok: true },
          { text: 'Couleurs de base', ok: true },
          { text: 'Sans inscription requise', ok: true },
          { text: 'SVG / PDF', ok: false },
          { text: 'QR dynamiques', ok: false },
        ],
      },
      {
        label: '🎨 Design',
        features: [
          { text: 'Logo centré', ok: false },
          { text: '14 styles de cadre', ok: false },
          { text: 'Formes de modules', ok: false },
        ],
      },
      {
        label: '📊 Analytics',
        features: [
          { text: 'Statistiques', ok: false },
          { text: 'Analytics pays & appareils', ok: false },
        ],
      },
      {
        label: '🎟️ Billetterie & événements',
        features: [
          { text: 'Billetterie QR', ok: false },
        ],
      },
      {
        label: '💳 Paiement Mobile Money',
        features: [
          { text: 'Paiements Wave / Orange / MTN', ok: false },
        ],
      },
      {
        label: '📋 Formulaires & prospects',
        features: [
          { text: 'Formulaires de capture', ok: false },
        ],
      },
      {
        label: '🏢 Équipes',
        features: [
          { text: 'Organisations & collaborateurs', ok: false },
        ],
      },
      {
        label: '🎁 Parrainage',
        features: [
          { text: 'Programme de parrainage', ok: false },
        ],
      },
    ],
  },
  {
    id: 'essential',
    name: 'Essentiel',
    price: '1 500',
    unit: 'FCFA / mois',
    badge: null,
    highlight: false,
    color: '#3b82f6',
    desc: 'Pour les indépendants',
    cta: 'Choisir Essentiel',
    groups: [
      {
        label: '📱 QR Codes',
        features: [
          { text: '20 QR statiques', ok: true },
          { text: 'PNG + SVG + PDF', ok: true },
          { text: '5 QR dynamiques', ok: true },
          { text: 'Modification sans réimpression', ok: true },
          { text: 'Scan illimité', ok: true },
          { text: 'QR dynamiques illimités', ok: false },
        ],
      },
      {
        label: '🎨 Design',
        features: [
          { text: 'Logo centré sur QR', ok: true },
          { text: '14 styles de cadre', ok: true },
          { text: 'Formes de modules', ok: true },
        ],
      },
      {
        label: '📊 Analytics',
        features: [
          { text: 'Stats de base (30 jours)', ok: true },
          { text: 'Analytics pays & appareils', ok: false },
        ],
      },
      {
        label: '🎟️ Billetterie & événements',
        features: [
          { text: 'Billetterie QR', ok: false },
        ],
      },
      {
        label: '💳 Paiement Mobile Money',
        features: [
          { text: 'Paiements Wave / Orange / MTN', ok: false },
        ],
      },
      {
        label: '📋 Formulaires & prospects',
        features: [
          { text: 'Formulaires de capture', ok: false },
        ],
      },
      {
        label: '🏢 Équipes',
        features: [
          { text: 'Organisations & collaborateurs', ok: false },
        ],
      },
      {
        label: '🎁 Parrainage',
        features: [
          { text: 'Programme de parrainage', ok: true },
        ],
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '3 500',
    unit: 'FCFA / mois',
    badge: '⭐ Populaire',
    highlight: true,
    color: '#FF6A00',
    desc: 'Pour les professionnels',
    cta: 'Choisir Pro',
    groups: [
      {
        label: '📱 QR Codes',
        features: [
          { text: 'QR statiques illimités', ok: true },
          { text: 'PNG + SVG + PDF illimité', ok: true },
          { text: '50 QR dynamiques', ok: true },
          { text: 'Menu, Coupon, Bio Links, Catalogue', ok: true },
          { text: 'vCard Plus + App Store + PDF', ok: true },
          { text: 'Édition en temps réel', ok: true },
        ],
      },
      {
        label: '🎨 Design',
        features: [
          { text: 'Logo + 14 cadres + modules', ok: true },
          { text: 'Export HD haute résolution', ok: true },
          { text: 'Avis clients (Google Review QR)', ok: true },
        ],
      },
      {
        label: '📊 Analytics',
        features: [
          { text: 'Analytics complets 90 jours', ok: true },
          { text: 'Pays, appareils, OS', ok: true },
        ],
      },
      {
        label: '🎟️ Billetterie & événements',
        features: [
          { text: '5 événements actifs', ok: true },
          { text: 'Inscription + billet QR unique', ok: true },
          { text: 'Validation scan à l\'entrée', ok: true },
        ],
      },
      {
        label: '💳 Paiement Mobile Money',
        features: [
          { text: 'Wave + Orange Money + MTN MoMo', ok: true },
          { text: 'Montant fixe ou libre', ok: true },
          { text: 'Historique des paiements reçus', ok: true },
        ],
      },
      {
        label: '📋 Formulaires & prospects',
        features: [
          { text: '5 formulaires actifs', ok: true },
          { text: 'Champs personnalisés', ok: true },
          { text: 'Export des réponses', ok: true },
        ],
      },
      {
        label: '🏢 Équipes',
        features: [
          { text: 'Organisations & collaborateurs', ok: false },
        ],
      },
      {
        label: '🎁 Parrainage',
        features: [
          { text: 'Programme de parrainage', ok: true },
          { text: 'Lien personnalisé + crédits', ok: true },
        ],
      },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '8 000',
    unit: 'FCFA / mois',
    badge: null,
    highlight: false,
    color: '#041B4D',
    desc: 'Pour les équipes & agences',
    cta: 'Choisir Business',
    groups: [
      {
        label: '📱 QR Codes',
        features: [
          { text: 'QR dynamiques illimités', ok: true },
          { text: 'Tous les types Pro inclus', ok: true },
          { text: 'Génération en lot (1 000 QR)', ok: true },
          { text: 'Tests A/B de contenu', ok: true },
          { text: 'API REST', ok: true },
          { text: 'Scan illimité', ok: true },
        ],
      },
      {
        label: '🎨 Design',
        features: [
          { text: 'Tous les designs Pro', ok: true },
          { text: 'Export en masse', ok: true },
          { text: 'Personnalisation avancée', ok: true },
        ],
      },
      {
        label: '📊 Analytics',
        features: [
          { text: 'Analytics avancés illimités', ok: true },
          { text: 'Rapports & exports CSV', ok: true },
        ],
      },
      {
        label: '🎟️ Billetterie & événements',
        features: [
          { text: 'Événements illimités', ok: true },
          { text: 'Capacité illimitée par événement', ok: true },
          { text: 'Validation multi-agents', ok: true },
        ],
      },
      {
        label: '💳 Paiement Mobile Money',
        features: [
          { text: 'Paiements QR illimités', ok: true },
          { text: 'Wave + Orange + MTN + carte', ok: true },
          { text: 'Tableau de bord des encaissements', ok: true },
        ],
      },
      {
        label: '📋 Formulaires & prospects',
        features: [
          { text: 'Formulaires illimités', ok: true },
          { text: 'Export CSV des soumissions', ok: true },
          { text: 'Notification WhatsApp des réponses', ok: true },
        ],
      },
      {
        label: '🏢 Équipes',
        features: [
          { text: '5 collaborateurs inclus', ok: true },
          { text: 'Rôles : admin / éditeur / lecteur', ok: true },
          { text: 'Invitations par email', ok: true },
        ],
      },
      {
        label: '🎁 Parrainage',
        features: [
          { text: 'Programme de parrainage', ok: true },
          { text: 'Support prioritaire WhatsApp', ok: true },
        ],
      },
    ],
  },
]

function PricingCard({ p, onPay, loading }: { p: Plan; onPay: (id: string) => void; loading: string | null }) {
  const [expanded, setExpanded] = useState(false)
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

  // Flatten all features for compact view
  const allFeatures = p.groups.flatMap(g => g.features)
  const topFeatures = allFeatures.filter(f => f.ok).slice(0, 5)

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

      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-[#041B4D] text-lg mb-0.5">{p.name}</h3>
        <p className="text-xs text-gray-400 mb-4">{p.desc}</p>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold text-[#041B4D]">{p.price}</span>
          {p.unit && <span className="text-sm text-gray-400 mb-1">{p.unit}</span>}
        </div>
      </div>

      {/* Compact features (always visible) */}
      <ul className="flex-1 p-5 space-y-2">
        {topFeatures.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex-shrink-0 font-bold text-green-500">✓</span>
            <span className="text-gray-700">{f.text}</span>
          </li>
        ))}
        {/* Key negatives */}
        {allFeatures.filter(f => !f.ok).slice(0, 2).map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex-shrink-0 font-bold text-gray-300">✗</span>
            <span className="text-gray-350 line-through">{f.text}</span>
          </li>
        ))}
      </ul>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-3 border-t border-gray-50 pt-3 space-y-4">
          {p.groups.map((g) => (
            <div key={g.label}>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{g.label}</p>
              <ul className="space-y-1.5">
                {g.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 flex-shrink-0 font-bold text-xs ${f.ok ? 'text-green-500' : 'text-gray-300'}`}>
                      {f.ok ? '✓' : '✗'}
                    </span>
                    <span className={f.ok ? 'text-gray-700' : 'text-gray-400 line-through text-xs'}>
                      {f.text}
                      {f.note && <span className="text-[10px] text-[#FF6A00] font-semibold ml-1">({f.note})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mx-5 mb-3 text-xs text-gray-400 hover:text-[#FF6A00] transition-colors font-semibold flex items-center gap-1 justify-center py-1.5 border border-gray-100 rounded-lg hover:border-[#FF6A00]/30"
      >
        {expanded ? '▲ Masquer les détails' : '▼ Voir toutes les fonctionnalités'}
      </button>

      {/* CTA */}
      <div className="p-5 pt-0">
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

        {/* Comparison table header — desktop only */}
        <div className="hidden lg:grid grid-cols-4 gap-1 mb-3 px-1">
          {plans.map(p => (
            <div key={p.id} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
              {p.name}
            </div>
          ))}
        </div>

        {/* 4 plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start mb-6">
          {plans.map((p) => (
            <PricingCard key={p.id} p={p} onPay={handlePay} loading={loading} />
          ))}
        </div>

        {/* Feature comparison — quick table */}
        <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#041B4D]">Comparatif complet des fonctionnalités</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider w-1/3">Fonctionnalité</th>
                  {plans.map(p => (
                    <th key={p.id} className={`px-4 py-3 text-center font-bold text-xs ${p.highlight ? 'text-[#FF6A00]' : 'text-[#041B4D]'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '📱 QR statiques', values: ['10', '20', 'Illimités', 'Illimités'] },
                  { label: '⚡ QR dynamiques', values: ['—', '5', '50', 'Illimités'] },
                  { label: '🖼️ Formats (PNG/SVG/PDF)', values: ['PNG seul', '✓', '✓', '✓'] },
                  { label: '🎨 Logo + cadres design', values: ['—', '✓', '✓', '✓'] },
                  { label: '📊 Analytics', values: ['—', '30 jours', '90 jours', 'Illimité'] },
                  { label: '🍽️ Menu / Coupon / Bio Links', values: ['—', '—', '✓', '✓'] },
                  { label: '🎟️ Billetterie QR', values: ['—', '—', '5 événements', 'Illimité'] },
                  { label: '💳 Paiement Mobile Money', values: ['—', '—', '✓', '✓'] },
                  { label: '📋 Formulaires prospects', values: ['—', '—', '5 formulaires', 'Illimité'] },
                  { label: '🏢 Organisations/équipes', values: ['—', '—', '—', '5 membres'] },
                  { label: '🔁 Génération en lot', values: ['—', '—', '—', '1 000 QR'] },
                  { label: '🔌 API REST', values: ['—', '—', '—', '✓'] },
                  { label: '🎁 Programme parrainage', values: ['—', '✓', '✓', '✓'] },
                  { label: '💬 Support WhatsApp', values: ['—', '—', '—', 'Prioritaire'] },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                    <td className="px-6 py-3 font-medium text-gray-700">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className={`px-4 py-3 text-center ${
                        v === '—' ? 'text-gray-300' :
                        v === '✓' ? 'text-green-600 font-bold' :
                        plans[j].highlight ? 'text-[#FF6A00] font-bold' : 'text-[#041B4D] font-semibold'
                      }`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plan Entreprise */}
        <div className="rounded-2xl overflow-hidden border-2 border-[#041B4D] shadow-lg mb-8"
          style={{ background: 'linear-gradient(135deg, #041B4D 0%, #0d2d6e 60%, #1a1a2e 100%)' }}>
          <div className="flex flex-col md:flex-row items-center gap-6 p-7">
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🏢</span>
                <div>
                  <h3 className="font-extrabold text-2xl">Entreprise</h3>
                  <p className="text-blue-300 text-sm">Pour les grandes structures</p>
                </div>
              </div>
              <p className="text-blue-200 text-sm mb-4">
                Solution sur mesure pour grandes structures, administrations et agences — volumes importants, intégration API, white label.
              </p>
              <a href="https://wa.me/2250778551234?text=Bonjour%2C%20je%20souhaite%20un%20devis%20Entreprise%20pour%20QR%20CODE%20EXPRESS"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                💬 Nous contacter sur WhatsApp →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-shrink-0 w-full md:w-auto">
              {[
                'QR codes illimités', 'QR dynamiques illimités',
                'Tous les types de QR', 'Collaborateurs illimités',
                'Billetterie illimitée', 'Paiements illimités',
                'Formulaires illimités', 'Génération en lot illimitée',
                'API REST illimitée', 'White label (votre marque)',
                'Organisations illimitées', 'SLA + Support dédié',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/90 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                  <span className="text-green-400 font-bold">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* À la carte */}
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

        {/* FAQ */}
        <div className="mt-10 max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#041B4D] mb-4 text-center">Questions fréquentes</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Puis-je utiliser la plateforme sans créer un compte ?', 'Oui ! Avec la Formule Libre, vous payez chaque service à l\'unité (SVG, PDF, logo, QR dynamique) sans inscription.'],
              ['La billetterie est-elle disponible sur le plan gratuit ?', 'Non. La billetterie QR (inscription + billet unique par participant) est disponible à partir du plan Pro à 3 500 FCFA/mois.'],
              ['Comment fonctionne le paiement Mobile Money QR ?', 'Vous créez un QR de paiement, vos clients scannent et paient via Wave, Orange Money ou MTN MoMo. Disponible à partir du plan Pro.'],
              ['Puis-je annuler mon abonnement à tout moment ?', 'Oui, aucun engagement. Vous gérez votre abonnement depuis votre profil, aucun frais caché.'],
              ['Que se passe-t-il si je descends de plan ?', 'Vos QR dynamiques passent en lecture seule. Vos données sont conservées 30 jours.'],
            ].map(([q, a]) => (
              <details key={q} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer font-semibold text-[#041B4D] hover:bg-gray-50">
                  {q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2">▾</span>
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
