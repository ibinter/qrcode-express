import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { getThemeTokens, type LandingTheme } from '@/lib/landing-theme'

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content, name').eq('id', id).eq('type', 'job').single()
  if (!qr) notFound()

  let d: Record<string, string> = {}
  try { d = JSON.parse(qr.content) } catch {}

  const color = d.color || '#041B4D'
  const th = getThemeTokens(d.page_theme as LandingTheme, color)
  const pageStyle = th.isDark
    ? { background: (th as Record<string, unknown>).pageGradient as string || th.pageBg }
    : { background: th.pageBg }

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4" style={pageStyle}>
      <div className="w-full max-w-sm space-y-4">
        {d.cover && (
          <img src={d.cover} alt="cover" className="w-full h-40 object-cover rounded-3xl shadow-lg" />
        )}

        <div className="rounded-3xl text-white p-8 shadow-lg" style={{ background: th.headerBg as string }}>
          {d.logo ? (
            <img src={d.logo} alt="logo" className="w-16 h-16 rounded-2xl object-contain bg-white p-2 mx-auto mb-4" />
          ) : (
            <p className="text-5xl text-center mb-3">💼</p>
          )}
          <h1 className="text-2xl font-extrabold text-center" style={{ color: th.accentText }}>{d.title}</h1>
          <p className="text-center opacity-80 mt-1" style={{ color: th.accentText }}>{d.company}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {d.type && <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">{d.type}</span>}
            {d.location && <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">📍 {d.location}</span>}
            {d.salary_range && <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">💰 {d.salary_range}</span>}
            {d.remote === 'true' && <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">🌍 Télétravail</span>}
          </div>
        </div>

        <div className="rounded-2xl border p-5 space-y-2" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
          {d.experience && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase" style={{ color: th.textMuted }}>Expérience</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: color }}>{d.experience}</span>
            </div>
          )}
          {d.deadline && (
            <p className="text-xs font-semibold" style={{ color: '#d97706' }}>⏰ Candidatures avant le {new Date(d.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          )}
        </div>

        {d.description && (
          <div className="rounded-2xl border p-5" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: th.textMuted }}>Description du poste</p>
            <p className="text-sm whitespace-pre-line" style={{ color: th.textPrimary }}>{d.description}</p>
          </div>
        )}

        {d.requirements && (
          <div className="rounded-2xl border p-5" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: th.textMuted }}>Profil recherché</p>
            <p className="text-sm whitespace-pre-line" style={{ color: th.textPrimary }}>{d.requirements}</p>
          </div>
        )}

        {d.benefits && (
          <div className="rounded-2xl border p-5" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: th.textMuted }}>Avantages</p>
            <p className="text-sm whitespace-pre-line" style={{ color: th.textPrimary }}>{d.benefits}</p>
          </div>
        )}

        <div className="space-y-3">
          {d.apply_url && (
            <a href={d.apply_url} target="_blank" rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm shadow"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
              Postuler maintenant
            </a>
          )}
          {d.whatsapp && (
            <a href={`https://wa.me/${d.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-green-500 text-white font-bold text-sm shadow">
              💬 Contacter via WhatsApp
            </a>
          )}
          {d.apply_email && (
            <a href={`mailto:${d.apply_email}?subject=Candidature - ${d.title}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border font-semibold text-sm"
              style={{ background: th.cardBg, borderColor: th.cardBorder, color: th.textPrimary }}>
              ✉️ Envoyer ma candidature
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
