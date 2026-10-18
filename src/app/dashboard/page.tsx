import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'
import QRDashboardCards from '@/components/dashboard/QRDashboardCards'
import ReferralClaimOnce from '@/components/ReferralClaimOnce'
import WelcomeBanner from '@/components/WelcomeBanner'
import DashboardBanner from '@/components/dashboard/DashboardBanner'
import AnalyticsWidget from '@/components/dashboard/AnalyticsWidget'
import { getTranslations } from 'next-intl/server'
import { DYNAMIC_QR_LIMITS } from '@/lib/plan-guard'
import type { Plan } from '@/lib/plan-guard'


export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const instant = false

const TYPE_ICONS: Record<string, string> = {
  url: '🔗', whatsapp: '💬', vcard: '👤', vcard_plus: '🪪', wifi: '📶', text: '📝',
  email: '✉️', phone: '📞', sms: '💬', pdf: '📄', app: '📲', event: '📅',
  menu: '🍽️', coupon: '🎫', biolink: '🔗', social: '📱', location: '📍',
  catalog: '🛍️', review: '⭐', lead: '📋', payment: '💳',
  business: '🏪', gallery: '🖼️', video: '▶️', audio: '🎵', crypto: '₿',
  ticket: '🎟️', loyalty: '🪙', appointment: '📆', survey: '📊', job: '💼', giftcard: '🎁', download: '⬇️',
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const sp = await searchParams
  const paymentStatus = sp.payment as 'success' | 'cancelled' | undefined

  const admin = createAdminClient()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: qrs },
    { data: profile },
    { data: scansToday },
    { data: scans7d },
    { data: recentActivity },
    { count: scans30dCount },
    { count: scansPrev30dCount },
  ] = await Promise.all([
    supabase.from('qr_codes').select('*').eq('user_id', user.id).neq('status', 'archived').order('created_at', { ascending: false }).limit(100),
    admin.from('profiles').select('credits, plan, full_name').eq('id', user.id).single(),
    admin.from('scan_events').select('id').eq('user_id', user.id).gte('scanned_at', today),
    admin.from('scan_events').select('id, qr_id, scanned_at, country, device_type').eq('user_id', user.id).gte('scanned_at', sevenDaysAgo).order('scanned_at', { ascending: false }).limit(200),
    admin.from('scan_events').select('qr_id, scanned_at, country, device_type').eq('user_id', user.id).order('scanned_at', { ascending: false }).limit(8),
    admin.from('scan_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('scanned_at', thirtyDaysAgo),
    admin.from('scan_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('scanned_at', sixtyDaysAgo).lt('scanned_at', thirtyDaysAgo),
  ])

  const totalScans = qrs?.reduce((sum, q) => sum + (q.scan_count || 0), 0) ?? 0
  const dynamicCount = qrs?.filter(q => q.mode === 'dynamic').length ?? 0
  const activeCount = qrs?.filter(q => q.status === 'active').length ?? 0
  const pausedCount = qrs?.filter(q => q.status === 'paused').length ?? 0
  const credits = profile?.credits ?? 0
  const plan = profile?.plan ?? 'free'
  const scansTodayCount = scansToday?.length ?? 0
  const scans7dCount = scans7d?.length ?? 0
  const s30 = scans30dCount ?? 0
  const sPrev30 = scansPrev30dCount ?? 0
  const scansTrend = sPrev30 > 0 ? Math.round(((s30 - sPrev30) / sPrev30) * 100) : null

  // Top 3 QR by scans
  const top3 = [...(qrs ?? [])].sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0)).slice(0, 3)

  // Recent scans feed with QR name lookup
  const qrMap: Record<string, { name: string; type: string }> = {}
  for (const q of qrs ?? []) qrMap[q.id] = { name: q.name || `QR ${q.type}`, type: q.type }

  const t = await getTranslations('dashboard')

  // 7-day mini chart data
  const chartData7d = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
    const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })
    const count = (scans7d ?? []).filter(e => new Date(e.scanned_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }) === dateStr).length
    const isToday = i === 6
    return { label: isToday ? t('chart_today') : d.toLocaleDateString('en-US', { weekday: 'short' }), count, isToday }
  })
  const maxChart = Math.max(...chartData7d.map(d => d.count), 1)

  // Keyed by internal Supabase plan names (essential=Starter, pro=Essentiel, business=Pro, agency=Business)
  const PLAN_LIMITS: Record<string, { qr: number; scans: number }> = {
    free:       { qr: 5,    scans: 100    },
    essential:  { qr: 20,   scans: 1000   },
    pro:        { qr: 100,  scans: 5000   },
    business:   { qr: 9999, scans: 50000  },
    agency:     { qr: 9999, scans: 999999 },
    enterprise: { qr: 9999, scans: 999999 },
  }
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
  const staticCount = qrs?.filter(q => q.mode !== 'dynamic').length ?? 0
  const qrUsagePct = Math.min(Math.round((staticCount / limits.qr) * 100), 100)
  const dynLimit = DYNAMIC_QR_LIMITS[plan as Plan]
  const dynUsagePct = dynLimit !== undefined ? Math.min(Math.round((dynamicCount / dynLimit) * 100), 100) : 0

  const QUICK_TYPES = [
    { type: 'url', icon: '🔗', label: 'URL' },
    { type: 'biolink', icon: '👤', label: 'Bio Link' },
    { type: 'vcard_plus', icon: '🪪', label: t('quick_vcard_pro') },
    { type: 'menu', icon: '🍽️', label: t('quick_menu') },
    { type: 'coupon', icon: '🎫', label: t('quick_coupon') },
    { type: 'event', icon: '📅', label: t('quick_event') },
    { type: 'review', icon: '⭐', label: t('quick_review') },
    { type: 'wifi', icon: '📶', label: t('quick_wifi') },
  ]

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <ReferralClaimOnce />
      <WelcomeBanner />
      <DashboardBanner paymentStatus={paymentStatus} plan={plan} credits={credits} />

      <div className="mt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-[#041B4D]">
              {t('greeting', { name: profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] })}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {(qrs?.length ?? 0) === 0 ? t('subtitle_empty') : t('subtitle_default')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link href="/barcode"
              className="text-center px-3 py-2 rounded-xl text-xs font-semibold border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors">
              📊 <span className="hidden sm:inline">{t('btn_barcodes')}</span>
            </Link>
            <Link href="/labels"
              className="text-center px-3 py-2 rounded-xl text-xs font-semibold border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
              🏷️ <span className="hidden sm:inline">{t('btn_labels')}</span>
            </Link>
            <Link href="/dashboard/bulk"
              className="text-center px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
              📥 <span className="hidden sm:inline">{t('btn_import').replace(' CSV', '')} </span>CSV
            </Link>
            <Link href="/create"
              className="text-center px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
              {t('btn_new_qr')}
            </Link>
          </div>
        </div>

        {/* Quick-create shortcuts */}
        <div className="mb-5 overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex gap-2 w-max sm:w-auto sm:grid sm:grid-cols-8">
            {QUICK_TYPES.map(t => (
              <Link key={t.type} href={`/create?type=${t.type}`}
                className="flex flex-col items-center gap-1.5 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:border-orange-300 hover:shadow-sm hover:bg-orange-50 transition-all group shrink-0 sm:shrink">
                <span className="text-2xl group-hover:scale-110 transition-transform">{t.icon}</span>
                <span className="text-[10px] font-semibold text-gray-600 group-hover:text-[#FF6A00] whitespace-nowrap">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {/* QR actifs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xl">📱</span>
              {pausedCount > 0 && <span className="text-[9px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full font-semibold">{t('kpi_paused', { n: pausedCount })}</span>}
            </div>
            <p className="text-2xl font-extrabold text-[#FF6A00]">{activeCount}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t('kpi_active')}</p>
          </div>

          {/* Scans total */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xl">📊</span>
              <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-semibold">{t('kpi_today', { n: scansTodayCount })}</span>
            </div>
            <p className="text-2xl font-extrabold text-blue-600">{totalScans.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t('kpi_total_scans')}</p>
          </div>

          {/* Scans 30j avec tendance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xl">🗓️</span>
              {scansTrend !== null && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                  scansTrend >= 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                }`}>
                  {scansTrend >= 0 ? '↑' : '↓'} {Math.abs(scansTrend)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">{s30.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t('kpi_30d')}</p>
          </div>

          {/* Dynamiques */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xl">⚡</span>
              <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full font-semibold">{t('kpi_total', { n: qrs?.length ?? 0 })}</span>
            </div>
            <p className="text-2xl font-extrabold text-purple-600">{dynamicCount}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t('kpi_dynamic')}</p>
          </div>
        </div>

        {/* Usage + 7d chart + Top QR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Usage bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">{t('usage_title')}</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">{t('usage_qr')} (statiques)</span>
                  <span className="font-bold text-[#041B4D]">{staticCount} / {limits.qr >= 9999 ? '∞' : limits.qr}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${qrUsagePct}%`, background: qrUsagePct >= 90 ? '#ef4444' : qrUsagePct >= 70 ? '#f59e0b' : '#FF6A00' }} />
                </div>
                {qrUsagePct >= 80 && (
                  <p className="text-[10px] text-orange-500 mt-1 font-semibold">{t('usage_limit')}<Link href="/tarifs" className="underline">{t('usage_upgrade')}</Link></p>
                )}
              </div>
              {dynLimit !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 font-medium">QR dynamiques</span>
                    <span className="font-bold text-[#041B4D]">{dynamicCount} / {dynLimit}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${dynUsagePct}%`, background: dynUsagePct >= 90 ? '#ef4444' : dynUsagePct >= 70 ? '#f59e0b' : '#8b5cf6' }} />
                  </div>
                  {dynUsagePct >= 80 && (
                    <p className="text-[10px] text-orange-500 mt-1 font-semibold">Limite QR dynamiques proche — <Link href="/tarifs" className="underline">Passer au plan supérieur</Link></p>
                  )}
                </div>
              )}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">{t('usage_scans')}</span>
                  <span className="font-bold text-[#041B4D]">{scans7dCount}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-400 transition-all"
                    style={{ width: `${Math.min(Math.round((scans7dCount / Math.max(limits.scans / 4, 1)) * 100), 100)}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">{t('usage_credits')}</span>
                  <span className="text-sm font-extrabold text-[#FF6A00]">{credits.toLocaleString()}</span>
                </div>
                <Link href="/portefeuille"
                  className="mt-2 block text-center text-[10px] font-bold text-[#FF6A00] border border-orange-200 rounded-lg py-1.5 hover:bg-orange-50 transition-colors">
                  {t('usage_recharge')}
                </Link>
              </div>
            </div>
          </div>

          {/* 7-day chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('chart_title')}</h2>
              <span className="text-xs font-bold text-[#FF6A00]">{scans7dCount}</span>
            </div>
            <div className="flex items-end gap-1 h-24">
              {chartData7d.map((d) => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                  <div className="relative w-full">
                    {d.count > 0 && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-[#041B4D] rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                        {d.count}
                      </div>
                    )}
                    <div className="w-full rounded-t transition-all"
                      style={{
                        height: `${Math.max(Math.round((d.count / maxChart) * 88), d.count > 0 ? 4 : 2)}px`,
                        background: d.isToday ? '#FF6A00' : d.count > 0 ? '#FED7AA' : '#f3f4f6',
                      }}
                    />
                  </div>
                  <span className={`text-[9px] font-semibold ${d.isToday ? 'text-[#FF6A00]' : 'text-gray-400'}`}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 QR */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">{t('top_title')}</h2>
            {top3.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">{t('top_empty')}</p>
            ) : (
              <div className="space-y-3">
                {top3.map((qr, i) => (
                  <Link key={qr.id} href={`/dashboard/${qr.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${
                      i === 0 ? 'bg-[#FF6A00]' : i === 1 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#041B4D] truncate group-hover:text-[#FF6A00]">
                        {TYPE_ICONS[qr.type]} {qr.name || `QR ${qr.type}`}
                      </p>
                      <p className="text-[10px] text-gray-400">{qr.type} · {qr.mode === 'dynamic' ? '⚡' : '🔒'}</p>
                    </div>
                    <span className="text-xs font-bold text-[#041B4D] shrink-0">{(qr.scan_count || 0).toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/dashboard" className="mt-4 block text-center text-[10px] font-bold text-gray-400 hover:text-[#FF6A00] transition-colors">
              {t('top_see_all')}
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        {(recentActivity?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">{t('activity_title')}</h2>
            <div className="space-y-2">
              {(recentActivity ?? []).map((e, i) => {
                const qrInfo = qrMap[e.qr_id]
                const time = new Date(e.scanned_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                const date = new Date(e.scanned_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
                const isToday = new Date(e.scanned_at).toDateString() === now.toDateString()
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-sm shrink-0">
                      {e.device_type === 'mobile' ? '📱' : e.device_type === 'tablet' ? '📲' : '💻'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {qrInfo ? `${TYPE_ICONS[qrInfo.type]} ${qrInfo.name}` : t('activity_scanned')}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {e.country ? `🌍 ${e.country}` : ''} · {e.device_type || 'appareil'}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{isToday ? time : date}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Analytics overview */}
        <AnalyticsWidget />

        {/* QR list */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#041B4D]">{t('qr_list_title')}</h2>
            {(qrs?.length ?? 0) > 0 && (
              <span className="text-xs text-gray-400 font-semibold">{qrs?.length} code{(qrs?.length ?? 0) > 1 ? 's' : ''}</span>
            )}
          </div>
          {!qrs?.length ? (
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-10 text-center">
              <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                📱
              </div>
              <p className="font-bold text-lg text-[#041B4D] mb-1">{t('empty_title')}</p>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                {t('empty_desc')}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {QUICK_TYPES.slice(0, 4).map(t => (
                  <Link key={t.type} href={`/create?type=${t.type}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-orange-300 hover:text-[#FF6A00] hover:bg-orange-50 transition-all">
                    {t.icon} {t.label}
                  </Link>
                ))}
              </div>
              <Link href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-sm"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                {t('empty_cta')}
              </Link>
            </div>
          ) : (
            <QRDashboardCards qrs={qrs} typeIcons={TYPE_ICONS} />
          )}
        </div>
      </div>
    </div>
  )
}
