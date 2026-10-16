import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buildMeta } from '@/lib/og-meta'
import type { Metadata } from 'next'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'business').single()
  if (!qr) return buildMeta({ title: 'Entreprise' })
  let b: { name?: string; tagline?: string; cover?: string; logo?: string } = {}
  try { b = JSON.parse(qr.content) } catch {}
  return buildMeta({ title: b.name || 'Entreprise', description: b.tagline, image: b.cover || b.logo })
}

interface BusinessData {
  name: string
  category?: string
  tagline?: string
  description?: string
  cover?: string
  logo?: string
  color?: string
  theme?: 'light' | 'dark' | 'gradient'
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  address?: string
  map_url?: string
  hours?: Record<string, { open: string; close: string; closed: boolean }>
  socials?: Record<string, string>
  gallery?: string[]
  cta_buttons?: { label: string; url: string; icon: string }[]
}

const DAYS_FR: Record<string, string> = {
  lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu',
  vendredi: 'Ven', samedi: 'Sam', dimanche: 'Dim',
}

const SOCIAL_ICONS: Record<string, string> = {
  instagram: '📷', facebook: '👤', tiktok: '🎵',
  youtube: '▶️', twitter: '🐦', linkedin: '💼',
}

function getTodayKey() {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  return days[new Date().getDay()]
}

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, status, design')
    .eq('id', id)
    .eq('type', 'business')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let biz: BusinessData = { name: '' }
  try { biz = JSON.parse(qr.content) } catch {}

  const accent = biz.color || '#FF6A00'
  const isDark = biz.theme === 'dark'
  const isGradient = biz.theme === 'gradient'
  const todayKey = getTodayKey()
  const todayHours = biz.hours?.[todayKey]

  const bgClass = isDark ? 'bg-gray-950 text-white' : isGradient ? 'text-white' : 'bg-gray-50 text-gray-900'
  const cardBg = isDark ? 'bg-gray-900 border-gray-800' : isGradient ? 'bg-white/10 border-white/20 backdrop-blur-sm' : 'bg-white border-gray-100'
  const mutedText = isDark || isGradient ? 'text-gray-300' : 'text-gray-500'

  return (
    <main
      className={`min-h-screen ${bgClass}`}
      style={isGradient ? { background: `linear-gradient(135deg, #041B4D 0%, ${accent}33 50%, #1a1035 100%)` } : undefined}
    >
      {/* Cover */}
      <div className="relative w-full h-52 overflow-hidden">
        {biz.cover ? (
          <img src={biz.cover} alt="couverture" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}, #041B4D)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Header card */}
      <div className="max-w-lg mx-auto px-4 -mt-14 relative z-10">
        <div className={`${cardBg} rounded-2xl border shadow-xl p-5`}>
          <div className="flex items-start gap-4">
            {biz.logo ? (
              <img src={biz.logo} alt={biz.name} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}, #041B4D)` }}>
                {biz.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-extrabold leading-tight truncate">{biz.name}</h1>
              {biz.category && (
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1"
                  style={{ background: accent + '22', color: accent }}>
                  {biz.category}
                </span>
              )}
              {biz.tagline && <p className={`text-sm mt-1 ${mutedText} italic`}>{biz.tagline}</p>}
            </div>
          </div>

          {/* Today's hours badge */}
          {todayHours && (
            <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full w-fit ${todayHours.closed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${todayHours.closed ? 'bg-red-500' : 'bg-green-500'}`} />
              {todayHours.closed ? 'Fermé aujourd\'hui' : `Ouvert · ${todayHours.open} – ${todayHours.close}`}
            </div>
          )}
        </div>

        {/* Description */}
        {biz.description && (
          <div className={`${cardBg} rounded-2xl border shadow-sm p-4 mt-3`}>
            <p className={`text-sm leading-relaxed ${mutedText}`}>{biz.description}</p>
          </div>
        )}

        {/* Custom CTA buttons */}
        {biz.cta_buttons && biz.cta_buttons.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {biz.cta_buttons.map((btn, i) => (
              <a key={i} href={btn.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-sm shadow-sm transition-transform active:scale-95"
                style={{ background: i === 0 ? accent : undefined, color: i === 0 ? '#fff' : accent, border: `2px solid ${accent}` }}>
                <span>{btn.icon}</span> {btn.label}
              </a>
            ))}
          </div>
        )}

        {/* Contact actions */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {biz.phone && (
            <a href={`tel:${biz.phone}`}
              className={`${cardBg} border flex flex-col items-center gap-1 py-3 rounded-2xl shadow-sm text-xs font-semibold transition-transform active:scale-95`}>
              <span className="text-xl">📞</span> Appeler
            </a>
          )}
          {biz.whatsapp && (
            <a href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className={`${cardBg} border flex flex-col items-center gap-1 py-3 rounded-2xl shadow-sm text-xs font-semibold transition-transform active:scale-95`}>
              <span className="text-xl">💬</span> WhatsApp
            </a>
          )}
          {biz.map_url && (
            <a href={biz.map_url} target="_blank" rel="noopener noreferrer"
              className={`${cardBg} border flex flex-col items-center gap-1 py-3 rounded-2xl shadow-sm text-xs font-semibold transition-transform active:scale-95`}>
              <span className="text-xl">📍</span> Itinéraire
            </a>
          )}
          {biz.email && (
            <a href={`mailto:${biz.email}`}
              className={`${cardBg} border flex flex-col items-center gap-1 py-3 rounded-2xl shadow-sm text-xs font-semibold transition-transform active:scale-95`}>
              <span className="text-xl">✉️</span> E-mail
            </a>
          )}
          {biz.website && (
            <a href={biz.website} target="_blank" rel="noopener noreferrer"
              className={`${cardBg} border flex flex-col items-center gap-1 py-3 rounded-2xl shadow-sm text-xs font-semibold transition-transform active:scale-95`}>
              <span className="text-xl">🌐</span> Site web
            </a>
          )}
        </div>

        {/* Address */}
        {biz.address && (
          <div className={`${cardBg} rounded-2xl border shadow-sm p-4 mt-3 flex items-start gap-3`}>
            <span className="text-xl shrink-0">📍</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: accent }}>Adresse</p>
              <p className={`text-sm ${mutedText}`}>{biz.address}</p>
            </div>
          </div>
        )}

        {/* Hours full */}
        {biz.hours && Object.keys(biz.hours).length > 0 && (
          <div className={`${cardBg} rounded-2xl border shadow-sm p-4 mt-3`}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: accent }}>Horaires</p>
            <div className="space-y-1.5">
              {Object.entries(biz.hours).map(([day, h]) => (
                <div key={day} className={`flex items-center justify-between text-sm ${day === todayKey ? 'font-bold' : ''}`}>
                  <span className={`w-8 text-xs uppercase tracking-wide ${mutedText}`}>{DAYS_FR[day] || day}</span>
                  {h.closed ? (
                    <span className="text-xs text-red-400">Fermé</span>
                  ) : (
                    <span className={day === todayKey ? '' : mutedText}>{h.open} – {h.close}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {biz.gallery && biz.gallery.length > 0 && (
          <div className={`${cardBg} rounded-2xl border shadow-sm p-4 mt-3`}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: accent }}>Galerie</p>
            <div className="grid grid-cols-3 gap-1.5">
              {biz.gallery.map((img, i) => (
                <img key={i} src={img} alt={`photo ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* Social links */}
        {biz.socials && Object.values(biz.socials).some(Boolean) && (
          <div className={`${cardBg} rounded-2xl border shadow-sm p-4 mt-3`}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: accent }}>Réseaux sociaux</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(biz.socials).filter(([, url]) => url).map(([network, url]) => (
                <a key={network} href={url} target="_blank" rel="noopener noreferrer"
                  className={`${cardBg} border flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-transform active:scale-95 shadow-sm`}>
                  <span>{SOCIAL_ICONS[network] || '🔗'}</span>
                  <span className="capitalize">{network}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 mb-4 text-center">
          <Link href="/" className={`text-xs ${mutedText} hover:opacity-80`}>
            Propulsé par <span className="font-bold" style={{ color: accent }}>QR CODE EXPRESS</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
