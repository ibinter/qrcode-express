'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: '#041B4D' }}>
            QR <span style={{ color: '#FF6A00' }}>CODE</span> EXPRESS
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/#generateur" className="hover:text-[#FF6A00] transition-colors">Créer un QR</Link>
          <Link href="/tarifs" className="hover:text-[#FF6A00] transition-colors">Tarifs</Link>
          <Link href="/fonctionnalites" className="hover:text-[#FF6A00] transition-colors">Fonctionnalités</Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-[#041B4D] hover:text-[#FF6A00] transition-colors">
                📱 Mes QR
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-sm font-medium text-gray-700 hover:text-[#041B4D]">
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
              >
                Commencer gratuitement
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/#generateur" className="block text-gray-700" onClick={() => setOpen(false)}>Créer un QR</Link>
          <Link href="/tarifs" className="block text-gray-700" onClick={() => setOpen(false)}>Tarifs</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block font-semibold text-[#041B4D]" onClick={() => setOpen(false)}>📱 Mes QR codes</Link>
              <button onClick={handleLogout} className="block text-red-500 text-sm font-medium">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="block text-gray-700" onClick={() => setOpen(false)}>Connexion</Link>
              <Link href="/inscription" className="block font-semibold text-[#FF6A00]" onClick={() => setOpen(false)}>
                Commencer gratuitement →
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
