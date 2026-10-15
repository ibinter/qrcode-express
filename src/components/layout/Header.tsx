'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [open, setOpen] = useState(false)

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
          <Link href="/connexion" className="block text-gray-700" onClick={() => setOpen(false)}>Connexion</Link>
          <Link href="/inscription" className="block font-semibold text-[#FF6A00]" onClick={() => setOpen(false)}>
            Commencer gratuitement →
          </Link>
        </div>
      )}
    </header>
  )
}
