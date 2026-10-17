'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'

const SECTIONS = [
  {
    id: 'principal',
    label: 'Principal',
    items: [
      { href: '/admin', icon: '📊', label: 'Vue d\'ensemble', exact: true, color: '#FF6A00' },
      { href: '/admin/utilisateurs', icon: '👥', label: 'Utilisateurs', color: '#3b82f6' },
      { href: '/admin/transactions', icon: '💰', label: 'Transactions', color: '#10b981' },
      { href: '/admin/analytics', icon: '📈', label: 'Analytics', color: '#8b5cf6' },
    ],
  },
  {
    id: 'qr',
    label: 'QR Codes',
    items: [
      { href: '/admin/qr', icon: '📱', label: 'Tous les QR', color: '#FF6A00' },
      { href: '/admin/qr?type=url', icon: '🔗', label: 'URLs & Liens', color: '#3b82f6' },
      { href: '/admin/qr?type=vcard', icon: '👤', label: 'vCards', color: '#10b981' },
      { href: '/admin/qr?type=payment', icon: '💳', label: 'Paiements', color: '#f59e0b' },
      { href: '/admin/qr?type=menu', icon: '🍽️', label: 'Menus', color: '#ec4899' },
      { href: '/admin/qr?type=pdf', icon: '📄', label: 'PDFs & Docs', color: '#7c3aed' },
    ],
  },
  {
    id: 'barcodes',
    label: 'Codes-barres & Étiquettes',
    items: [
      { href: '/admin/qr?type=barcode', icon: '📊', label: 'Codes-barres', color: '#041B4D' },
      { href: '/barcode', icon: '⚡', label: 'Générateur (client)', color: '#FF6A00' },
      { href: '/barcode/batch', icon: '📋', label: 'Import CSV batch', color: '#10b981' },
      { href: '/labels', icon: '🏷️', label: 'Étiquettes (client)', color: '#8b5cf6' },
    ],
  },
  {
    id: 'features',
    label: 'Fonctionnalités',
    items: [
      { href: '/admin/organisations', icon: '🏢', label: 'Organisations', color: '#0ea5e9' },
      { href: '/admin/formulaires', icon: '📋', label: 'Formulaires', color: '#10b981' },
      { href: '/admin/evenements', icon: '🎫', label: 'Événements', color: '#7c3aed' },
      { href: '/admin/avis', icon: '⭐', label: 'Avis & Reviews', color: '#f59e0b' },
      { href: '/admin/portefeuille', icon: '💼', label: 'Portefeuille', color: '#FF6A00' },
    ],
  },
  {
    id: 'system',
    label: 'Système',
    items: [
      { href: '/admin/statistiques', icon: '🔬', label: 'Statistiques avancées', color: '#0ea5e9' },
      { href: '/admin/parrainage', icon: '🎁', label: 'Parrainage', color: '#ec4899' },
      { href: '/admin/ia', icon: '🤖', label: 'IA & Design', color: '#8b5cf6' },
      { href: '/admin/webhooks', icon: '🔔', label: 'Webhooks & API', color: '#64748b' },
    ],
  },
]

const ALL_ITEMS = SECTIONS.flatMap(s => s.items)

function NavItem({
  item,
  collapsed,
  active,
}: {
  item: { href: string; icon: string; label: string; color: string }
  collapsed: boolean
  active: boolean
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => collapsed && setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <Link
        href={item.href}
        className={`group flex items-center gap-3 rounded-xl transition-all duration-150 relative overflow-hidden
          ${collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'px-3 py-2.5'}
          ${active
            ? 'text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        style={active ? { background: `linear-gradient(135deg, ${item.color}ee, ${item.color}bb)` } : {}}
      >
        {active && !collapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-white/60" />
        )}
        <span className={`text-base flex-shrink-0 transition-transform duration-150 ${active ? '' : 'group-hover:scale-110'}`}>
          {item.icon}
        </span>
        {!collapsed && (
          <span className={`text-xs font-semibold truncate transition-all duration-200 ${active ? 'text-white' : ''}`}>
            {item.label}
          </span>
        )}
      </Link>

      {/* Tooltip when collapsed */}
      {collapsed && showTooltip && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
}

function SectionHeader({
  label,
  collapsed,
  open,
  onToggle,
}: {
  label: string
  collapsed: boolean
  open: boolean
  onToggle: () => void
}) {
  if (collapsed) {
    return <div className="h-px bg-gray-100 mx-2 my-2" />
  }
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-1.5 group"
    >
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
        {label}
      </span>
      <svg
        className={`w-3 h-3 text-gray-300 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export default function AdminNav({ userEmail }: { userEmail?: string }) {
  const path = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map(s => [s.id, true]))
  )
  const searchRef = useRef<HTMLInputElement>(null)

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem('admin-nav-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('admin-nav-collapsed', String(next))
      if (next) setSearch('')
      return next
    })
  }, [])

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Keyboard shortcut Ctrl+B
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleCollapse()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (!collapsed) searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [collapsed, toggleCollapse])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return path === href
    const base = href.split('?')[0]
    return path === base || path.startsWith(base + '/')
  }

  const filteredItems = search
    ? ALL_ITEMS.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : null

  const initials = userEmail ? userEmail[0].toUpperCase() : '?'

  return (
    <aside
      className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shadow-sm overflow-hidden"
      style={{ width: collapsed ? 64 : 232 }}
    >
      {/* Logo + collapse btn */}
      <div className={`flex items-center border-b border-gray-100 h-14 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee0979)' }}>
              Q
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-gray-900 tracking-tight leading-tight">QR CODE EXPRESS</p>
              <p className="text-[9px] text-orange-500 font-bold leading-tight">Panel Admin</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee0979)' }}>
            Q
          </div>
        )}
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Étendre (Ctrl+B)' : 'Réduire (Ctrl+B)'}
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all flex-shrink-0 ${collapsed ? 'absolute right-0 translate-x-1/2 bg-white border border-gray-200 shadow-sm' : ''}`}
        >
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher… (⌘K)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-7 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
        {filteredItems ? (
          <div className="space-y-0.5">
            {filteredItems.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6 px-3">Aucun résultat</p>
            )}
            {filteredItems.map(item => (
              <NavItem key={item.href} item={item} collapsed={false} active={isActive(item.href)} />
            ))}
          </div>
        ) : (
          SECTIONS.map((section) => (
            <div key={section.id} className="mb-1">
              <SectionHeader
                label={section.label}
                collapsed={collapsed}
                open={openSections[section.id]}
                onToggle={() => toggleSection(section.id)}
              />
              <div
                className="overflow-hidden transition-all duration-200 ease-in-out"
                style={{ maxHeight: openSections[section.id] || collapsed ? '500px' : '0px', opacity: openSections[section.id] || collapsed ? 1 : 0 }}
              >
                <div className="space-y-0.5 mt-0.5">
                  {section.items.map(item => (
                    <NavItem
                      key={item.href}
                      item={item}
                      collapsed={collapsed}
                      active={isActive(item.href, (item as { exact?: boolean }).exact)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </nav>

      {/* User + links footer */}
      <div className={`border-t border-gray-100 flex-shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors mb-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee0979)' }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-700 truncate">{userEmail ?? 'Admin'}</p>
                <p className="text-[9px] text-orange-500 font-bold">Super Admin</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Link href="/dashboard"
                className="flex-1 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all py-1.5 rounded-lg font-semibold">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Dashboard
              </Link>
              <Link href="/"
                className="flex-1 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all py-1.5 rounded-lg font-semibold">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>
                Site
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee0979)' }}>
              {initials}
            </div>
            <Link href="/dashboard" title="Dashboard client"
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
