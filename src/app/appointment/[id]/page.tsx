import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { getThemeTokens, type LandingTheme } from '@/lib/landing-theme'

export const instant = false

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content, name').eq('id', id).eq('type', 'appointment').single()
  if (!qr) notFound()

  let d: Record<string, string & string[]> = {}
  try { d = JSON.parse(qr.content) } catch {}

  const color = d.color || '#041B4D'
  const th = getThemeTokens(d.page_theme as LandingTheme, color)
  const services: string[] = Array.isArray(d.services) ? d.services : []

  const pageStyle = th.isDark
    ? { background: (th as any).pageGradient || th.pageBg }
    : { background: th.pageBg }

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4" style={pageStyle}>
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-3xl text-white text-center p-8 shadow-lg" style={{ background: th.headerBg as string }}>
          {d.photo ? (
            <img src={d.photo} alt="profile" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white/30 shadow-lg" />
          ) : (
            <p className="text-5xl mb-3">📆</p>
          )}
          <h1 className="text-2xl font-extrabold" style={{ color: th.accentText }}>{d.name || 'Rendez-vous'}</h1>
          {d.profession && <p className="text-sm opacity-80 mt-1" style={{ color: th.accentText }}>{d.profession}</p>}
          {d.languages && <p className="text-xs opacity-60 mt-1" style={{ color: th.accentText }}>🌐 {d.languages}</p>}
        </div>

        {d.description && (
          <div className="rounded-2xl border p-5" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-sm" style={{ color: th.textMuted }}>{d.description}</p>
          </div>
        )}

        {services.length > 0 && (
          <div className="rounded-2xl border p-5" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: th.textMuted }}>Services</p>
            <div className="flex flex-wrap gap-2">
              {services.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: color }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {d.schedule && (
          <div className="rounded-2xl border p-5" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: th.textMuted }}>🕐 Horaires</p>
            <p className="text-sm whitespace-pre-line" style={{ color: th.textPrimary }}>{d.schedule}</p>
          </div>
        )}

        {d.address && (
          <div className="rounded-2xl border p-5" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: th.textMuted }}>📍 Adresse</p>
            <p className="text-sm" style={{ color: th.textPrimary }}>{d.address}</p>
          </div>
        )}

        <div className="space-y-3">
          {d.booking_url && (
            <a href={d.booking_url} target="_blank" rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm shadow"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
              📅 Prendre rendez-vous
            </a>
          )}
          {d.whatsapp && (
            <a href={`https://wa.me/${d.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-green-500 text-white font-bold text-sm shadow">
              💬 WhatsApp
            </a>
          )}
          {d.phone && (
            <a href={`tel:${d.phone}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border font-semibold text-sm"
              style={{ background: th.cardBg, borderColor: th.cardBorder, color: th.textPrimary }}>
              📞 Appeler
            </a>
          )}
          {d.email && (
            <a href={`mailto:${d.email}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border font-semibold text-sm"
              style={{ background: th.cardBg, borderColor: th.cardBorder, color: th.textPrimary }}>
              ✉️ Envoyer un e-mail
            </a>
          )}
          {d.instagram && (
            <a href={d.instagram.startsWith('http') ? d.instagram : `https://instagram.com/${d.instagram}`} target="_blank" rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border font-semibold text-sm"
              style={{ background: th.cardBg, borderColor: th.cardBorder, color: th.textPrimary }}>
              📸 Instagram
            </a>
          )}
          {d.website && (
            <a href={d.website} target="_blank" rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border font-semibold text-sm"
              style={{ background: th.cardBg, borderColor: th.cardBorder, color: th.textPrimary }}>
              🌐 Site web
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
