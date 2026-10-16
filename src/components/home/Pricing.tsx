'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

type Feature = { text: string; ok: boolean; note?: string }
type Plan = {
  id: string
  name: string
  price: string
  unit: string
  equiv?: string
  badge: string | null
  highlight: boolean
  desc: string
  color: string
  groups: { label: string; features: Feature[] }[]
  cta: string
  href?: string
}

const planGroups = [
  // Free
  [
    { label: '📱 QR Codes', features: [
      { text: '10 QR statiques', ok: true },
      { text: 'PNG uniquement', ok: true },
      { text: 'Couleurs de base', ok: true },
      { text: 'Sans inscription requise', ok: true },
      { text: 'SVG / PDF', ok: false },
      { text: 'QR dynamiques', ok: false },
    ]},
    { label: '🎨 Design', features: [
      { text: 'Logo centré', ok: false },
      { text: '14 styles de cadre', ok: false },
      { text: 'Formes de modules', ok: false },
    ]},
    { label: '📊 Analytics', features: [
      { text: 'Statistiques', ok: false },
      { text: 'Analytics pays & appareils', ok: false },
    ]},
    { label: '🎟️ Billetterie & événements', features: [{ text: 'Billetterie QR', ok: false }]},
    { label: '💳 Paiement Mobile Money', features: [{ text: 'Paiements Wave / Orange / MTN', ok: false }]},
    { label: '📋 Formulaires & prospects', features: [{ text: 'Formulaires de capture', ok: false }]},
    { label: '🏢 Équipes', features: [{ text: 'Organisations & collaborateurs', ok: false }]},
    { label: '🎁 Parrainage', features: [{ text: 'Programme de parrainage', ok: false }]},
  ],
  // Essential
  [
    { label: '📱 QR Codes', features: [
      { text: '20 QR statiques', ok: true },
      { text: 'PNG + SVG + PDF', ok: true },
      { text: '5 QR dynamiques', ok: true },
      { text: 'Modification sans réimpression', ok: true },
      { text: 'Scan illimité', ok: true },
      { text: 'QR dynamiques illimités', ok: false },
    ]},
    { label: '🎨 Design', features: [
      { text: 'Logo centré sur QR', ok: true },
      { text: '14 styles de cadre', ok: true },
      { text: 'Formes de modules', ok: true },
    ]},
    { label: '📊 Analytics', features: [
      { text: 'Stats de base (30 jours)', ok: true },
      { text: 'Analytics pays & appareils', ok: false },
    ]},
    { label: '🎟️ Billetterie & événements', features: [{ text: 'Billetterie QR', ok: false }]},
    { label: '💳 Paiement Mobile Money', features: [{ text: 'Paiements Wave / Orange / MTN', ok: false }]},
    { label: '📋 Formulaires & prospects', features: [{ text: 'Formulaires de capture', ok: false }]},
    { label: '🏢 Équipes', features: [{ text: 'Organisations & collaborateurs', ok: false }]},
    { label: '🎁 Parrainage', features: [{ text: 'Programme de parrainage', ok: true }]},
  ],
  // Pro
  [
    { label: '📱 QR Codes', features: [
      { text: 'QR statiques illimités', ok: true },
      { text: 'PNG + SVG + PDF illimité', ok: true },
      { text: '50 QR dynamiques', ok: true },
      { text: 'Menu, Coupon, Bio Links, Catalogue', ok: true },
      { text: 'vCard Plus + App Store + PDF', ok: true },
      { text: 'Édition en temps réel', ok: true },
    ]},
    { label: '🎨 Design', features: [
      { text: 'Logo + 14 cadres + modules', ok: true },
      { text: 'Export HD haute résolution', ok: true },
      { text: 'Avis clients (Google Review QR)', ok: true },
    ]},
    { label: '📊 Analytics', features: [
      { text: 'Analytics complets 90 jours', ok: true },
      { text: 'Pays, appareils, OS', ok: true },
    ]},
    { label: '🎟️ Billetterie & événements', features: [
      { text: '5 événements actifs', ok: true },
      { text: 'Inscription + billet QR unique', ok: true },
      { text: 'Validation scan à l\'entrée', ok: true },
    ]},
    { label: '💳 Paiement Mobile Money', features: [
      { text: 'Wave + Orange Money + MTN MoMo', ok: true },
      { text: 'Montant fixe ou libre', ok: true },
      { text: 'Historique des paiements reçus', ok: true },
    ]},
    { label: '📋 Formulaires & prospects', features: [
      { text: '5 formulaires actifs', ok: true },
      { text: 'Champs personnalisés', ok: true },
      { text: 'Export des réponses', ok: true },
    ]},
    { label: '🏢 Équipes', features: [{ text: 'Organisations & collaborateurs', ok: false }]},
    { label: '🎁 Parrainage', features: [
      { text: 'Programme de parrainage', ok: true },
      { text: 'Lien personnalisé + crédits', ok: true },
    ]},
  ],
  // Business
  [
    { label: '📱 QR Codes', features: [
      { text: 'QR dynamiques illimités', ok: true },
      { text: 'Tous les types Pro inclus', ok: true },
      { text: 'Génération en lot (1 000 QR)', ok: true },
      { text: 'Tests A/B de contenu', ok: true },
      { text: 'API REST', ok: true },
      { text: 'Scan illimité', ok: true },
    ]},
    { label: '🎨 Design', features: [
      { text: 'Tous les designs Pro', ok: true },
      { text: 'Export en masse', ok: true },
      { text: 'Personnalisation avancée', ok: true },
    ]},
    { label: '📊 Analytics', features: [
      { text: 'Analytics avancés illimités', ok: true },
      { text: 'Rapports & exports CSV', ok: true },
    ]},
    { label: '🎟️ Billetterie & événements', features: [
      { text: 'Événements illimités', ok: true },
      { text: 'Capacité illimitée par événement', ok: true },
      { text: 'Validation multi-agents', ok: true },
    ]},
    { label: '💳 Paiement Mobile Money', features: [
      { text: 'Paiements QR illimités', ok: true },
      { text: 'Wave + Orange + MTN + carte', ok: true },
      { text: 'Tableau de bord des encaissements', ok: true },
    ]},
    { label: '📋 Formulaires & prospects', features: [
      { text: 'Formulaires illimités', ok: true },
      { text: 'Export CSV des soumissions', ok: true },
      { text: 'Notification WhatsApp des réponses', ok: true },
    ]},
    { label: '🏢 Équipes', features: [
      { text: '5 collaborateurs inclus', ok: true },
      { text: 'Rôles : admin / éditeur / lecteur', ok: true },
      { text: 'Invitations par email', ok: true },
    ]},
    { label: '🎁 Parrainage', features: [
      { text: 'Programme de parrainage', ok: true },
      { text: 'Support prioritaire WhatsApp', ok: true },
    ]},
  ],
]

function PricingCard({ p, onPay, loading }: { p: Plan; onPay: (id: string) => void; loading: string | null }) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const t = useTranslations('pricing')

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
          ? 'border-2 border-[#FF6A00] shadow-xl shadow-orange-500/10 bg-white lg:scale-105 z-10'
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
        {p.equiv && <p className="text-xs text-gray-400 mt-1">{p.equiv}</p>}
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
        {expanded ? t('hideDetails') : t('showDetails')}
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
            {loading === p.id ? t('redirecting') : p.cta}
          </button>
        )}
      </div>
    </div>
  )
}

type Billing = 'monthly' | 'semiannual' | 'annual'

// Monthly base prices (FCFA)
const BASE_PRICES = { essential: 1500, pro: 3500, business: 8000 }

function computePrice(base: number, billing: Billing) {
  if (billing === 'monthly') return { monthly: base, total: base, unit: 'FCFA / mois', saving: null }
  if (billing === 'semiannual') {
    // 6 months, pay 5 (1 mois offert)
    const total = base * 5
    return { monthly: Math.round(total / 6), total, unit: 'FCFA / mois', saving: `1 mois offert — ${total.toLocaleString('fr')} FCFA / 6 mois` }
  }
  // annual: 12 months, pay 10 (2 mois offerts)
  const total = base * 10
  return { monthly: Math.round(total / 12), total, unit: 'FCFA / mois', saving: `2 mois offerts — ${total.toLocaleString('fr')} FCFA / an` }
}

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const router = useRouter()
  const t = useTranslations('pricing')

  const essential = computePrice(BASE_PRICES.essential, billing)
  const pro = computePrice(BASE_PRICES.pro, billing)
  const business = computePrice(BASE_PRICES.business, billing)

  const plans: Plan[] = [
    {
      id: 'free',
      name: t('plan_free_name'),
      price: '0',
      unit: '',
      badge: null,
      highlight: false,
      color: '#64748b',
      desc: t('plan_free_desc'),
      cta: t('plan_free_cta'),
      href: '#generateur',
      groups: planGroups[0],
    },
    {
      id: billing === 'monthly' ? 'essential' : `essential_${billing === 'semiannual' ? 'semi' : 'annual'}`,
      name: t('plan_essential_name'),
      price: essential.monthly.toLocaleString('fr'),
      unit: essential.unit,
      equiv: essential.saving ?? '≈ 2,29 € · 2,42 $',
      badge: billing !== 'monthly' ? `${billing === 'semiannual' ? '−1 mois' : '−2 mois'}` : null,
      highlight: false,
      color: '#3b82f6',
      desc: t('plan_essential_desc'),
      cta: t('plan_essential_cta'),
      groups: planGroups[1],
    },
    {
      id: billing === 'monthly' ? 'pro' : `pro_${billing === 'semiannual' ? 'semi' : 'annual'}`,
      name: t('plan_pro_name'),
      price: pro.monthly.toLocaleString('fr'),
      unit: pro.unit,
      equiv: pro.saving ?? '≈ 5,34 € · 5,65 $',
      badge: billing !== 'monthly' ? `${billing === 'semiannual' ? '−1 mois offert' : '−2 mois offerts'}` : t('badge_popular'),
      highlight: true,
      color: '#FF6A00',
      desc: t('plan_pro_desc'),
      cta: t('plan_pro_cta'),
      groups: planGroups[2],
    },
    {
      id: billing === 'monthly' ? 'business' : `business_${billing === 'semiannual' ? 'semi' : 'annual'}`,
      name: t('plan_business_name'),
      price: business.monthly.toLocaleString('fr'),
      unit: business.unit,
      equiv: business.saving ?? '≈ 12,20 € · 12,90 $',
      badge: billing !== 'monthly' ? `${billing === 'semiannual' ? '−1 mois' : '−2 mois'}` : null,
      highlight: false,
      color: '#041B4D',
      desc: t('plan_business_desc'),
      cta: t('plan_business_cta'),
      groups: planGroups[3],
    },
  ]

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
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
            {t('title')}
          </h2>
          <p className="text-gray-500 text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Billing period toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm gap-1">
            {([
              { key: 'monthly', label: 'Mensuel' },
              { key: 'semiannual', label: 'Semestriel', badge: '−1 mois' },
              { key: 'annual', label: 'Annuel', badge: '−2 mois' },
            ] as { key: Billing; label: string; badge?: string }[]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setBilling(opt.key)}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  billing === opt.key
                    ? 'bg-[#FF6A00] text-white shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
                {opt.badge && (
                  <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    billing === opt.key ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                  }`}>
                    {opt.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {billing !== 'monthly' && (
          <p className="text-center text-sm text-green-600 font-semibold mb-6">
            {billing === 'semiannual' ? '🎁 1 mois offert — économisez 16% sur 6 mois' : '🎁 2 mois offerts — économisez 17% sur 12 mois'}
          </p>
        )}

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
            <h3 className="font-bold text-[#041B4D]">{t('comparison')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider w-1/3">{t('feature')}</th>
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
                  <h3 className="font-extrabold text-2xl">{t('enterprise_title')}</h3>
                  <p className="text-blue-300 text-sm">{t('enterprise_sub')}</p>
                </div>
              </div>
              <p className="text-blue-200 text-sm mb-4">
                {t('enterprise_desc')}
              </p>
              <a href="https://wa.me/2250778551234?text=Bonjour%2C%20je%20souhaite%20un%20devis%20Entreprise%20pour%20QR%20CODE%20EXPRESS"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                {t('enterprise_cta')}
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

        {/* Packs de crédits à la carte */}
        <div className="mt-10 bg-gradient-to-br from-[#041B4D] to-[#0d2d6e] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🪙</span>
                  <h3 className="font-extrabold text-white text-xl">Crédits à la carte</h3>
                  <span className="text-[10px] font-bold bg-[#FF6A00] text-white px-2 py-0.5 rounded-full">SANS ABONNEMENT</span>
                </div>
                <p className="text-blue-200 text-sm">Achetez des crédits une seule fois. Utilisez-les pour débloquer des fonctionnalités premium à l'unité.</p>
              </div>
              <a href="/portefeuille"
                className="flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white border-2 border-white/20 hover:bg-white/10 transition-colors whitespace-nowrap">
                Mon portefeuille →
              </a>
            </div>
          </div>

          {/* Credit packs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            {[
              { id: 'starter',  credits: 50,   amount: 1000,  label: 'Starter',  desc: '20 FCFA / crédit',  color: '#64748b' },
              { id: 'boost',    credits: 200,  amount: 3500,  label: 'Boost',    desc: '17,5 FCFA / crédit', color: '#3b82f6' },
              { id: 'pro',      credits: 500,  amount: 7500,  label: 'Pro',      desc: '15 FCFA / crédit',   color: '#FF6A00', popular: true },
              { id: 'ultimate', credits: 1000, amount: 12000, label: 'Ultimate', desc: '12 FCFA / crédit',   color: '#10b981' },
            ].map(pack => (
              <div key={pack.id} className={`relative bg-white/10 rounded-xl border ${(pack as any).popular ? 'border-[#FF6A00]' : 'border-white/10'} p-4 flex flex-col gap-2`}>
                {(pack as any).popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FF6A00] text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                    Meilleur rapport
                  </span>
                )}
                <p className="text-white font-bold text-sm">{pack.label}</p>
                <p className="text-white text-3xl font-extrabold">{pack.credits >= 1000 ? `${pack.credits / 1000}K` : pack.credits}<span className="text-sm font-normal text-white/60 ml-1">crédits</span></p>
                <p className="text-white/50 text-xs">{pack.desc}</p>
                <p className="text-[#FF6A00] font-extrabold text-lg">{pack.amount.toLocaleString('fr')} FCFA</p>
                <a href="/portefeuille" className="mt-1 block text-center py-2 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
                  Acheter
                </a>
              </div>
            ))}
          </div>

          {/* What you can buy with credits */}
          <div className="px-6 pb-6">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Ce que vous pouvez faire avec vos crédits</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: '✨', label: 'QR artistique IA',            cost: '20 crédits' },
                { icon: '⚡', label: 'QR dynamique supplémentaire', cost: '50 crédits' },
                { icon: '📥', label: 'Import bulk (10 QR)',          cost: '1 crédit' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-white text-xs font-semibold leading-tight">{item.label}</p>
                    <p className="text-[#FF6A00] text-xs font-bold">{item.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 mb-3 font-medium">{t('payment_methods')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              '💳 Carte Stripe',
              '🌊 Wave',
              '🟠 Orange Money',
              '🟡 MTN MoMo',
              '🔵 Moov Money',
              '🟣 Free Money',
              '🟢 M-Pesa',
              '🔴 Airtel Money',
            ].map((m) => (
              <span key={m} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-600 font-medium shadow-sm">
                {m}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">CI · SN · CM · ML · BF · GH · KE · TZ · BJ · TG · GN · et plus</p>
        </div>

      </div>
    </section>
  )
}
