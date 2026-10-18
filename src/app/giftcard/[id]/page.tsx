import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { getThemeTokens, type LandingTheme } from '@/lib/landing-theme'

export default async function GiftCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content, name').eq('id', id).eq('type', 'giftcard').single()
  if (!qr) notFound()

  let d: Record<string, string> = {}
  try { d = JSON.parse(qr.content) } catch {}

  const color = d.color || '#8B5CF6'
  const th = getThemeTokens(d.page_theme as LandingTheme, color)
  const pageStyle = th.isDark
    ? { background: (th as Record<string, unknown>).pageGradient as string || th.pageBg }
    : { background: th.pageBg }

  // Card gradient uses local "theme" field (gradient/solid/dark) independent of page_theme
  const themeGradients: Record<string, string> = {
    gradient: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
    solid: color,
    dark: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  }
  const cardBg = themeGradients[d.theme || 'gradient'] || themeGradients.gradient

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4" style={pageStyle}>
      <div className="w-full max-w-sm space-y-4">
        {d.cover && (
          <img src={d.cover} alt="cover" className="w-full h-40 object-cover rounded-3xl shadow-lg" />
        )}

        <div className="rounded-3xl text-white p-8 shadow-2xl relative overflow-hidden" style={{ background: cardBg }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.5)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.5)', transform: 'translate(-30%, 30%)' }} />
          <div className="relative z-10">
            {d.logo ? (
              <img src={d.logo} alt="logo" className="h-10 object-contain mb-4" />
            ) : (
              <p className="text-4xl mb-4">{d.occasion || '🎁'}</p>
            )}
            <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Carte Cadeau</p>
            <h1 className="text-4xl font-extrabold">{d.amount} <span className="text-xl">{d.currency || 'FCFA'}</span></h1>
            {d.brand && <p className="text-lg font-semibold mt-1 opacity-90">{d.brand}</p>}
          </div>
        </div>

        {d.recipient_name && (
          <div className="rounded-2xl border p-5 text-center" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: th.textMuted }}>Pour</p>
            <p className="text-xl font-extrabold" style={{ color: th.textPrimary }}>{d.recipient_name}</p>
          </div>
        )}

        {d.message && (
          <div className="rounded-2xl border p-5" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: th.textMuted }}>Message</p>
            <p className="text-sm italic" style={{ color: th.textPrimary }}>&quot;{d.message}&quot;</p>
          </div>
        )}

        {d.expiry_date && (
          <div className="rounded-2xl p-4 text-center" style={{ background: th.isDark ? 'rgba(217,119,6,0.15)' : '#fffbeb', borderColor: '#fde68a' }}>
            <p className="text-sm font-semibold" style={{ color: '#d97706' }}>⏰ Valable jusqu&apos;au {new Date(d.expiry_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        )}

        {d.redeem_url && (
          <a href={d.redeem_url} target="_blank" rel="noopener"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm shadow"
            style={{ background: cardBg }}>
            🎁 Utiliser cette carte cadeau
          </a>
        )}

        {d.terms && (
          <div className="rounded-2xl border p-4" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: th.textMuted }}>Conditions d&apos;utilisation</p>
            <p className="text-xs whitespace-pre-line" style={{ color: th.textMuted }}>{d.terms}</p>
          </div>
        )}
      </div>
    </main>
  )
}
