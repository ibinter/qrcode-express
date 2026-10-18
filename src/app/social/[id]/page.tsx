import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

const NETWORKS: { key: string; label: string; icon: string; bg: string; color: string }[] = [
  { key: 'instagram',  label: 'Instagram',  icon: '📷', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: '#fff' },
  { key: 'facebook',   label: 'Facebook',   icon: '👤', bg: '#1877F2', color: '#fff' },
  { key: 'tiktok',     label: 'TikTok',     icon: '🎵', bg: '#010101', color: '#fff' },
  { key: 'youtube',    label: 'YouTube',    icon: '▶️',  bg: '#FF0000', color: '#fff' },
  { key: 'twitter',    label: 'X / Twitter',icon: '✖',  bg: '#000',    color: '#fff' },
  { key: 'linkedin',   label: 'LinkedIn',   icon: '💼', bg: '#0077B5', color: '#fff' },
  { key: 'whatsapp',   label: 'WhatsApp',   icon: '💬', bg: '#25D366', color: '#fff' },
  { key: 'telegram',   label: 'Telegram',   icon: '✈️',  bg: '#2CA5E0', color: '#fff' },
  { key: 'snapchat',   label: 'Snapchat',   icon: '👻', bg: '#FFFC00', color: '#000' },
  { key: 'pinterest',  label: 'Pinterest',  icon: '📌', bg: '#E60023', color: '#fff' },
  { key: 'website',    label: 'Site web',   icon: '🌐', bg: '#041B4D', color: '#fff' },
]

export default async function SocialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, name')
    .eq('id', id)
    .eq('type', 'social')
    .single()

  if (!qr) notFound()

  let d: Record<string, string> = {}
  try { d = JSON.parse(qr.content) } catch {}

  const accentColor = d.social_color || '#041B4D'
  const activeLinks = NETWORKS.filter((n) => d[`social_${n.key}`])

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="rounded-3xl text-white text-center p-8 shadow-lg" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
          {d.social_photo ? (
            <img src={d.social_photo} alt="avatar" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white/30 shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl mx-auto mb-4">
              👤
            </div>
          )}
          <h1 className="text-2xl font-extrabold">{d.social_name || qr.name || 'Profil'}</h1>
          {d.social_bio && <p className="text-sm opacity-80 mt-2 leading-relaxed">{d.social_bio}</p>}
        </div>

        {/* Liens réseaux */}
        {activeLinks.length > 0 ? (
          <div className="space-y-3">
            {activeLinks.map((n) => {
              const rawUrl = d[`social_${n.key}`]
              const href = n.key === 'whatsapp'
                ? `https://wa.me/${rawUrl.replace(/\D/g, '')}`
                : rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
              return (
                <a key={n.key} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-sm font-bold shadow-sm transition-transform active:scale-95"
                  style={{ background: n.bg, color: n.color }}>
                  <span className="text-xl">{n.icon}</span>
                  <span>{n.label}</span>
                  <span className="ml-auto opacity-60 text-base">→</span>
                </a>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">Aucun lien configuré</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-300 pt-2 pb-4">Propulsé par QR Code Express</p>
      </div>
    </main>
  )
}
