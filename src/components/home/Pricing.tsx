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
  // Gratuit
  [
    { label: '📱 QR Codes', features: [
      { text: '5 QR statiques permanents', ok: true },
      { text: 'Générateur illimité (non sauvegardé)', ok: true },
      { text: 'PNG uniquement', ok: true },
      { text: 'SVG / PDF', ok: false },
      { text: 'QR dynamiques', ok: false },
    ]},
    { label: '📊 Codes-barres', features: [
      { text: '10 codes / mois', ok: true },
      { text: 'EAN-13 + Code 128 uniquement', ok: true },
      { text: 'PNG uniquement', ok: true },
      { text: 'SVG / tous formats', ok: false },
      { text: 'Batch CSV', ok: false },
    ]},
    { label: '🏷️ Étiquettes', features: [
      { text: '1 gabarit (prix 58×40)', ok: true },
      { text: 'Watermark "QR CODE EXPRESS"', ok: true },
      { text: '5 étiquettes max / PDF', ok: true },
      { text: 'Upload logo', ok: false },
      { text: 'Gabarits premium', ok: false },
    ]},
    { label: '📊 Analytics', features: [{ text: 'Statistiques', ok: false }]},
    { label: '🎁 Parrainage', features: [{ text: 'Programme de parrainage', ok: false }]},
  ],
  // Starter
  [
    { label: '📱 QR Codes', features: [
      { text: '20 QR statiques', ok: true },
      { text: '2 QR dynamiques', ok: true },
      { text: 'PNG + SVG', ok: true },
      { text: 'Modification sans réimpression', ok: true },
      { text: 'Analytics basiques', ok: true },
      { text: 'QR dynamiques illimités', ok: false },
    ]},
    { label: '📊 Codes-barres', features: [
      { text: '100 codes / mois', ok: true },
      { text: '10 formats (EAN-13, Code 128, Code 39, QR, PDF417…)', ok: true },
      { text: 'PNG + SVG', ok: true },
      { text: 'Batch CSV', ok: false },
      { text: 'Tous les 26 formats', ok: false },
    ]},
    { label: '🏷️ Étiquettes', features: [
      { text: '10 gabarits (prix, badge, étagère, pharmacie…)', ok: true },
      { text: 'Upload logo', ok: true },
      { text: 'Sans watermark', ok: true },
      { text: '24 étiquettes / PDF', ok: true },
      { text: 'Avery L7160', ok: false },
    ]},
    { label: '📊 Analytics', features: [{ text: 'Statistiques de base', ok: true }]},
    { label: '🎁 Parrainage', features: [{ text: 'Programme de parrainage', ok: true }]},
  ],
  // Essentiel
  [
    { label: '📱 QR Codes', features: [
      { text: '100 QR statiques', ok: true },
      { text: '10 QR dynamiques', ok: true },
      { text: 'PNG + SVG + PDF', ok: true },
      { text: 'Logo centré sur QR', ok: true },
      { text: '14 styles de cadre', ok: true },
      { text: 'Analytics 30 jours', ok: true },
    ]},
    { label: '📊 Codes-barres', features: [
      { text: 'Codes-barres illimités', ok: true },
      { text: '26 formats complets', ok: true },
      { text: 'PNG + SVG vectoriel', ok: true },
      { text: 'Batch CSV — 100 codes / lot', ok: true },
      { text: 'ZIP automatique', ok: true },
    ]},
    { label: '🏷️ Étiquettes', features: [
      { text: '20 gabarits (10 catégories)', ok: true },
      { text: 'Upload logo + code-barres', ok: true },
      { text: 'Feuille Avery L7160', ok: true },
      { text: 'Étiquettes illimitées / PDF', ok: true },
    ]},
    { label: '📋 Formulaires', features: [{ text: '3 formulaires actifs', ok: true }]},
    { label: '🎁 Parrainage', features: [{ text: 'Programme de parrainage', ok: true }]},
  ],
  // Pro
  [
    { label: '📱 QR Codes', features: [
      { text: 'QR statiques illimités', ok: true },
      { text: '100 QR dynamiques', ok: true },
      { text: 'Menu, Coupon, Bio Links, Catalogue', ok: true },
      { text: 'vCard Plus + App Store + PDF', ok: true },
      { text: 'Analytics 90 jours', ok: true },
      { text: 'Export HD haute résolution', ok: true },
    ]},
    { label: '📊 Codes-barres', features: [
      { text: 'Illimité — tous formats', ok: true },
      { text: 'Batch CSV — 500 codes / lot', ok: true },
      { text: 'Historique complet', ok: true },
    ]},
    { label: '🏷️ Étiquettes', features: [
      { text: 'Tous les 31 gabarits · 10 catégories', ok: true },
      { text: 'Avery · Thermique · Offset', ok: true },
      { text: 'Historique étiquettes', ok: true },
    ]},
    { label: '🎟️ Billetterie', features: [
      { text: '10 événements actifs', ok: true },
      { text: 'Inscription + billet QR unique', ok: true },
      { text: 'Validation scan à l\'entrée', ok: true },
    ]},
    { label: '💳 Paiement Mobile Money', features: [
      { text: 'Wave + Orange Money + MTN MoMo', ok: true },
      { text: 'Montant fixe ou libre', ok: true },
    ]},
    { label: '📋 Formulaires', features: [
      { text: '10 formulaires actifs', ok: true },
      { text: 'Export des réponses', ok: true },
    ]},
    { label: '🎁 Parrainage', features: [
      { text: 'Programme de parrainage', ok: true },
      { text: 'Lien personnalisé + crédits', ok: true },
    ]},
  ],
  // Business
  [
    { label: '📱 QR Codes', features: [
      { text: 'QR dynamiques illimités', ok: true },
      { text: 'Génération en lot (1 000 QR)', ok: true },
      { text: 'Analytics illimités + exports CSV', ok: true },
      { text: 'Tests A/B de contenu', ok: true },
      { text: 'API REST', ok: true },
    ]},
    { label: '📊 Codes-barres', features: [
      { text: 'Batch CSV — 2 000 codes / lot', ok: true },
      { text: 'API codes-barres', ok: true },
    ]},
    { label: '🏷️ Étiquettes', features: [
      { text: 'Tout illimité', ok: true },
    ]},
    { label: '🎟️ Billetterie & Paiements', features: [
      { text: 'Événements illimités', ok: true },
      { text: 'Paiements QR illimités', ok: true },
      { text: 'Tableau de bord encaissements', ok: true },
    ]},
    { label: '📋 Formulaires', features: [
      { text: 'Formulaires illimités', ok: true },
      { text: 'Notification WhatsApp des réponses', ok: true },
    ]},
    { label: '🏢 Équipes', features: [
      { text: '10 collaborateurs inclus', ok: true },
      { text: 'Rôles : admin / éditeur / lecteur', ok: true },
    ]},
    { label: '🎁 Support', features: [
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

      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-[#041B4D] text-base">{p.name}</h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">{p.desc}</p>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-extrabold text-[#041B4D]">{p.price}</span>
          {p.unit && <span className="text-sm text-gray-400 mb-1">{p.unit}</span>}
        </div>
        {p.equiv && <p className="text-xs text-gray-400 mt-1">{p.equiv}</p>}
      </div>

      <ul className="flex-1 p-4 space-y-2">
        {topFeatures.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex-shrink-0 font-bold text-green-500">✓</span>
            <span className="text-gray-700">{f.text}</span>
          </li>
        ))}
        {allFeatures.filter(f => !f.ok).slice(0, 2).map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex-shrink-0 font-bold text-gray-300">✗</span>
            <span className="text-gray-350 line-through">{f.text}</span>
          </li>
        ))}
      </ul>

      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50 pt-3 space-y-4">
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

      <button
        onClick={() => setExpanded(!expanded)}
        className="mx-4 mb-3 text-xs text-gray-400 hover:text-[#FF6A00] transition-colors font-semibold flex items-center gap-1 justify-center py-1.5 border border-gray-100 rounded-lg hover:border-[#FF6A00]/30"
      >
        {expanded ? t('hideDetails') : t('showDetails')}
      </button>

      <div className="p-4 pt-0">
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

const BASE_PRICES = { starter: 4900, essential: 9900, pro: 19900, business: 29900 }

function computePrice(base: number, billing: Billing) {
  if (billing === 'monthly') return { monthly: base, total: base, unit: 'FCFA / mois', saving: null }
  if (billing === 'semiannual') {
    const total = base * 5
    return { monthly: Math.round(total / 6), total, unit: 'FCFA / mois', saving: `1 mois offert — ${total.toLocaleString('fr')} FCFA / 6 mois` }
  }
  const total = base * 10
  return { monthly: Math.round(total / 12), total, unit: 'FCFA / mois', saving: `2 mois offerts — ${total.toLocaleString('fr')} FCFA / an` }
}

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const router = useRouter()
  const t = useTranslations('pricing')

  const starter = computePrice(BASE_PRICES.starter, billing)
  const essential = computePrice(BASE_PRICES.essential, billing)
  const pro = computePrice(BASE_PRICES.pro, billing)
  const business = computePrice(BASE_PRICES.business, billing)

  const suffix = billing === 'monthly' ? '' : billing === 'semiannual' ? '_semi' : '_annual'

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0',
      unit: '',
      badge: null,
      highlight: false,
      color: '#64748b',
      desc: 'Pour découvrir la plateforme sans engagement',
      cta: 'Commencer gratuitement',
      href: '#generateur',
      groups: planGroups[0],
    },
    {
      id: `starter${suffix}`,
      name: 'Starter',
      price: starter.monthly.toLocaleString('fr'),
      unit: starter.unit,
      equiv: starter.saving ?? '≈ 7,48 € · 7,91 $',
      badge: billing !== 'monthly' ? (billing === 'semiannual' ? '−1 mois offert' : '−2 mois offerts') : null,
      highlight: false,
      color: '#3b82f6',
      desc: 'Pour les indépendants et petits commerces',
      cta: 'Choisir Starter',
      groups: planGroups[1],
    },
    {
      id: `essential${suffix}`,
      name: 'Essentiel',
      price: essential.monthly.toLocaleString('fr'),
      unit: essential.unit,
      equiv: essential.saving ?? '≈ 15,11 € · 15,98 $',
      badge: billing !== 'monthly' ? (billing === 'semiannual' ? '−1 mois' : '−2 mois') : null,
      highlight: false,
      color: '#0ea5e9',
      desc: 'Pour les PME et professionnels actifs',
      cta: 'Choisir Essentiel',
      groups: planGroups[2],
    },
    {
      id: `pro${suffix}`,
      name: 'Pro',
      price: pro.monthly.toLocaleString('fr'),
      unit: pro.unit,
      equiv: pro.saving ?? '≈ 30,37 € · 32,12 $',
      badge: billing !== 'monthly' ? (billing === 'semiannual' ? '−1 mois' : '−2 mois') : t('badge_popular'),
      highlight: true,
      color: '#FF6A00',
      desc: 'Billetterie, paiements, formulaires inclus',
      cta: 'Choisir Pro',
      groups: planGroups[3],
    },
    {
      id: `business${suffix}`,
      name: 'Business',
      price: business.monthly.toLocaleString('fr'),
      unit: business.unit,
      equiv: business.saving ?? '≈ 45,63 € · 48,25 $',
      badge: billing !== 'monthly' ? (billing === 'semiannual' ? '−1 mois' : '−2 mois') : null,
      highlight: false,
      color: '#041B4D',
      desc: 'Équipes, API, volumes illimités',
      cta: 'Choisir Business',
      groups: planGroups[4],
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
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
            {t('title')}
          </h2>
          <p className="text-gray-500 text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
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

        {/* 5 plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start mb-6">
          {plans.map((p) => (
            <PricingCard key={p.id} p={p} onPay={handlePay} loading={loading} />
          ))}
        </div>

        {/* Comparison table */}
        <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#041B4D]">{t('comparison')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider w-1/4">{t('feature')}</th>
                  {plans.map(p => (
                    <th key={p.id} className={`px-3 py-3 text-center font-bold text-xs ${p.highlight ? 'text-[#FF6A00]' : 'text-[#041B4D]'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '📱 QR statiques', values: ['5', '20', '100', 'Illimités', 'Illimités'] },
                  { label: '⚡ QR dynamiques', values: ['—', '2', '10', '100', 'Illimités'] },
                  { label: '🖼️ Export PNG/SVG/PDF', values: ['PNG seul', 'PNG+SVG', 'PNG+SVG+PDF', 'PNG+SVG+PDF', 'PNG+SVG+PDF'] },
                  { label: '📊 Barcodes / mois', values: ['10', '100', 'Illimité', 'Illimité', 'Illimité'] },
                  { label: '🔢 Formats barcode', values: ['2 formats', '10 formats', '26 formats', '26 formats', '26 formats'] },
                  { label: '📋 Batch CSV barcodes', values: ['—', '—', '100 / lot', '500 / lot', '2 000 / lot'] },
                  { label: '🏷️ Gabarits étiquettes', values: ['2 + watermark', '10 sans watermark', '20 (10 catégories)', '31 + custom', '31 + custom'] },
                  { label: '📄 Avery L7160', values: ['—', '—', '✓', '✓', '✓'] },
                  { label: '📈 Analytics', values: ['—', 'Basiques', '30 jours', '90 jours', 'Illimité'] },
                  { label: '🎨 Design studio', values: ['—', '—', '✓', '✓', '✓'] },
                  { label: '🍽️ Menu / Coupon / Bio', values: ['—', '—', '—', '✓', '✓'] },
                  { label: '🎟️ Billetterie QR', values: ['—', '—', '—', '10 événements', 'Illimité'] },
                  { label: '💳 Paiement Mobile Money', values: ['—', '—', '—', '✓', '✓'] },
                  { label: '📋 Formulaires prospects', values: ['—', '—', '3', '10', 'Illimité'] },
                  { label: '🏢 Équipes / collaborateurs', values: ['—', '—', '—', '—', '10 membres'] },
                  { label: '🔌 API REST', values: ['—', '—', '—', '—', '✓'] },
                  { label: '🎁 Parrainage', values: ['—', '✓', '✓', '✓', '✓'] },
                  { label: '💬 Support', values: ['—', 'Email', 'Email', 'Email', 'WhatsApp prio'] },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                    <td className="px-5 py-3 font-medium text-gray-700">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className={`px-3 py-3 text-center ${
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

        {/* Entreprise */}
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
              <p className="text-blue-200 text-sm mb-4">{t('enterprise_desc')}</p>
              <a href="https://wa.me/2250778551234?text=Bonjour%2C%20je%20souhaite%20un%20devis%20Entreprise%20pour%20QR%20CODE%20EXPRESS"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                {t('enterprise_cta')}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-shrink-0 w-full md:w-auto">
              {[
                'QR codes illimités', 'Barcodes illimités',
                'Étiquettes illimitées', 'Collaborateurs illimités',
                'Billetterie illimitée', 'Paiements illimités',
                'Formulaires illimités', 'Génération en lot illimitée',
                'API REST illimitée', 'White label (votre marque)',
                'SLA + Support dédié', 'Organisations illimitées',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/90 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                  <span className="text-green-400 font-bold">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Crédits à la carte */}
        <div className="mt-4 bg-gradient-to-br from-[#041B4D] to-[#0d2d6e] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🪙</span>
                  <h3 className="font-extrabold text-white text-xl">Crédits à la carte</h3>
                  <span className="text-[10px] font-bold bg-[#FF6A00] text-white px-2 py-0.5 rounded-full">SANS ABONNEMENT</span>
                </div>
                <p className="text-blue-200 text-sm">Achetez des crédits une seule fois. Utilisez-les pour débloquer des fonctionnalités premium à l&apos;unité.</p>
              </div>
              <a href="/portefeuille"
                className="flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white border-2 border-white/20 hover:bg-white/10 transition-colors whitespace-nowrap">
                Mon portefeuille →
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            {[
              { id: 'starter',  credits: 50,   amount: 1000,  label: 'Starter',  desc: '20 FCFA / crédit',   color: '#64748b' },
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

          <div className="px-6 pb-6">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Ce que vous pouvez faire avec vos crédits</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: '✨', label: 'QR artistique IA',              cost: '20 crédits' },
                { icon: '⚡', label: 'QR dynamique supplémentaire',   cost: '50 crédits' },
                { icon: '📊', label: 'Batch CSV (10 codes-barres)',    cost: '5 crédits' },
                { icon: '📥', label: 'Import bulk QR (10 QR)',         cost: '1 crédit' },
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
            {['💳 Carte Stripe', '🌊 Wave', '🟠 Orange Money', '🟡 MTN MoMo', '🔵 Moov Money', '🟣 Free Money', '🟢 M-Pesa', '🔴 Airtel Money'].map((m) => (
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
