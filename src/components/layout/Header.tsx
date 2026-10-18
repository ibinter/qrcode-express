'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import LanguageSelector from './LanguageSelector'
import { useTranslations } from 'next-intl'

const FEATURES_MENU = [
  {
    section: 'QR Codes',
    color: '#FF6A00',
    items: [
      { icon: '📱', label: 'Créer un QR code', desc: '33 types · URL, vCard, menu, paiement…', href: '/create' },
      { icon: '⚡', label: 'QR Dynamiques', desc: 'Modifiables après impression · Analytics', href: '/create' },
      { icon: '🎨', label: 'Personnalisation', desc: 'Couleurs, logo, formes', href: '/create' },
      { icon: '📊', label: 'Statistiques', desc: 'Scans, localisation, appareils', href: '/dashboard' },
    ],
  },
  {
    section: 'Codes-barres',
    color: '#3b82f6',
    items: [
      { icon: '🔢', label: 'Générateur codes-barres', desc: '26 formats · EAN, Code 128, QR…', href: '/barcode' },
      { icon: '📦', label: 'Traitement en lot', desc: 'Générez des centaines en un clic', href: '/barcode/batch' },
      { icon: '⬇️', label: 'Export PNG & SVG', desc: 'Haute résolution, vectoriel', href: '/barcode' },
    ],
  },
  {
    section: 'Étiquettes',
    color: '#a855f7',
    items: [
      { icon: '🏷️', label: 'Créateur d\'étiquettes', desc: '31 gabarits · Commerce, pharmacie…', href: '/labels' },
      { icon: '🖨️', label: 'Compatible Avery', desc: 'PDF prêt à imprimer', href: '/labels' },
      { icon: '📋', label: 'Étiquettes en lot', desc: 'Import CSV · Batch printing', href: '/labels/batch' },
    ],
  },
  {
    section: 'Métiers',
    color: '#10b981',
    items: [
      { icon: '🍽️', label: 'Menu restaurant', desc: 'QR menu numérique interactif', href: '/create' },
      { icon: '🎫', label: 'Billetterie', desc: 'Billets QR uniques & contrôle entrée', href: '/create' },
      { icon: '💳', label: 'Paiement Mobile Money', desc: 'Wave, Orange Money, MTN MoMo…', href: '/create' },
      { icon: '🔗', label: 'Lien bio', desc: 'Page multi-liens personnalisée', href: '/create' },
    ],
  },
]

export default function Header() {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)
  const [featOpen, setFeatOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()
  const menuRef = useRef<HTMLDivElement>(null)
  const featRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close features dropdown on outside click
  useEffect(() => {
    if (!featOpen) return
    const handler = (e: MouseEvent) => {
      if (featRef.current && !featRef.current.contains(e.target as Node)) setFeatOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [featOpen])

  // Close menu on route change (Escape key)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const close = () => setOpen(false)

  const TICKER_ITEMS = [
    '🌍 La plateforme QR professionnelle d\'Afrique',
    '📱 33 types de QR codes · Dynamiques & Statiques',
    '📊 26 formats de codes-barres professionnels',
    '🏷️ 31 gabarits d\'étiquettes compatibles Avery',
    '💳 Paiement Wave · Orange Money · MTN MoMo · Moov · M-Pesa · Airtel · Carte bancaire',
    '🎫 Billetterie · Menu restaurant · Lien bio',
    '⚡ QR modifiables après impression · Analytics inclus',
    '🔒 Données sécurisées · Hébergé en Europe',
    '🎁 Commencez gratuitement · Sans carte bancaire',
  ]

  return (
    <header
      ref={menuRef}
      className={`sticky top-0 z-50 bg-white border-b transition-shadow duration-200 ${
        scrolled ? 'shadow-md border-gray-200' : 'shadow-sm border-gray-100'
      }`}
    >
      {/* ── Barre de défilement ── */}
      <div className="overflow-hidden py-1.5" style={{ background: 'linear-gradient(90deg, #041B4D 0%, #0d2d6e 50%, #041B4D 100%)' }}>
        <div className="flex whitespace-nowrap" style={{ animation: 'ticker 40s linear infinite' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center text-[11px] font-medium text-white/90 px-6">
              {item}
              <span className="ml-6 text-white/30">·</span>
            </span>
          ))}
        </div>
        <style>{`
          @keyframes ticker {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo size="sm" />
        </div>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-0.5 text-[13px] font-medium text-gray-600 flex-shrink-0">
          <Link href="/create" className="px-2.5 py-1.5 rounded-lg hover:bg-gray-100 hover:text-[#FF6A00] transition-colors whitespace-nowrap">{t('create')}</Link>
          <Link href="/barcode" className="px-2.5 py-1.5 rounded-lg hover:bg-gray-100 hover:text-[#FF6A00] transition-colors whitespace-nowrap">{t('barcode')}</Link>
          <Link href="/labels" className="px-2.5 py-1.5 rounded-lg hover:bg-gray-100 hover:text-[#FF6A00] transition-colors whitespace-nowrap">{t('labels')}</Link>
          <Link href="/tarifs" className="px-2.5 py-1.5 rounded-lg hover:bg-gray-100 hover:text-[#FF6A00] transition-colors whitespace-nowrap">{t('pricing')}</Link>

          {/* Fonctionnalités — mega dropdown */}
          <div ref={featRef} className="relative">
            <button
              onClick={() => setFeatOpen(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap ${featOpen ? 'text-[#FF6A00] bg-gray-100' : 'hover:text-[#FF6A00]'}`}
            >
              {t('features')}
              <ChevronDown size={13} className={`transition-transform duration-200 ${featOpen ? 'rotate-180' : ''}`} />
            </button>

            {featOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-5"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
                {/* Triangle pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />
                <div className="grid grid-cols-4 gap-5">
                  {FEATURES_MENU.map((col) => (
                    <div key={col.section}>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: col.color }}>{col.section}</p>
                      <ul className="space-y-1">
                        {col.items.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              onClick={() => setFeatOpen(false)}
                              className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                              <span className="text-base mt-0.5 flex-shrink-0">{item.icon}</span>
                              <div>
                                <p className="text-[12px] font-semibold text-gray-800 group-hover:text-[#FF6A00] transition-colors leading-tight">{item.label}</p>
                                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Toutes les fonctionnalités de QR CODE EXPRESS</p>
                  <Link href="/fonctionnalites" onClick={() => setFeatOpen(false)}
                    className="text-xs font-bold text-[#FF6A00] hover:underline">
                    Voir tout →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/faq" className="px-2.5 py-1.5 rounded-lg hover:bg-gray-100 hover:text-[#FF6A00] transition-colors whitespace-nowrap">FAQ</Link>
        </nav>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #041B4D, #0d2d6e)' }}
              >
                ← Dashboard
              </Link>
              <Link href="/portefeuille" className="text-sm font-semibold text-gray-600 hover:text-[#FF6A00] transition-colors">
                💰 {t('credits')}
              </Link>
              <Link href="/profil" className="text-sm font-semibold text-gray-600 hover:text-[#041B4D] transition-colors">
                👤 {t('profile')}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-sm font-medium text-gray-700 hover:text-[#041B4D] transition-colors">
                {t('login')}
              </Link>
              <Link
                href="/inscription"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
              >
                {t('signup')}
              </Link>
            </>
          )}
          <LanguageSelector />
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSelector />
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
          >
            <div className="relative w-[22px] h-[22px]">
              <span className={`absolute inset-0 transition-all duration-200 ${open ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
                <X size={22} />
              </span>
              <span className={`absolute inset-0 transition-all duration-200 ${open ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
                <Menu size={22} />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Menu mobile — animé avec max-height */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '400px' : '0px', opacity: open ? 1 : 0 }}
        aria-hidden={!open}
      >
        <div className="border-t border-gray-100 bg-white px-4 py-2 flex flex-col">
          <Link href="/create" className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 border-b border-gray-50" onClick={close}>📱 {t('create')}</Link>
          <Link href="/barcode" className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 border-b border-gray-50" onClick={close}>📊 {t('barcode')}</Link>
          <Link href="/labels" className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 border-b border-gray-50" onClick={close}>🏷️ {t('labels')}</Link>
          <Link href="/tarifs" className="py-3 text-sm font-medium text-gray-700 border-b border-gray-50 block" onClick={close}>{t('pricing')}</Link>
          <details className="border-b border-gray-50">
            <summary className="py-3 text-sm font-medium text-gray-700 flex items-center justify-between cursor-pointer list-none">
              {t('features')} <ChevronDown size={14} className="text-gray-400" />
            </summary>
            <div className="pb-2 pl-2 space-y-0">
              {FEATURES_MENU.map((col) => (
                <div key={col.section} className="mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest py-1 px-2" style={{ color: col.color }}>{col.section}</p>
                  {col.items.map((item) => (
                    <Link key={item.label} href={item.href} onClick={close}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:text-[#FF6A00] rounded-lg">
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link href="/fonctionnalites" onClick={close} className="block px-2 py-1.5 text-xs font-bold text-[#FF6A00]">Voir tout →</Link>
            </div>
          </details>
          <Link href="/faq" className="py-3 text-sm font-medium text-gray-700 border-b border-gray-50 block" onClick={close}>❓ FAQ</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="py-3 text-base font-bold text-[#FF6A00] border-b border-gray-50" onClick={close}>← Dashboard</Link>
              <Link href="/portefeuille" className="py-3 text-base text-gray-700 border-b border-gray-50" onClick={close}>💰 {t('credits')}</Link>
              <Link href="/profil" className="py-3 text-base text-gray-700 border-b border-gray-50" onClick={close}>👤 {t('profile')}</Link>
              <button onClick={() => { close(); handleLogout() }} className="py-3 text-base text-red-500 font-medium text-left">{t('logout')}</button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="py-3 text-base text-gray-700 border-b border-gray-50" onClick={close}>{t('login')}</Link>
              <Link href="/inscription" className="py-3 text-base font-semibold text-[#FF6A00]" onClick={close}>
                {t('signup')} →
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
