'use client'
import { useState } from 'react'
import Link from 'next/link'
import { t, dir } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

interface MenuItem { name: string; price: string; description?: string; photo?: string; available?: boolean }
interface MenuCategory { category: string; items: MenuItem[] }
interface HourEntry { open: string; close: string; closed: boolean }
interface MenuData {
  restaurant: string
  description?: string
  logo?: string
  cover?: string
  color?: string
  theme?: 'light' | 'dark' | 'gradient'
  phone?: string
  whatsapp?: string
  website?: string
  address?: string
  map_url?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  hours?: Record<string, HourEntry>
  categories: MenuCategory[]
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function fmt12(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

function getTodayHours(hours: Record<string, HourEntry> | undefined) {
  if (!hours) return null
  const day = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const h = hours[day]
  if (!h) return null
  if (h.closed) return { label: 'Fermé aujourd\'hui', open: false }
  return { label: `${fmt12(h.open)} – ${fmt12(h.close)}`, open: true }
}

export default function MenuClient({ menu, lang = 'fr' }: { menu: MenuData; lang?: Lang }) {
  const [activeTab, setActiveTab] = useState(0)
  const [showHours, setShowHours] = useState(false)
  const accent = menu.color || '#FF6A00'
  const cats = menu.categories || []
  const isDark = menu.theme === 'dark'
  const todayHours = getTodayHours(menu.hours)

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const textMain = isDark ? '#f9fafb' : '#111827'
  const textSub = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#f3f4f6'

  return (
    <main className="min-h-screen" style={{ background: bg, color: textMain }} lang={lang} dir={dir(lang)}>

      {/* Cover */}
      <div className="relative w-full h-52 overflow-hidden">
        {menu.cover ? (
          <img src={menu.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full"
            style={menu.theme === 'gradient'
              ? { background: `linear-gradient(135deg, ${accent}, #041B4D)` }
              : { background: accent }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/65" />

        {/* Header */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
          {menu.logo && (
            <img src={menu.logo} alt={menu.restaurant}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-extrabold text-xl leading-tight drop-shadow truncate">{menu.restaurant}</h1>
            {menu.description && (
              <p className="text-white/80 text-xs mt-0.5 drop-shadow line-clamp-2">{menu.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="max-w-lg mx-auto px-3 pt-3 space-y-2">

        {/* Today hours badge */}
        {todayHours && (
          <button onClick={() => setShowHours(!showHours)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-colors"
            style={{ background: todayHours.open ? (isDark ? '#064e3b20' : '#f0fdf4') : (isDark ? '#1f2937' : '#fef2f2'), borderColor: todayHours.open ? '#16a34a30' : '#ef444430', color: todayHours.open ? '#16a34a' : '#ef4444' }}>
            <span>{todayHours.open ? '🟢' : '🔴'} {todayHours.label}</span>
            <span className="text-gray-400">{showHours ? '▲' : '▼'} Voir horaires</span>
          </button>
        )}

        {/* Hours dropdown */}
        {showHours && menu.hours && (
          <div className="rounded-xl border p-3 space-y-1" style={{ background: cardBg, borderColor }}>
            {DAYS.map(day => {
              const h = menu.hours![day]
              if (!h) return null
              return (
                <div key={day} className="flex justify-between text-xs">
                  <span className="font-semibold w-20" style={{ color: textMain }}>{day}</span>
                  <span style={{ color: h.closed ? '#ef4444' : textSub }}>
                    {h.closed ? 'Fermé' : `${fmt12(h.open)} – ${fmt12(h.close)}`}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Contact quick actions */}
        {(menu.phone || menu.whatsapp || menu.website) && (
          <div className="flex gap-2">
            {menu.phone && (
              <a href={`tel:${menu.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors"
                style={{ background: cardBg, borderColor, color: textMain }}>
                📞 Appeler
              </a>
            )}
            {menu.whatsapp && (
              <a href={`https://wa.me/${menu.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                style={{ background: '#25D366', color: '#fff' }}>
                💬 WhatsApp
              </a>
            )}
            {menu.website && (
              <a href={menu.website} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors"
                style={{ background: cardBg, borderColor, color: textMain }}>
                🌐 Site web
              </a>
            )}
          </div>
        )}

        {/* Address + map */}
        {(menu.address || menu.map_url) && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl border text-xs" style={{ background: cardBg, borderColor }}>
            <span className="mt-0.5">📍</span>
            <div className="flex-1 min-w-0">
              {menu.address && <p style={{ color: textMain }} className="font-semibold">{menu.address}</p>}
              {menu.map_url && (
                <a href={menu.map_url} target="_blank" rel="noopener noreferrer"
                  className="font-bold hover:underline" style={{ color: accent }}>
                  Voir sur Google Maps →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Social links */}
        {(menu.facebook || menu.instagram || menu.tiktok) && (
          <div className="flex gap-2">
            {menu.facebook && (
              <a href={menu.facebook} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: '#1877F220', color: '#1877F2' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
            )}
            {menu.instagram && (
              <a href={menu.instagram} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: '#E1306C20', color: '#E1306C' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram
              </a>
            )}
            {menu.tiktok && (
              <a href={menu.tiktok} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: isDark ? '#111' : '#f3f4f6', color: isDark ? '#fff' : '#111' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.87a8.22 8.22 0 004.79 1.52V7a4.85 4.85 0 01-1.02-.31z"/></svg>
                TikTok
              </a>
            )}
          </div>
        )}
      </div>

      {/* Category tabs */}
      {cats.length > 1 && (
        <div className="sticky top-0 z-20 border-b shadow-sm mt-3" style={{ background: cardBg, borderColor }}>
          <div className="flex overflow-x-auto gap-1 px-3 py-2 no-scrollbar max-w-lg mx-auto">
            {cats.map((cat, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                style={i === activeTab
                  ? { background: accent, color: '#fff' }
                  : { background: isDark ? '#374151' : '#f3f4f6', color: textSub }}>
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
            className={`rounded-2xl border overflow-hidden flex gap-3 p-3 ${item.available === false ? 'opacity-50' : ''}`}
            style={{ background: cardBg, borderColor }}>
            {item.photo && (
              <img src={item.photo} alt={item.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <p className="font-bold text-sm leading-tight" style={{ color: textMain }}>{item.name}</p>
                {item.description && (
                  <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: textSub }}>{item.description}</p>
                )}
                {item.available === false && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full" style={{ background: isDark ? '#374151' : '#f3f4f6', color: textSub }}>{t(lang, 'unavailable')}</span>
                )}
              </div>
              {item.price && (
                <p className="font-extrabold text-sm mt-1" style={{ color: accent }}>{item.price}</p>
              )}
            </div>
          </div>
        ))}
        {!cats.length && (
          <p className="text-center py-12 text-sm" style={{ color: textSub }}>Menu en cours de préparation…</p>
        )}
      </div>

      {/* WhatsApp CTA sticky */}
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
        <Link href="/" className="text-xs hover:opacity-80" style={{ color: textSub }}>
          {t(lang, 'powered_by')} <span className="font-bold" style={{ color: accent }}>QR CODE EXPRESS</span>
        </Link>
      </div>
    </main>
  )
}
