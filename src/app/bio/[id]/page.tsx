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
  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'biolink').single()
  if (!qr) return buildMeta({ title: 'Profil' })
  let bio: { name?: string; bio?: string; avatar?: string } = {}
  try { bio = JSON.parse(qr.content) } catch {}
  return buildMeta({ title: bio.name || 'Profil', description: bio.bio, image: bio.avatar })
}

const NETWORK_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  instagram:  { color: '#fff', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', icon: '📷', label: 'Instagram' },
  tiktok:     { color: '#fff', bg: '#010101', icon: '🎵', label: 'TikTok' },
  facebook:   { color: '#fff', bg: '#1877F2', icon: '👤', label: 'Facebook' },
  twitter:    { color: '#fff', bg: '#1DA1F2', icon: '🐦', label: 'Twitter' },
  x:          { color: '#fff', bg: '#000', icon: '✖', label: 'X' },
  linkedin:   { color: '#fff', bg: '#0077B5', icon: '💼', label: 'LinkedIn' },
  youtube:    { color: '#fff', bg: '#FF0000', icon: '▶️', label: 'YouTube' },
  whatsapp:   { color: '#fff', bg: '#25D366', icon: '💬', label: 'WhatsApp' },
  telegram:   { color: '#fff', bg: '#2CA5E0', icon: '✈️', label: 'Telegram' },
  snapchat:   { color: '#000', bg: '#FFFC00', icon: '👻', label: 'Snapchat' },
  pinterest:  { color: '#fff', bg: '#E60023', icon: '📌', label: 'Pinterest' },
  website:    { color: '#fff', bg: '#041B4D', icon: '🌐', label: 'Site web' },
  autre:      { color: '#fff', bg: '#6B7280', icon: '🔗', label: 'Lien' },
}

interface BioLink { label: string; url: string; network?: string }
interface BioData {
  name: string
  bio?: string
  avatar?: string
  cover?: string
  color?: string
  theme?: 'light' | 'dark' | 'gradient'
  title?: string
  company?: string
  phone?: string
  whatsapp?: string
  email?: string
  show_vcard?: boolean
  links: BioLink[]
}

export default async function BioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lang = await getLang()
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, status, design')
    .eq('id', id)
    .eq('type', 'biolink')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let bio: BioData = { name: '', links: [] }
  try { bio = JSON.parse(qr.content) } catch {}
  const pixels = (qr.design as Record<string, unknown>)?.pixels as any

  const accent = bio.color || '#FF6A00'
  const isDark = bio.theme === 'dark'
  const isGradient = bio.theme === 'gradient'

  // vCard download
  const vcf = [
    'BEGIN:VCARD', 'VERSION:3.0',
    bio.name ? `FN:${bio.name}` : '',
    bio.title ? `TITLE:${bio.title}` : '',
    bio.company ? `ORG:${bio.company}` : '',
    bio.phone ? `TEL:${bio.phone}` : '',
    bio.email ? `EMAIL:${bio.email}` : '',
    bio.links.find(l => l.network === 'website')?.url ? `URL:${bio.links.find(l => l.network === 'website')?.url}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\n')

  // theme tokens
  const pageBg = isDark ? '#0d0d0d' : isGradient ? undefined : '#f5f5f5'
  const pageStyle = isGradient
    ? { background: `linear-gradient(160deg, #041B4D 0%, ${accent}33 55%, #1a0035 100%)` }
    : { background: pageBg }
  const cardBg = isDark ? '#1a1a1a' : isGradient ? 'rgba(255,255,255,0.07)' : '#fff'
  const cardBorder = isDark ? '#2a2a2a' : isGradient ? 'rgba(255,255,255,0.15)' : '#e5e7eb'
  const textPrimary = isDark || isGradient ? '#fff' : '#111'
  const textMuted = isDark || isGradient ? 'rgba(255,255,255,0.6)' : '#6b7280'

  return (
    <main className="min-h-screen" lang={lang} dir={dir(lang)} style={pageStyle}>
      <PixelSnippets pixels={pixels} />

      {/* Cover banner */}
      <div className="relative w-full h-44 overflow-hidden">
        {bio.cover ? (
          <img src={bio.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, #041B4D 100%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
      </div>

      <div className="max-w-sm mx-auto px-4 -mt-12 relative z-10 pb-10">

        {/* Avatar + identity */}
        <div className="text-center mb-5">
          <div className="inline-block relative mb-3">
            {bio.avatar ? (
              <img src={bio.avatar} alt={bio.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl mx-auto" />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl mx-auto flex items-center justify-center text-3xl font-black text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, #041B4D)` }}>
                {bio.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white bg-green-400" />
          </div>

          <h1 className="text-xl font-extrabold leading-tight" style={{ color: textPrimary }}>
            {bio.name}
          </h1>

          {(bio.title || bio.company) && (
            <p className="text-sm mt-0.5" style={{ color: accent }}>
              {bio.title}{bio.title && bio.company ? ' · ' : ''}{bio.company}
            </p>
          )}

          {bio.bio && (
            <p className="text-sm mt-2 leading-relaxed max-w-xs mx-auto" style={{ color: textMuted }}>
              {bio.bio}
            </p>
          )}
        </div>

        {/* Quick contact chips */}
        {(bio.phone || bio.whatsapp || bio.email) && (
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            {bio.phone && (
              <a href={`tel:${bio.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-transform active:scale-95"
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textPrimary }}>
                📞 {t(lang, 'call')}
              </a>
            )}
            {bio.whatsapp && (
              <a href={`https://wa.me/${bio.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-transform active:scale-95"
                style={{ background: '#25D366', color: '#fff' }}>
                💬 {t(lang, 'whatsapp')}
              </a>
            )}
            {bio.email && (
              <a href={`mailto:${bio.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-transform active:scale-95"
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textPrimary }}>
                ✉️ {t(lang, 'email')}
              </a>
            )}
          </div>
        )}

        {/* Links */}
        <div className="space-y-2.5">
          {bio.links.map((link, i) => {
            const key = link.network?.toLowerCase() || 'autre'
            const cfg = NETWORK_CONFIG[key] || NETWORK_CONFIG['autre']
            return (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl font-semibold text-sm shadow-sm backdrop-blur-sm transition-transform active:scale-[0.98]"
                style={{ background: cfg.bg, color: cfg.color }}>
                <span className="text-lg w-6 text-center shrink-0">{cfg.icon}</span>
                <span className="flex-1">{link.label || cfg.label}</span>
                <span className="opacity-60 text-xs">→</span>
              </a>
            )
          })}
        </div>

        {/* Save contact vCard */}
        {bio.show_vcard !== false && (
          <a href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vcf)}`}
            download={`${bio.name || 'contact'}.vcf`}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-transform active:scale-95"
            style={{ background: `linear-gradient(135deg, ${accent}, #041B4D)` }}>
            📥 {t(lang, 'download_contact')}
          </a>
        )}

        {/* Footer */}
        <div className="mt-7 text-center">
          <Link href="/" className="text-xs hover:opacity-80" style={{ color: textMuted }}>
            {t(lang, 'powered_by')}{' '}
            <span className="font-bold" style={{ color: accent }}>QR CODE EXPRESS</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
