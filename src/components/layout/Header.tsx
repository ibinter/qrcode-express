'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import LanguageSelector from './LanguageSelector'
import { useTranslations } from 'next-intl'

export default function Header() {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()
  const menuRef = useRef<HTMLDivElement>(null)

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

  // Close menu on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

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

  return (
    <header
      ref={menuRef}
      className={`sticky top-0 z-50 bg-white border-b transition-shadow duration-200 ${
        scrolled ? 'shadow-md border-gray-200' : 'shadow-sm border-gray-100'
      }`}
    >
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
          <Link href="/fonctionnalites" className="px-2.5 py-1.5 rounded-lg hover:bg-gray-100 hover:text-[#FF6A00] transition-colors whitespace-nowrap">{t('features')}</Link>
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
          <Link href="/#generateur" className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 border-b border-gray-50" onClick={close}>📱 {t('create')}</Link>
          <Link href="/#barcode" className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 border-b border-gray-50" onClick={close}>📊 {t('barcode')}</Link>
          <Link href="/#etiquettes" className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 border-b border-gray-50" onClick={close}>🏷️ {t('labels')}</Link>
          <Link href="/tarifs" className="py-3 text-sm font-medium text-gray-700 border-b border-gray-50 block" onClick={close}>{t('pricing')}</Link>
          <Link href="/fonctionnalites" className="py-3 text-sm font-medium text-gray-700 border-b border-gray-50 block" onClick={close}>{t('features')}</Link>
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
