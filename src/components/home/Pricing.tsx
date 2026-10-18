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

function computePrice(base: number, billing: Billing, unit: string) {
  if (billing === 'monthly') return { monthly: base, total: base, unit, saving: null }
  if (billing === 'semiannual') {
    const total = base * 5
    return { monthly: Math.round(total / 6), total, unit, saving: null }
  }
  const total = base * 10
  return { monthly: Math.round(total / 12), total, unit, saving: null }
}

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const router = useRouter()
  const t = useTranslations('pricing')

  const planGroups = [
    // Free
    [
      { label: t('grp_qr'), features: [
        { text: t('pf_free_qr_1'), ok: true },
        { text: t('pf_free_qr_2'), ok: true },
        { text: t('pf_free_qr_3'), ok: true },
        { text: t('pf_free_qr_4'), ok: true },
        { text: t('pf_free_qr_5'), ok: false },
        { text: t('pf_free_qr_6'), ok: false },
      ]},
      { label: t('grp_bc'), features: [
        { text: t('pf_free_bc_1'), ok: true },
        { text: t('pf_free_bc_2'), ok: true },
        { text: t('pf_free_bc_3'), ok: true },
        { text: t('pf_free_bc_4'), ok: false },
        { text: t('pf_free_bc_5'), ok: false },
      ]},
      { label: t('grp_lbl'), features: [
        { text: t('pf_free_lbl_1'), ok: true },
        { text: t('pf_free_lbl_2'), ok: true },
        { text: t('pf_free_lbl_3'), ok: true },
        { text: t('pf_free_lbl_4'), ok: false },
        { text: t('pf_free_lbl_5'), ok: false },
      ]},
      { label: t('grp_ana'), features: [{ text: t('pf_free_ana_1'), ok: false }]},
      { label: t('grp_ref'), features: [{ text: t('pf_free_ref_1'), ok: false }]},
    ],
    // Starter
    [
      { label: t('grp_qr'), features: [
        { text: t('pf_strt_qr_1'), ok: true },
        { text: t('pf_strt_qr_2'), ok: true },
        { text: t('pf_strt_qr_3'), ok: true },
        { text: t('pf_strt_qr_4'), ok: true },
        { text: t('pf_strt_qr_5'), ok: true },
        { text: t('pf_strt_qr_6'), ok: false },
      ]},
      { label: t('grp_new_types'), features: [
        { text: t('pf_strt_new_1'), ok: true },
        { text: t('pf_strt_new_2'), ok: true },
        { text: t('pf_strt_new_3'), ok: false },
        { text: t('pf_strt_new_4'), ok: false },
      ]},
      { label: t('grp_bc'), features: [
        { text: t('pf_strt_bc_1'), ok: true },
        { text: t('pf_strt_bc_2'), ok: true },
        { text: t('pf_strt_bc_3'), ok: true },
        { text: t('pf_strt_bc_4'), ok: false },
        { text: t('pf_strt_bc_5'), ok: false },
      ]},
      { label: t('grp_lbl'), features: [
        { text: t('pf_strt_lbl_1'), ok: true },
        { text: t('pf_strt_lbl_2'), ok: true },
        { text: t('pf_strt_lbl_3'), ok: true },
        { text: t('pf_strt_lbl_4'), ok: true },
        { text: t('pf_strt_lbl_5'), ok: false },
      ]},
      { label: t('grp_ana'), features: [{ text: t('pf_strt_ana_1'), ok: true }]},
      { label: t('grp_ref'), features: [{ text: t('pf_strt_ref_1'), ok: true }]},
    ],
    // Essential
    [
      { label: t('grp_qr'), features: [
        { text: t('pf_ess_qr_1'), ok: true },
        { text: t('pf_ess_qr_2'), ok: true },
        { text: t('pf_ess_qr_3'), ok: true },
        { text: t('pf_ess_qr_4'), ok: true },
        { text: t('pf_ess_qr_5'), ok: true },
        { text: t('pf_ess_qr_6'), ok: true },
      ]},
      { label: t('grp_new_types'), features: [
        { text: t('pf_ess_new_1'), ok: true },
        { text: t('pf_ess_new_2'), ok: true },
        { text: t('pf_ess_new_3'), ok: true },
        { text: t('pf_ess_new_4'), ok: false },
        { text: t('pf_ess_new_5'), ok: false },
      ]},
      { label: t('grp_org'), features: [
        { text: t('pf_ess_org_1'), ok: true },
        { text: t('pf_ess_org_2'), ok: true },
      ]},
      { label: t('grp_bc'), features: [
        { text: t('pf_ess_bc_1'), ok: true },
        { text: t('pf_ess_bc_2'), ok: true },
        { text: t('pf_ess_bc_3'), ok: true },
        { text: t('pf_ess_bc_4'), ok: true },
        { text: t('pf_ess_bc_5'), ok: true },
      ]},
      { label: t('grp_lbl'), features: [
        { text: t('pf_ess_lbl_1'), ok: true },
        { text: t('pf_ess_lbl_2'), ok: true },
        { text: t('pf_ess_lbl_3'), ok: true },
        { text: t('pf_ess_lbl_4'), ok: true },
      ]},
      { label: t('grp_frm'), features: [{ text: t('pf_ess_frm_1'), ok: true }]},
      { label: t('grp_ref'), features: [{ text: t('pf_ess_ref_1'), ok: true }]},
    ],
    // Pro
    [
      { label: t('grp_qr'), features: [
        { text: t('pf_pro_qr_1'), ok: true },
        { text: t('pf_pro_qr_2'), ok: true },
        { text: t('pf_pro_qr_3'), ok: true },
        { text: t('pf_pro_qr_4'), ok: true },
        { text: t('pf_pro_qr_5'), ok: true },
        { text: t('pf_pro_qr_6'), ok: true },
      ]},
      { label: t('grp_new_types'), features: [
        { text: t('pf_pro_new_1'), ok: true },
        { text: t('pf_pro_new_2'), ok: true },
        { text: t('pf_pro_new_3'), ok: true },
        { text: t('pf_pro_new_4'), ok: false },
      ]},
      { label: t('grp_org'), features: [
        { text: t('pf_pro_org_1'), ok: true },
        { text: t('pf_pro_org_2'), ok: true },
        { text: t('pf_pro_org_3'), ok: true },
      ]},
      { label: t('grp_bc'), features: [
        { text: t('pf_pro_bc_1'), ok: true },
        { text: t('pf_pro_bc_2'), ok: true },
        { text: t('pf_pro_bc_3'), ok: true },
      ]},
      { label: t('grp_lbl'), features: [
        { text: t('pf_pro_lbl_1'), ok: true },
        { text: t('pf_pro_lbl_2'), ok: true },
        { text: t('pf_pro_lbl_3'), ok: true },
      ]},
      { label: t('grp_tkt'), features: [
        { text: t('pf_pro_tkt_1'), ok: true },
        { text: t('pf_pro_tkt_2'), ok: true },
        { text: t('pf_pro_tkt_3'), ok: true },
      ]},
      { label: t('grp_pay'), features: [
        { text: t('pf_pro_pay_1'), ok: true },
        { text: t('pf_pro_pay_2'), ok: true },
      ]},
      { label: t('grp_frm'), features: [
        { text: t('pf_pro_frm_1'), ok: true },
        { text: t('pf_pro_frm_2'), ok: true },
      ]},
      { label: t('grp_ref'), features: [
        { text: t('pf_pro_ref_1'), ok: true },
        { text: t('pf_pro_ref_2'), ok: true },
      ]},
    ],
    // Business
    [
      { label: t('grp_qr'), features: [
        { text: t('pf_biz_qr_1'), ok: true },
        { text: t('pf_biz_qr_2'), ok: true },
        { text: t('pf_biz_qr_3'), ok: true },
        { text: t('pf_biz_qr_4'), ok: true },
        { text: t('pf_biz_qr_5'), ok: true },
      ]},
      { label: t('grp_new_types'), features: [
        { text: t('pf_biz_new_1'), ok: true },
        { text: t('pf_biz_new_2'), ok: true },
        { text: t('pf_biz_new_3'), ok: true },
      ]},
      { label: t('grp_org'), features: [
        { text: t('pf_biz_org_1'), ok: true },
        { text: t('pf_biz_org_2'), ok: true },
      ]},
      { label: t('grp_bc'), features: [
        { text: t('pf_biz_bc_1'), ok: true },
        { text: t('pf_biz_bc_2'), ok: true },
      ]},
      { label: t('grp_lbl'), features: [
        { text: t('pf_biz_lbl_1'), ok: true },
      ]},
      { label: t('grp_tkt'), features: [
        { text: t('pf_biz_tkt_1'), ok: true },
        { text: t('pf_biz_tkt_2'), ok: true },
        { text: t('pf_biz_tkt_3'), ok: true },
      ]},
      { label: t('grp_frm'), features: [
        { text: t('pf_biz_frm_1'), ok: true },
        { text: t('pf_biz_frm_2'), ok: true },
      ]},
      { label: t('grp_team'), features: [
        { text: t('pf_biz_team_1'), ok: true },
        { text: t('pf_biz_team_2'), ok: true },
      ]},
      { label: t('grp_sup'), features: [
        { text: t('pf_biz_sup_1'), ok: true },
      ]},
    ],
  ]

  const priceUnit = t('price_unit')
  const starter = computePrice(BASE_PRICES.starter, billing, priceUnit)
  const essential = computePrice(BASE_PRICES.essential, billing, priceUnit)
  const pro = computePrice(BASE_PRICES.pro, billing, priceUnit)
  const business = computePrice(BASE_PRICES.business, billing, priceUnit)

  const suffix = billing === 'monthly' ? '' : billing === 'semiannual' ? '_semi' : '_annual'

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
      id: `starter${suffix}`,
      name: t('plan_starter_name'),
      price: starter.monthly.toLocaleString(),
      unit: starter.unit,
      equiv: starter.saving ?? '≈ 7,48 € · 7,91 $',
      badge: billing !== 'monthly' ? (billing === 'semiannual' ? t('billing_save1') : t('billing_save2')) : null,
      highlight: false,
      color: '#3b82f6',
      desc: t('plan_starter_desc'),
      cta: t('plan_starter_cta'),
      groups: planGroups[1],
    },
    {
      id: `essential${suffix}`,
      name: t('plan_essential_name'),
      price: essential.monthly.toLocaleString(),
      unit: essential.unit,
      equiv: essential.saving ?? '≈ 15,11 € · 15,98 $',
      badge: billing !== 'monthly' ? (billing === 'semiannual' ? t('billing_save1') : t('billing_save2')) : null,
      highlight: false,
      color: '#0ea5e9',
      desc: t('plan_essential_desc'),
      cta: t('plan_essential_cta'),
      groups: planGroups[2],
    },
    {
      id: `pro${suffix}`,
      name: t('plan_pro_name'),
      price: pro.monthly.toLocaleString(),
      unit: pro.unit,
      equiv: pro.saving ?? '≈ 30,37 € · 32,12 $',
      badge: billing !== 'monthly' ? (billing === 'semiannual' ? t('billing_save1') : t('billing_save2')) : t('badge_popular'),
      highlight: true,
      color: '#FF6A00',
      desc: t('plan_pro_desc'),
      cta: t('plan_pro_cta'),
      groups: planGroups[3],
    },
    {
      id: `business${suffix}`,
      name: t('plan_business_name'),
      price: business.monthly.toLocaleString(),
      unit: business.unit,
      equiv: business.saving ?? '≈ 45,63 € · 48,25 $',
      badge: billing !== 'monthly' ? (billing === 'semiannual' ? t('billing_save1') : t('billing_save2')) : null,
      highlight: false,
      color: '#041B4D',
      desc: t('plan_business_desc'),
      cta: t('plan_business_cta'),
      groups: planGroups[4],
    },
  ]

  const cmpRows = [
    { label: t('cmp_r_0'), values: ['5', '20', '100', t('cmp_unlimited_pl'), t('cmp_unlimited_pl')] },
    { label: t('cmp_r_1'), values: ['—', '2', '20', '100', t('cmp_unlimited_pl')] },
    { label: t('cmp_r_2'), values: [t('cmp_png_only'), 'PNG+SVG', 'PNG+SVG+PDF', 'PNG+SVG+PDF', 'PNG+SVG+PDF'] },
    // New QR types
    { label: t('cmp_r_crypto'), values: ['✓', '✓', '✓', '✓', '✓'] },
    { label: t('cmp_r_giftcard_job'), values: ['—', '✓', '✓', '✓', '✓'] },
    { label: t('cmp_r_ticket_appt_dl'), values: ['—', '—', '✓', '✓', '✓'] },
    { label: t('cmp_r_loyalty_survey'), values: ['—', '—', '—', '✓', '✓'] },
    // Organisation
    { label: t('cmp_r_folders_tags'), values: ['—', '—', '✓', '✓', '✓'] },
    { label: t('cmp_r_scan_limit'), values: ['—', '—', '✓', '✓', '✓'] },
    { label: t('cmp_r_embed'), values: ['—', '—', '—', '✓', '✓'] },
    // Barcodes & labels
    { label: t('cmp_r_3'), values: ['10', '100', t('cmp_unlimited'), t('cmp_unlimited'), t('cmp_unlimited')] },
    { label: t('cmp_r_4'), values: [t('cmp_2_formats'), t('cmp_10_formats'), t('cmp_26_formats'), t('cmp_26_formats'), t('cmp_26_formats')] },
    { label: t('cmp_r_5'), values: ['—', '—', t('cmp_100_batch'), t('cmp_500_batch'), t('cmp_2000_batch')] },
    { label: t('cmp_r_6'), values: [t('cmp_2_wm'), t('cmp_10_no_wm'), t('cmp_20_cat'), '31 + custom', '31 + custom'] },
    { label: t('cmp_r_7'), values: ['—', '—', '✓', '✓', '✓'] },
    // Analytics & features
    { label: t('cmp_r_8'), values: ['—', t('cmp_basic'), t('cmp_30d'), t('cmp_90d'), t('cmp_unlimited')] },
    { label: t('cmp_r_9'), values: ['—', '—', '✓', '✓', '✓'] },
    { label: t('cmp_r_10'), values: ['—', '—', '—', '✓', '✓'] },
    { label: t('cmp_r_11'), values: ['—', '—', '—', t('cmp_10_events'), t('cmp_unlimited')] },
    { label: t('cmp_r_12'), values: ['—', '—', '—', '✓', '✓'] },
    { label: t('cmp_r_13'), values: ['—', '—', '3', '10', t('cmp_unlimited')] },
    { label: t('cmp_r_14'), values: ['—', '—', '—', '—', '10'] },
    { label: t('cmp_r_15'), values: ['—', '—', '—', '—', '✓'] },
    { label: t('cmp_r_16'), values: ['—', '✓', '✓', '✓', '✓'] },
    { label: t('cmp_r_17'), values: ['—', 'Email', 'Email', 'Email', t('cmp_wa_prio')] },
  ]

  const entFeatures = [
    t('ent_f_1'), t('ent_f_2'), t('ent_f_3'), t('ent_f_4'),
    t('ent_f_5'), t('ent_f_6'), t('ent_f_7'), t('ent_f_8'),
    t('ent_f_9'), t('ent_f_10'), t('ent_f_11'), t('ent_f_12'),
  ]

  const creditItems = [
    { icon: '✨', label: t('cred_item_0'), cost: t('cred_cost_0') },
    { icon: '⚡', label: t('cred_item_1'), cost: t('cred_cost_1') },
    { icon: '📊', label: t('cred_item_2'), cost: t('cred_cost_2') },
    { icon: '📥', label: t('cred_item_3'), cost: t('cred_cost_3') },
  ]

  const paymentMethods = [
    t('pm_0'), t('pm_1'), t('pm_2'), t('pm_3'),
    t('pm_4'), t('pm_5'), t('pm_6'), t('pm_7'),
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
      alert(t('redirecting'))
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
              { key: 'monthly', label: t('billing_monthly') },
              { key: 'semiannual', label: t('billing_semiannual'), badge: t('billing_save1') },
              { key: 'annual', label: t('billing_annual'), badge: t('billing_save2') },
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
            {billing === 'semiannual' ? t('saving_semi') : t('saving_annual')}
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
                {cmpRows.map((row, i) => (
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
              {entFeatures.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/90 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                  <span className="text-green-400 font-bold">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credits section */}
        <div className="mt-4 bg-gradient-to-br from-[#041B4D] to-[#0d2d6e] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🪙</span>
                  <h3 className="font-extrabold text-white text-xl">{t('credits_title')}</h3>
                  <span className="text-[10px] font-bold bg-[#FF6A00] text-white px-2 py-0.5 rounded-full">{t('credits_badge')}</span>
                </div>
                <p className="text-blue-200 text-sm">{t('credits_desc')}</p>
              </div>
              <a href="/portefeuille"
                className="flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white border-2 border-white/20 hover:bg-white/10 transition-colors whitespace-nowrap">
                {t('credits_wallet')}
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
                    {t('credits_best')}
                  </span>
                )}
                <p className="text-white font-bold text-sm">{pack.label}</p>
                <p className="text-white text-3xl font-extrabold">{pack.credits >= 1000 ? `${pack.credits / 1000}K` : pack.credits}<span className="text-sm font-normal text-white/60 ml-1">{t('credits_unit')}</span></p>
                <p className="text-white/50 text-xs">{pack.desc}</p>
                <p className="text-[#FF6A00] font-extrabold text-lg">{pack.amount.toLocaleString()} FCFA</p>
                <a href="/portefeuille" className="mt-1 block text-center py-2 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
                  {t('credits_buy')}
                </a>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{t('credits_what_title')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {creditItems.map(item => (
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
            {paymentMethods.map((m) => (
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
