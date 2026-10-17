import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import RoutingRulesManager from '@/components/dashboard/RoutingRulesManager'
import QRSettingsPanel from '@/components/dashboard/QRSettingsPanel'
import LinkHealthBadge from '@/components/dashboard/LinkHealthBadge'
import ScanNotificationToggle from '@/components/dashboard/ScanNotificationToggle'
import { getTranslations } from 'next-intl/server'

export const instant = false

const TYPE_LABELS: Record<string, string> = {
  url: 'URL', whatsapp: 'WhatsApp', vcard: 'Contact', vcard_plus: 'Carte Pro', wifi: 'Wi-Fi', text: 'Texte',
  email: 'E-mail', phone: 'Téléphone', sms: 'SMS', pdf: 'PDF', app: 'App Store', event: 'Événement',
  menu: 'Menu', coupon: 'Coupon', biolink: 'Bio Links', social: 'Réseaux', location: 'Localisation',
  catalog: 'Catalogue', review: 'Avis clients',
}

const COUNTRY_NAMES: Record<string, string> = {
  FR:'France', CI:'Côte d\'Ivoire', SN:'Sénégal', CM:'Cameroun', MA:'Maroc', DZ:'Algérie', TN:'Tunisie',
  NG:'Nigeria', GH:'Ghana', BJ:'Bénin', TG:'Togo', BF:'Burkina Faso', ML:'Mali', GN:'Guinée',
  US:'États-Unis', GB:'Royaume-Uni', DE:'Allemagne', BE:'Belgique', CH:'Suisse', CA:'Canada',
  IT:'Italie', ES:'Espagne', PT:'Portugal', NL:'Pays-Bas', BR:'Brésil', MX:'Mexique', JP:'Japon', CN:'Chine',
}
const COUNTRY_FLAGS: Record<string, string> = {
  FR:'🇫🇷', CI:'🇨🇮', SN:'🇸🇳', CM:'🇨🇲', MA:'🇲🇦', DZ:'🇩🇿', TN:'🇹🇳',
  NG:'🇳🇬', GH:'🇬🇭', BJ:'🇧🇯', TG:'🇹🇬', BF:'🇧🇫', ML:'🇲🇱', GN:'🇬🇳',
  US:'🇺🇸', GB:'🇬🇧', DE:'🇩🇪', BE:'🇧🇪', CH:'🇨🇭', CA:'🇨🇦',
  IT:'🇮🇹', ES:'🇪🇸', PT:'🇵🇹', NL:'🇳🇱', BR:'🇧🇷', MX:'🇲🇽', JP:'🇯🇵', CN:'🇨🇳',
}

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="flex items-end gap-[2px] h-28 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#041B4D] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {d.count} scan{d.count > 1 ? 's' : ''}
          </div>
          <div className="w-full rounded-t-sm transition-all"
            style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 6 : 2)}%`, background: d.count > 0 ? 'linear-gradient(to top, #FF6A00, #ffaa55)' : '#e5e7eb' }} />
          <span className="text-[8px] text-gray-400 truncate w-full text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function HourlyHeatmap({ data, heatLabels }: { data: number[]; heatLabels: [string, string, string] }) {
  const max = Math.max(...data, 1)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  return (
    <div>
      <div className="flex gap-[3px]">
        {hours.map(h => {
          const v = data[h] || 0
          const intensity = v / max
          const bg = v === 0 ? '#f3f4f6'
            : intensity < 0.25 ? '#fed7aa'
            : intensity < 0.5 ? '#fb923c'
            : intensity < 0.75 ? '#f97316'
            : '#ea580c'
          return (
            <div key={h} className="flex-1 group relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#041B4D] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                {String(h).padStart(2,'0')}h : {v}
              </div>
              <div className="h-6 rounded-sm" style={{ backgroundColor: bg }} />
              {h % 4 === 0 && <span className="text-[8px] text-gray-400 mt-0.5 block text-center">{String(h).padStart(2,'0')}</span>}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400">
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-sm bg-gray-100" /> 0
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#fed7aa' }} /> {heatLabels[0]}
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#f97316' }} /> {heatLabels[1]}
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#ea580c' }} /> {heatLabels[2]}
        </div>
      </div>
    </div>
  )
}

function DonutStat({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const r = 20, c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <div className="flex items-center gap-3">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6"/>
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={c * 0.25} strokeLinecap="round"/>
        <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>{pct}%</text>
      </svg>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-bold text-[#041B4D]">{count} scans</p>
      </div>
    </div>
  )
}

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')
  const t = await getTranslations('qrDetail')

  const admin = createAdminClient()

  const { data: qr } = await admin.from('qr_codes').select('*').eq('id', id).eq('user_id', user.id).single()
  if (!qr) notFound()

  // Last 30 days
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: events } = await admin
    .from('scan_events')
    .select('scanned_at, device_type, country, city, os, browser, is_bot')
    .eq('qr_id', id)
    .gte('scanned_at', since30)
    .order('scanned_at', { ascending: true })

  const realScans = (events || []).filter(e => !e.is_bot)
  const totalScans = realScans.length
  const botsCount = (events || []).filter(e => e.is_bot).length

  // 30-day chart
  const dayMap: Record<string, number> = {}
  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000)
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
  })
  days30.forEach(d => (dayMap[d] = 0))
  realScans.forEach(e => {
    const label = new Date(e.scanned_at).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
    if (label in dayMap) dayMap[label]++
  })
  const chartData30 = days30.map(d => ({ label: d, count: dayMap[d] }))

  // Hourly distribution
  const hourMap = Array(24).fill(0)
  realScans.forEach(e => {
    const h = new Date(e.scanned_at).getHours()
    hourMap[h]++
  })

  // Devices
  const devices: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 }
  realScans.forEach(e => {
    devices[e.device_type || 'desktop'] = (devices[e.device_type || 'desktop'] || 0) + 1
  })

  // OS
  const osMap: Record<string, number> = {}
  realScans.forEach(e => {
    if (e.os) osMap[e.os] = (osMap[e.os] || 0) + 1
  })
  const topOS = Object.entries(osMap).sort((a, b) => b[1] - a[1])

  // Browser
  const browserMap: Record<string, number> = {}
  realScans.forEach(e => {
    if (e.browser) browserMap[e.browser] = (browserMap[e.browser] || 0) + 1
  })
  const topBrowsers = Object.entries(browserMap).sort((a, b) => b[1] - a[1])

  // Countries top 10
  const countryMap: Record<string, number> = {}
  realScans.forEach(e => {
    if (e.country) countryMap[e.country] = (countryMap[e.country] || 0) + 1
  })
  const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 10)

  // Peak hour
  const peakHour = hourMap.indexOf(Math.max(...hourMap))
  const peakDay = (() => {
    const dm: Record<string, number> = {}
    realScans.forEach(e => {
      const day = new Date(e.scanned_at).toLocaleDateString(undefined, { weekday: 'long' })
      dm[day] = (dm[day] || 0) + 1
    })
    return Object.entries(dm).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  })()

  // Destination history
  const { data: destinations } = qr.mode === 'dynamic'
    ? await admin.from('qr_destinations').select('destination, is_active, set_at').eq('qr_id', id).order('set_at', { ascending: false }).limit(10)
    : { data: null }

  const { data: routingRules } = qr.mode === 'dynamic'
    ? await admin.from('routing_rules').select('*').eq('qr_id', id).order('priority', { ascending: false })
    : { data: null }

  // Event-specific: ticket stats
  const ticketStats = qr.type === 'event' ? await (async () => {
    const { count: total } = await admin.from('tickets').select('id', { count: 'exact', head: true }).eq('event_id', id)
    const { count: used } = await admin.from('tickets').select('id', { count: 'exact', head: true }).eq('event_id', id).eq('status', 'used')
    const { count: cancelled } = await admin.from('tickets').select('id', { count: 'exact', head: true }).eq('event_id', id).eq('status', 'cancelled')
    const { data: recent } = await admin.from('tickets').select('code, holder_name, holder_email, status, created_at').eq('event_id', id).order('created_at', { ascending: false }).limit(10)
    return { total: total ?? 0, used: used ?? 0, cancelled: cancelled ?? 0, recent: recent ?? [] }
  })() : null

  // A/B test stats: count scans per destination for ab_test rules
  const abRules = (routingRules || []).filter(r => r.rule_type === 'ab_test')
  const abStats: { ruleId: string; variants: { url: string; weight: number; scans: number }[] }[] = []
  for (const rule of abRules) {
    const variants = (rule.condition as Record<string, unknown>).variants as { url: string; weight: number }[] | undefined
    if (!variants) continue
    const variantStats = await Promise.all(variants.map(async v => {
      const { count } = await admin.from('scan_events').select('*', { count: 'exact', head: true })
        .eq('qr_id', id).eq('destination', v.url).gte('scanned_at', since30)
      return { ...v, scans: count || 0 }
    }))
    abStats.push({ ruleId: rule.id, variants: variantStats })
  }

  const design = (qr.design || {}) as Record<string, unknown>
  const notifyEmail = (design.notify_on_scan as string | undefined) || ''

  const OS_ICONS: Record<string, string> = { iOS:'🍎', Android:'🤖', Windows:'🪟', macOS:'🍏', Linux:'🐧' }
  const BROWSER_ICONS: Record<string, string> = { Chrome:'🌐', Safari:'🧭', Firefox:'🦊', Edge:'🔷', Opera:'🎭' }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">{t('back')}</Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#041B4D] truncate">{qr.name}</h1>
            <p className="text-sm text-gray-500">{TYPE_LABELS[qr.type] || qr.type} · {qr.mode === 'dynamic' ? t('dynamic') : t('static')}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 ${qr.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {qr.status === 'active' ? t('active') : qr.status}
          </span>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: t('scans_total'), value: qr.scan_count ?? 0, icon: '📊', color: '#041B4D' },
            { label: t('last_30'), value: totalScans, icon: '📅', color: '#FF6A00' },
            { label: t('peak_hour'), value: `${String(peakHour).padStart(2,'0')}h`, icon: '⏰', color: '#059669' },
            { label: t('bots_filtered'), value: botsCount, icon: '🤖', color: '#6b7280' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 30-day chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-[#041B4D]">{t('chart_title')}</h2>
            <span className="text-xs text-gray-400">{totalScans} {t('real_scans')}</span>
          </div>
          <BarChart data={chartData30} />
        </div>

        {/* Hourly heatmap */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#041B4D]">{t('hourly_title')}</h2>
            <span className="text-xs text-gray-400">{t('busiest_day')} {peakDay}</span>
          </div>
          {totalScans === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">{t('no_data')}</p>
          ) : (
            <HourlyHeatmap data={hourMap} heatLabels={[t('heat_low'), t('heat_med'), t('heat_high')]} />
          )}
        </div>

        {/* Devices + OS + Browser */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Devices */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#041B4D] mb-4">{t('devices')}</h2>
            <div className="space-y-3">
              <DonutStat label={t('mobile')} count={devices.mobile || 0} total={totalScans} color="#FF6A00" />
              <DonutStat label={t('desktop')} count={devices.desktop || 0} total={totalScans} color="#041B4D" />
              <DonutStat label={t('tablet')} count={devices.tablet || 0} total={totalScans} color="#059669" />
            </div>
          </div>

          {/* OS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#041B4D] mb-4">{t('systems')}</h2>
            {topOS.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">—</p>
            ) : topOS.map(([name, count]) => {
              const pct = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0
              return (
                <div key={name} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{OS_ICONS[name] || '💻'} {name}</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#041B4D]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Browser */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#041B4D] mb-4">{t('browsers')}</h2>
            {topBrowsers.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">—</p>
            ) : topBrowsers.map(([name, count]) => {
              const pct = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0
              return (
                <div key={name} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{BROWSER_ICONS[name] || '🌐'} {name}</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#FF6A00]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Countries */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h2 className="text-sm font-bold text-[#041B4D] mb-4">{t('geo')}</h2>
          {topCountries.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">{t('insufficient')}</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
              {topCountries.map(([code, count], i) => {
                const pct = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0
                const flag = COUNTRY_FLAGS[code] || '🌍'
                const name = COUNTRY_NAMES[code] || code
                return (
                  <div key={code} className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs w-4 shrink-0">#{i+1}</span>
                    <span className="text-base shrink-0">{flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-gray-700 truncate">{name}</span>
                        <span className="text-gray-500 shrink-0 ml-1">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(to right, #041B4D, #1e40af)' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h2 className="text-sm font-bold text-[#041B4D] mb-1">{t('notif_title')}</h2>
          <p className="text-xs text-gray-500 mb-4">{t('notif_desc')}</p>
          <ScanNotificationToggle qrId={id} initialEmail={notifyEmail} userEmail={user.email || ''} />
        </div>

        {/* Destination history */}
        {destinations && destinations.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <h2 className="text-sm font-bold text-[#041B4D] mb-3">{t('history_title')}</h2>
            <div className="space-y-2">
              {destinations.map((d, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-semibold shrink-0 ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {d.is_active ? t('current') : t('old')}
                  </span>
                  <span className="flex-1 truncate font-mono text-gray-700">{d.destination}</span>
                  <span className="text-gray-400 shrink-0">{new Date(d.set_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* A/B Test results */}
        {abStats.length > 0 && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 mb-4">
            <h2 className="text-sm font-bold text-[#041B4D] mb-4">{t('ab_title')}</h2>
            {abStats.map((ab, idx) => {
              const total = ab.variants.reduce((s, v) => s + v.scans, 0)
              const colors = ['#FF6A00', '#041B4D', '#059669', '#7c3aed']
              return (
                <div key={ab.ruleId} className={idx > 0 ? 'mt-5 pt-5 border-t border-gray-100' : ''}>
                  {ab.variants.map((v, i) => {
                    const pct = total > 0 ? Math.round((v.scans / total) * 100) : 0
                    const configured = v.weight
                    return (
                      <div key={i} className="mb-4">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-bold" style={{ color: colors[i % colors.length] }}>
                            {t('ab_variant', { x: String.fromCharCode(65 + i), n: configured })}
                          </span>
                          <span className="text-gray-500">{v.scans} {t('real_scans')} ({pct}%)</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">{v.url}</p>
                      </div>
                    )
                  })}
                  {total > 0 && (() => {
                    const winner = ab.variants.reduce((a, b) => a.scans > b.scans ? a : b)
                    const winIdx = ab.variants.indexOf(winner)
                    return (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-xs">
                        <span className="text-lg">🏆</span>
                        <span className="text-green-700">
                          <strong>Variant {String.fromCharCode(65 + winIdx)}</strong> {t('ab_leading', { n: winner.scans })}
                        </span>
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        )}

        {/* Smart Routing */}
        {qr.mode === 'dynamic' && (
          <div className="mb-4">
            <RoutingRulesManager qrId={id} initialRules={routingRules || []} />
          </div>
        )}

        {/* Link health */}
        {qr.mode === 'dynamic' && qr.content?.startsWith('http') && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <h2 className="text-sm font-bold text-[#041B4D] mb-3">{t('link_watch')}</h2>
            <LinkHealthBadge
              qrId={id}
              url={qr.content}
              initialHealth={(qr.design as Record<string, unknown>)?.link_health as any ?? null}
            />
          </div>
        )}

        {/* Event management panel */}
        {qr.type === 'event' && ticketStats && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-4">
            <h2 className="text-sm font-bold text-[#041B4D] mb-4">{t('ticketing')}</h2>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: t('registered'), value: ticketStats.total, color: '#041B4D', icon: '👥' },
                { label: t('validated'), value: ticketStats.used, color: '#16a34a', icon: '✅' },
                { label: t('cancelled'), value: ticketStats.cancelled, color: '#dc2626', icon: '❌' },
              ].map(s => (
                <div key={s.label} className="text-center bg-gray-50 rounded-xl p-3">
                  <p className="text-lg">{s.icon}</p>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-4">
              <Link href={`/scan/${id}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm bg-[#041B4D] hover:bg-[#0a2a6a] transition-colors">
                {t('scan_entry')}
              </Link>
              <a href={`/api/event/${id}/export`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-gray-200 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors">
                {t('export_csv')}
              </a>
            </div>

            {/* Recent registrations */}
            {ticketStats.recent.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t('last_signups')}</p>
                <div className="space-y-1.5">
                  {ticketStats.recent.map((t: { code: string; holder_name: string; holder_email: string; status: string; created_at: string }) => (
                    <div key={t.code} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-sm">{t.status === 'used' ? '✅' : t.status === 'cancelled' ? '❌' : '🎟️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{t.holder_name}</p>
                        <p className="text-xs text-gray-400 truncate">{t.holder_email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-mono text-gray-500">{t.code}</p>
                        <p className="text-[10px] text-gray-400">{new Date(t.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ticketStats.total === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">{t('no_signups')}</p>
            )}
          </div>
        )}

        {/* Settings */}
        <QRSettingsPanel
          qrId={id}
          initialFallbackUrl={(qr.design as Record<string, unknown>)?.fallback_url as string || ''}
          initialStatus={qr.status}
          initialUtm={(qr.design as Record<string, unknown>)?.utm as any || null}
          initialPixels={(qr.design as Record<string, unknown>)?.pixels as any || null}
        />
      </div>
    </main>
  )
}
