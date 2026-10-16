'use client'
import { useState } from 'react'
import Link from 'next/link'
import { t, dir } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

interface MenuItem { name: string; price: string; description?: string; photo?: string; available?: boolean }
interface MenuCategory { category: string; items: MenuItem[] }
interface MenuData {
  restaurant: string
  description?: string
  logo?: string
  cover?: string
  color?: string
  whatsapp?: string
  categories: MenuCategory[]
}

export default function MenuClient({ menu, lang = 'fr' }: { menu: MenuData; lang?: Lang }) {
  const [activeTab, setActiveTab] = useState(0)
  const accent = menu.color || '#FF6A00'
  const cats = menu.categories || []

  return (
    <main className="min-h-screen bg-gray-50" lang={lang} dir={dir(lang)}>
      {/* Cover */}
      <div className="relative w-full h-48 overflow-hidden">
        {menu.cover ? (
          <img src={menu.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}, #041B4D)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />

        {/* Header info */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
          {menu.logo && (
            <img src={menu.logo} alt={menu.restaurant}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg shrink-0" />
          )}
          <div>
            <h1 className="text-white font-extrabold text-xl leading-tight drop-shadow">{menu.restaurant}</h1>
            {menu.description && (
              <p className="text-white/80 text-xs mt-0.5 drop-shadow">{menu.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      {cats.length > 1 && (
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex overflow-x-auto gap-1 px-3 py-2 no-scrollbar">
            {cats.map((cat, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                style={i === activeTab
                  ? { background: accent, color: '#fff' }
                  : { background: '#f3f4f6', color: '#6b7280' }}>
                {cat.category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="max-w-lg mx-auto px-3 py-4 space-y-2">
        {(cats[activeTab]?.items || []).map((item, ii) => (
          <div key={ii}
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-3 p-3 ${item.available === false ? 'opacity-50' : ''}`}>
            {item.photo && (
              <img src={item.photo} alt={item.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <p className="font-bold text-sm text-gray-900 leading-tight">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
                )}
                {item.available === false && (
                  <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t(lang, 'unavailable')}</span>
                )}
              </div>
              {item.price && (
                <p className="font-extrabold text-sm mt-1" style={{ color: accent }}>{item.price}</p>
              )}
            </div>
          </div>
        ))}
        {!cats.length && (
          <p className="text-center text-gray-400 py-12 text-sm">Menu en cours de préparation…</p>
        )}
      </div>

      {/* WhatsApp CTA */}
      {menu.whatsapp && (
        <div className="sticky bottom-4 max-w-lg mx-auto px-4">
          <a href={`https://wa.me/${menu.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm shadow-xl transition-transform active:scale-95"
            style={{ background: '#25D366' }}>
            💬 {t(lang, 'order_whatsapp')}
          </a>
        </div>
      )}

      <div className="text-center py-8 mt-4">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
          {t(lang, 'powered_by')} <span className="font-bold" style={{ color: accent }}>QR CODE EXPRESS</span>
        </Link>
      </div>
    </main>
  )
}
