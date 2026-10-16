import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PixelSnippets from '@/components/PixelSnippets'
import { buildMeta } from '@/lib/og-meta'
import { getLang } from '@/lib/i18n-server'
import { t, dir } from '@/lib/i18n'
import type { Metadata } from 'next'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'vcard_plus').single()
  if (!qr) return buildMeta({ title: 'Carte de visite' })
  let c: { name?: string; title?: string; company?: string; photo?: string } = {}
  try { c = JSON.parse(qr.content) } catch {}
  const desc = [c.title, c.company].filter(Boolean).join(' · ')
  return buildMeta({ title: c.name || 'Carte de visite', description: desc || undefined, image: c.photo })
}

interface VCardPlusData {
  name?: string
  title?: string
  company?: string
  phone?: string
  phone2?: string
  email?: string
  email2?: string
  website?: string
  address?: string
  photo?: string
  cover?: string
  whatsapp?: string
  linkedin?: string
  instagram?: string
  twitter?: string
  facebook?: string
  color?: string
  theme?: 'light' | 'dark' | 'gradient'
  note?: string
}

const SOCIAL_BTNS = [
  { key: 'linkedin', label: 'LinkedIn', bg: '#0077B5', icon: '💼' },
  { key: 'instagram', label: 'Instagram', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', icon: '📷' },
  { key: 'twitter', label: 'Twitter / X', bg: '#1DA1F2', icon: '🐦' },
  { key: 'facebook', label: 'Facebook', bg: '#1877F2', icon: '👤' },
]

export default async function VCardPlusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lang = await getLang()
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, name, status, design')
    .eq('id', id)
    .eq('type', 'vcard_plus')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let card: VCardPlusData = {}
  try { card = JSON.parse(qr.content) } catch {}
  const pixels = (qr.design as Record<string, unknown>)?.pixels as any

  const accent = card.color || '#041B4D'
  const isDark = card.theme === 'dark'
  const isGradient = card.theme === 'gradient'

  const vcf = [
    'BEGIN:VCARD', 'VERSION:3.0',
    card.name ? `FN:${card.name}` : '',
    card.title ? `TITLE:${card.title}` : '',
    card.company ? `ORG:${card.company}` : '',
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : '',
    card.phone2 ? `TEL;TYPE=WORK:${card.phone2}` : '',
    card.email ? `EMAIL;TYPE=HOME:${card.email}` : '',
    card.email2 ? `EMAIL;TYPE=WORK:${card.email2}` : '',
    card.website ? `URL:${card.website}` : '',
    card.address ? `ADR:;;${card.address};;;;` : '',
    card.note ? `NOTE:${card.note}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\n')

  const pageStyle = isGradient
    ? { background: `linear-gradient(160deg, #041B4D 0%, ${accent}33 55%, #0d0d2b 100%)` }
    : isDark ? { background: '#0d0d0d' } : { background: '#f0f2f5' }

  const cardBg = isDark ? '#1a1a1a' : isGradient ? 'rgba(255,255,255,0.08)' : '#fff'
  const cardBorder = isDark ? '#2a2a2a' : isGradient ? 'rgba(255,255,255,0.15)' : '#e5e7eb'
  const textMain = isDark || isGradient ? '#fff' : '#111'
  const textSub = isDark || isGradient ? 'rgba(255,255,255,0.65)' : '#6b7280'
  const rowBg = isDark ? '#242424' : isGradient ? 'rgba(255,255,255,0.06)' : '#f9fafb'
  const rowBorder = isDark ? '#333' : isGradient ? 'rgba(255,255,255,0.1)' : '#f0f0f0'

  return (
    <main className="min-h-screen" lang={lang} dir={dir(lang)} style={pageStyle}>
      <PixelSnippets pixels={pixels} />

      {/* Cover */}
      <div className="relative w-full h-44 overflow-hidden">
        {card.cover ? (
          <img src={card.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, #FF6A00 100%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
      </div>

      <div className="max-w-sm mx-auto px-4 -mt-12 relative z-10 pb-10 space-y-3">

        {/* Card principale */}
        <div className="rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

          {/* Avatar */}
          <div className="flex justify-center pt-5 pb-3">
            {card.photo ? (
              <img src={card.photo} alt={card.name || ''}
                className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, #FF6A00)` }}>
                {card.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>

          <div className="px-6 pb-6 text-center">
            <h1 className="text-xl font-extrabold" style={{ color: textMain }}>
              {card.name || 'Sans nom'}
            </h1>
            {card.title && (
              <p className="text-sm mt-0.5" style={{ color: textSub }}>{card.title}</p>
            )}
            {card.company && (
              <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full text-white"
                style={{ background: accent }}>
                🏢 {card.company}
              </span>
            )}
            {card.note && (
              <p className="text-xs mt-3 leading-relaxed" style={{ color: textSub }}>{card.note}</p>
            )}
          </div>
        </div>

        {/* Contact rows */}
        <div className="rounded-3xl overflow-hidden backdrop-blur-sm shadow-sm"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          {card.phone && (
            <a href={`tel:${card.phone}`}
              className="flex items-center gap-3 px-5 py-3.5 transition-opacity hover:opacity-80"
              style={{ borderBottom: `1px solid ${rowBorder}` }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ background: accent + '22' }}>📞</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: textSub }}>{t(lang, 'call')}</p>
                <p className="text-sm font-bold" style={{ color: textMain }}>{card.phone}</p>
              </div>
              <span style={{ color: accent }}>→</span>
            </a>
          )}
          {card.phone2 && (
            <a href={`tel:${card.phone2}`}
              className="flex items-center gap-3 px-5 py-3.5 transition-opacity hover:opacity-80"
              style={{ borderBottom: `1px solid ${rowBorder}` }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ background: accent + '22' }}>📞</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: textSub }}>{t(lang, 'call')}</p>
                <p className="text-sm font-bold" style={{ color: textMain }}>{card.phone2}</p>
              </div>
              <span style={{ color: accent }}>→</span>
            </a>
          )}
          {card.whatsapp && (
            <a href={`https://wa.me/${card.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3.5 transition-opacity hover:opacity-80"
              style={{ borderBottom: `1px solid ${rowBorder}` }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 bg-green-100">💬</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: textSub }}>{t(lang, 'whatsapp')}</p>
                <p className="text-sm font-bold" style={{ color: textMain }}>{card.whatsapp}</p>
              </div>
              <span style={{ color: '#25D366' }}>→</span>
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`}
              className="flex items-center gap-3 px-5 py-3.5 transition-opacity hover:opacity-80"
              style={{ borderBottom: `1px solid ${rowBorder}` }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ background: accent + '22' }}>✉️</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: textSub }}>{t(lang, 'email')}</p>
                <p className="text-sm font-bold truncate" style={{ color: textMain }}>{card.email}</p>
              </div>
              <span style={{ color: accent }}>→</span>
            </a>
          )}
          {card.email2 && (
            <a href={`mailto:${card.email2}`}
              className="flex items-center gap-3 px-5 py-3.5 transition-opacity hover:opacity-80"
              style={{ borderBottom: `1px solid ${rowBorder}` }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ background: accent + '22' }}>✉️</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: textSub }}>{t(lang, 'email')}</p>
                <p className="text-sm font-bold truncate" style={{ color: textMain }}>{card.email2}</p>
              </div>
              <span style={{ color: accent }}>→</span>
            </a>
          )}
          {card.website && (
            <a href={card.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3.5 transition-opacity hover:opacity-80"
              style={{ borderBottom: `1px solid ${rowBorder}` }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ background: accent + '22' }}>🌐</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: textSub }}>{t(lang, 'website')}</p>
                <p className="text-sm font-bold truncate" style={{ color: textMain }}>
                  {card.website.replace(/^https?:\/\//, '')}
                </p>
              </div>
              <span style={{ color: accent }}>→</span>
            </a>
          )}
          {card.address && (
            <div className="flex items-center gap-3 px-5 py-3.5"
              style={{ borderBottom: `1px solid ${rowBorder}` }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ background: accent + '22' }}>📍</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: textSub }}>Adresse</p>
                <p className="text-sm font-bold" style={{ color: textMain }}>{card.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Réseaux sociaux */}
        {SOCIAL_BTNS.some(s => (card as Record<string, string | undefined>)[s.key]) && (
          <div className="grid grid-cols-2 gap-2">
            {SOCIAL_BTNS.filter(s => (card as Record<string, string | undefined>)[s.key]).map(s => (
              <a key={s.key} href={(card as Record<string, string | undefined>)[s.key]!}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm text-white shadow-sm transition-transform active:scale-95"
                style={{ background: s.bg }}>
                <span>{s.icon}</span> {s.label}
              </a>
            ))}
          </div>
        )}

        {/* Save contact */}
        <a href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vcf)}`}
          download={`${card.name || 'contact'}.vcf`}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95"
          style={{ background: `linear-gradient(135deg, ${accent}, #FF6A00)` }}>
          📥 {t(lang, 'download_contact')}
        </a>

        <div className="text-center pt-3">
          <Link href="/" className="text-xs hover:opacity-70" style={{ color: textSub }}>
            {t(lang, 'powered_by')}{' '}
            <span className="font-bold" style={{ color: accent }}>QR CODE EXPRESS</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
