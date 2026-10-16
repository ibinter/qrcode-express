'use client'
import { useState } from 'react'
import Link from 'next/link'
import { t, dir } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

interface CouponData {
  title: string; code?: string; discount?: string; description?: string
  expires?: string; brand?: string; logo?: string; color?: string
  cta_label?: string; cta_url?: string
}

export default function CouponClient({ coupon, isExpired, lang = 'fr' }: { coupon: CouponData; isExpired: boolean; lang?: Lang }) {
  const [copied, setCopied] = useState(false)
  const accent = coupon.color || '#FF6A00'

  function copyCode() {
    if (!coupon.code) return
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10" lang={lang} dir={dir(lang)}
      style={{ background: `linear-gradient(160deg, #041B4D 0%, ${accent}22 60%, #0d0d2b 100%)` }}>

      <div className="w-full max-w-sm">
        {/* Coupon card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">

          {/* Top section */}
          <div className="px-6 py-8 text-center text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />

            <div className="relative z-10">
              {coupon.logo ? (
                <img src={coupon.logo} alt={coupon.brand || ''} className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-lg" />
              ) : coupon.brand ? (
                <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl font-black bg-white/20">
                  {coupon.brand[0]?.toUpperCase()}
                </div>
              ) : null}

              {coupon.brand && <p className="text-sm font-semibold opacity-90 mb-1">{coupon.brand}</p>}
              <h1 className="text-xl font-extrabold leading-tight">{coupon.title}</h1>

              {coupon.discount && (
                <div className="mt-4 inline-flex items-center justify-center bg-white/20 backdrop-blur rounded-2xl px-6 py-3">
                  <span className="text-4xl font-black">{coupon.discount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tear separator */}
          <div className="relative flex items-center -my-0">
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-gray-50" />
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-gray-50" />
            <div className="w-full border-t-2 border-dashed border-gray-200 mx-6" />
          </div>

          {/* Bottom section */}
          <div className="px-6 pt-6 pb-7 space-y-4 text-center">
            {coupon.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{coupon.description}</p>
            )}

            {coupon.code && (
              <button onClick={copyCode}
                className="w-full group relative border-2 border-dashed rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ borderColor: accent }}>
                <p className="text-xs text-gray-400 mb-1">{t(lang, 'coupon_code')}</p>
                <p className="text-2xl font-black tracking-widest" style={{ color: '#041B4D' }}>{coupon.code}</p>
                <span className="absolute top-2 right-3 text-xs font-semibold transition-all"
                  style={{ color: accent }}>
                  {copied ? t(lang, 'code_copied') : '📋'}
                </span>
              </button>
            )}

            {coupon.expires && (
              <p className={`text-xs font-medium ${isExpired ? 'text-red-500' : 'text-gray-400'}`}>
                {isExpired ? `⚠️ ${t(lang, 'expired')}` : `⏰ ${t(lang, 'valid_until')} ${coupon.expires}`}
              </p>
            )}

            {coupon.cta_label && coupon.cta_url && (
              <a href={coupon.cta_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-transform active:scale-95"
                style={{ background: `linear-gradient(135deg, ${accent}, #041B4D)` }}>
                {coupon.cta_label} →
              </a>
            )}
          </div>
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="text-xs text-blue-300/70 hover:text-blue-300">
            {t(lang, 'powered_by')} <span className="font-bold" style={{ color: accent }}>QR CODE EXPRESS</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
