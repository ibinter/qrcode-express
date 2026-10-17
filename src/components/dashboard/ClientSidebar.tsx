'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8', essential: '#10b981', pro: '#3b82f6',
  business: '#7c3aed', agency: '#f59e0b', enterprise: '#ec4899',
}

interface Props {
  userEmail: string
  plan?: string
  credits?: number
}

function NavLink({ href, icon, label, exact, collapsed }: {
  href: string; icon: string; label: string; exact?: boolean; collapsed: boolean
}) {
  const path = usePathname()
  const active = exact ? path === href : path === href || path.startsWith(href + '/')
  const [tip, setTip] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => collapsed && setTip(true)} onMouseLeave={() => setTip(false)}>
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 group
          ${collapsed ? 'justify-center px-0 mx-2' : 'mx-1'}
          ${active
            ? 'bg-gradient-to-r from-[#FF6A00] to-[#ee5a24] text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
      >
        <span className={`text-base shrink-0 ${active ? '' : 'group-hover:scale-110 transition-transform'}`}>{icon}</span>
        {!collapsed && <span className="text-xs font-semibold truncate">{label}</span>}
        {active && !collapsed && <span className="ml-auto w-1 h-1 rounded-full bg-white/70" />}
      </Link>
      {collapsed && tip && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
            {label}
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-px bg-gray-100 mx-2 my-2" />
  return <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-1">{label}</p>
}

export default function ClientSidebar({ userEmail, plan = 'free', credits = 0 }: Props) {
  const t = useTranslations('sidebar')
  const [collapsed, setCollapsed] = useState(false)

  const NAV_ITEMS = [
    { href: '/dashboard', icon: '📱', label: t('my_qr'), exact: true },
    { href: '/dashboard/bulk', icon: '📥', label: t('import_csv') },
    { href: '/barcode', icon: '📊', label: t('barcodes') },
    { href: '/labels', icon: '🏷️', label: t('labels') },
  ]

  const TOOLS_ITEMS = [
    { href: '/org', icon: '🏢', label: t('orgs') },
    { href: '/parrainage', icon: '🎁', label: t('referral') },
    { href: '/portefeuille', icon: '💰', label: t('wallet') },
  ]

  const ACCOUNT_ITEMS = [
    { href: '/profil', icon: '👤', label: t('my_profile') },
    { href: '/tarifs', icon: '🏷️', label: t('change_plan') },
    { href: '/guide', icon: '📖', label: t('guide') },
  ]

  const PLAN_LABELS: Record<string, string> = {
    free: t('plan_free'), essential: t('plan_essential'), pro: 'Pro',
    business: 'Business', agency: 'Agency', enterprise: 'Enterprise',
  }

  useEffect(() => {
    const saved = localStorage.getItem('client-nav-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  const toggle = useCallback(() => {
    setCollapsed(v => {
      const next = !v
      localStorage.setItem('client-nav-collapsed', String(next))
      return next
    })
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggle() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [toggle])

  const planColor = PLAN_COLORS[plan] ?? '#94a3b8'
  const planLabel = PLAN_LABELS[plan] ?? plan
  const initials = userEmail[0]?.toUpperCase() ?? '?'

  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 bg-white border-r border-gray-100 shadow-sm overflow-hidden shrink-0 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 64 : 220 }}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-gray-100 h-14 shrink-0 ${collapsed ? 'justify-center' : 'px-4 justify-between'}`}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee0979)' }}>Q</div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-gray-900 tracking-tight leading-tight">QR EXPRESS</p>
              <p className="text-[9px] font-bold leading-tight" style={{ color: planColor }}>{planLabel}</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee0979)' }}>Q</div>
          </Link>
        )}
        <button
          onClick={toggle}
          title="Ctrl+B"
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0 ${
            collapsed ? 'absolute right-0 translate-x-1/2 bg-white border border-gray-200 shadow-sm' : ''
          }`}
        >
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <SectionLabel label="QR Codes" collapsed={collapsed} />
        {NAV_ITEMS.map(i => <NavLink key={i.href} {...i} collapsed={collapsed} />)}

        <SectionLabel label={t('sec_tools')} collapsed={collapsed} />
        {TOOLS_ITEMS.map(i => <NavLink key={i.href} {...i} collapsed={collapsed} />)}

        <SectionLabel label={t('sec_account')} collapsed={collapsed} />
        {ACCOUNT_ITEMS.map(i => <NavLink key={i.href} {...i} collapsed={collapsed} />)}
      </nav>

      {/* Footer user */}
      <div className={`border-t border-gray-100 shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
        {!collapsed ? (
          <div>
            <div className="flex items-center gap-2.5 mb-2 p-2 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: `linear-gradient(135deg, ${planColor}, #FF6A00)` }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-700 truncate">{userEmail}</p>
                <p className="text-[9px] font-bold" style={{ color: planColor }}>{planLabel}</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-gray-400">{t('credits')}</span>
              <span className="text-[10px] font-bold text-[#FF6A00]">{credits.toLocaleString()}</span>
            </div>
            <div className="mt-2">
              <Link href="/" className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 py-1.5 rounded-lg transition-all font-semibold">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                {t('home')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${planColor}, #FF6A00)` }}>
              {initials}
            </div>
            <Link href="/" title={t('home')}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
