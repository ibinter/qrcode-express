'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WelcomeBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [hasRef, setHasRef] = useState(false)

  useEffect(() => {
    if (searchParams.get('welcome') !== '1') return
    const hadRef = !!(searchParams.get('claim_ref') === '1')
    setHasRef(hadRef)
    setVisible(true)
  }, [searchParams])

  function dismiss() {
    setVisible(false)
    // Remove welcome params from URL without navigation
    const url = new URL(window.location.href)
    url.searchParams.delete('welcome')
    url.searchParams.delete('claim_ref')
    router.replace(url.pathname + (url.search !== '' ? url.search : ''), { scroll: false })
  }

  if (!visible) return null

  return (
    <div className="bg-gradient-to-r from-[#041B4D] to-[#0f2d6e] text-white rounded-2xl p-5 mb-6 shadow-lg relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎉</span>
            <h2 className="text-base font-extrabold">Bienvenue sur QR CODE EXPRESS !</h2>
          </div>

          {hasRef ? (
            <p className="text-sm text-blue-200 mb-3">
              Votre code de parrainage a été appliqué — <span className="font-bold text-white">20 crédits de bienvenue</span> ont été ajoutés à votre compte.
            </p>
          ) : (
            <p className="text-sm text-blue-200 mb-3">
              Votre compte est prêt. Créez votre premier QR code ou <span className="font-bold text-white">parrainez un ami</span> pour gagner des crédits.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={dismiss}
              className="px-4 py-2 bg-[#FF6A00] hover:bg-[#e55f00] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Créer mon premier QR →
            </button>
            <Link
              href="/parrainage"
              onClick={dismiss}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              🎁 Parrainer un ami
            </Link>
          </div>
        </div>

        <button
          onClick={dismiss}
          className="text-white/50 hover:text-white text-xl leading-none flex-shrink-0 mt-0.5"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  )
}
