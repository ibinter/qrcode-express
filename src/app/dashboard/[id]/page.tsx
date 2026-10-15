import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import RoutingRulesManager from '@/components/dashboard/RoutingRulesManager'

export const instant = false

const TYPE_LABELS: Record<string, string> = {
  url: 'URL', whatsapp: 'WhatsApp', vcard: 'Contact', vcard_plus: 'Carte Pro', wifi: 'Wi-Fi', text: 'Texte',
  email: 'E-mail', phone: 'Téléphone', sms: 'SMS', pdf: 'PDF', app: 'App Store', event: 'Événement',
  menu: 'Menu', coupon: 'Coupon', biolink: 'Bio Links', social: 'Réseaux', location: 'Localisation',
}

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="flex items-end gap-1 h-32 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#041B4D] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {d.count} scan{d.count > 1 ? 's' : ''}
          </div>
          <div
            className="w-full rounded-t-sm transition-all"
            style={{
              height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 2)}%`,
              background: d.count > 0 ? 'linear-gradient(to top, #FF6A00, #ffaa55)' : '#e5e7eb',
            }}
          />
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!qr) notFound()

  // Last 30 days of scans
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: events } = await admin
    .from('scan_events')
    .select('scanned_at, device_type, country, is_bot')
    .eq('qr_id', id)
    .gte('scanned_at', since)
    .order('scanned_at', { ascending: true })

  const realScans = (events || []).filter((e) => !e.is_bot)
  const totalScans = realScans.length

  // Group by day (last 14 days for chart)
  const dayMap: Record<string, number> = {}
  const days14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  })
  days14.forEach((d) => (dayMap[d] = 0))
  realScans.forEach((e) => {
    const label = new Date(e.scanned_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    if (label in dayMap) dayMap[label]++
  })
  const chartData = days14.map((d) => ({ label: d, count: dayMap[d] }))

  // Devices
  const devices: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0, bot: 0 }
  ;(events || []).forEach((e) => {
    if (e.is_bot) devices.bot++
    else devices[e.device_type || 'desktop'] = (devices[e.device_type || 'desktop'] || 0) + 1
  })

  // Countries top 5
  const countryMap: Record<string, number> = {}
  realScans.forEach((e) => {
    if (e.country) countryMap[e.country] = (countryMap[e.country] || 0) + 1
  })
  const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Destination history (for dynamic QRs)
  const { data: destinations } = qr.mode === 'dynamic'
    ? await admin.from('qr_destinations').select('destination, is_active, set_at').eq('qr_id', id).order('set_at', { ascending: false }).limit(10)
    : { data: null }

  // Routing rules
  const { data: routingRules } = qr.mode === 'dynamic'
    ? await admin.from('routing_rules').select('*').eq('qr_id', id).order('priority', { ascending: false })
    : { data: null }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">← Retour</Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#041B4D]">{qr.name}</h1>
            <p className="text-sm text-gray-500">{TYPE_LABELS[qr.type] || qr.type} · {qr.mode === 'dynamic' ? 'Dynamique' : 'Statique'}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${qr.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {qr.status === 'active' ? 'Actif' : qr.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Scans total', value: qr.scan_count ?? 0, icon: '📊' },
            { label: '30 derniers jours', value: totalScans, icon: '📅' },
            { label: 'Mobile', value: devices.mobile || 0, icon: '📱' },
            { label: 'Desktop', value: devices.desktop || 0, icon: '💻' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-2xl font-bold text-[#041B4D]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="text-sm font-bold text-[#041B4D] mb-1">Scans — 14 derniers jours</h2>
          <BarChart data={chartData} />
        </div>

        {/* Countries + Device */}
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#041B4D] mb-3">Appareils</h2>
            {[{ k: 'mobile', label: '📱 Mobile' }, { k: 'desktop', label: '💻 Desktop' }, { k: 'tablet', label: '📟 Tablette' }].map(({ k, label }) => {
              const count = devices[k] || 0
              const pct = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0
              return (
                <div key={k} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{label}</span>
                    <span className="font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(to right, #FF6A00, #ffaa55)' }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#041B4D] mb-3">Pays (top 5)</h2>
            {topCountries.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Données insuffisantes</p>
            ) : topCountries.map(([country, count]) => {
              const pct = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0
              return (
                <div key={country} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>🌍 {country}</span>
                    <span className="font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#041B4D]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Destination history — dynamic QRs only */}
        {destinations && destinations.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <h2 className="text-sm font-bold text-[#041B4D] mb-3">Historique des destinations</h2>
            <div className="space-y-2">
              {destinations.map((d, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-semibold shrink-0 ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {d.is_active ? '● Actuel' : 'Ancien'}
                  </span>
                  <span className="flex-1 truncate font-mono text-gray-700">{d.destination}</span>
                  <span className="text-gray-400 shrink-0">{new Date(d.set_at).toLocaleDateString('fr-FR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Routing — dynamic QRs only */}
        {qr.mode === 'dynamic' && (
          <RoutingRulesManager qrId={id} initialRules={routingRules || []} />
        )}
      </div>
    </main>
  )
}
