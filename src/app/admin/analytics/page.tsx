import { createAdminClient } from '@/lib/supabase/admin'
import { connection } from 'next/server'

export const instant = false

const COUNTRY_NAMES: Record<string, string> = {
  CI: 'Côte d\'Ivoire', SN: 'Sénégal', CM: 'Cameroun', ML: 'Mali', BF: 'Burkina Faso',
  GH: 'Ghana', TG: 'Togo', BJ: 'Bénin', NG: 'Nigeria', FR: 'France',
  US: 'États-Unis', GB: 'Royaume-Uni', CA: 'Canada', DE: 'Allemagne',
  MA: 'Maroc', DZ: 'Algérie', TN: 'Tunisie', CD: 'Congo RDC', GA: 'Gabon',
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default async function AdminAnalytics() {
  await connection()
  const admin = createAdminClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: scanEvents },
    { data: dailyScans },
    { count: totalQr },
    { count: totalUsers },
  ] = await Promise.all([
    admin.from('scan_events').select('country, device_type, os, browser, qr_type').gte('scanned_at', thirtyDaysAgo),
    admin.from('scan_events').select('scanned_at').gte('scanned_at', thirtyDaysAgo).order('scanned_at', { ascending: true }),
    admin.from('qr_codes').select('*', { count: 'exact', head: true }).neq('status', 'archived'),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const totalScans = scanEvents?.length ?? 0

  const countryCounts: Record<string, number> = {}
  const deviceCounts: Record<string, number> = {}
  const osCounts: Record<string, number> = {}
  const browserCounts: Record<string, number> = {}
  const qrTypeCounts: Record<string, number> = {}

  for (const e of scanEvents ?? []) {
    const c = e.country ?? 'Inconnu'; countryCounts[c] = (countryCounts[c] || 0) + 1
    const d = e.device_type ?? 'Inconnu'; deviceCounts[d] = (deviceCounts[d] || 0) + 1
    const o = e.os ?? 'Inconnu'; osCounts[o] = (osCounts[o] || 0) + 1
    const b = e.browser ?? 'Inconnu'; browserCounts[b] = (browserCounts[b] || 0) + 1
    const t = e.qr_type ?? 'url'; qrTypeCounts[t] = (qrTypeCounts[t] || 0) + 1
  }

  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const last14: { date: string; label: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().split('T')[0]
    const count = (dailyScans ?? []).filter(e => e.scanned_at.startsWith(dateStr)).length
    last14.push({ date: dateStr, label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), count })
  }
  const maxDaily = Math.max(...last14.map(d => d.count), 1)

  const DEVICE_COLORS: Record<string, string> = {
    mobile: '#3b82f6', desktop: '#10b981', tablet: '#f59e0b', other: '#94a3b8',
  }
  const TYPE_ICONS: Record<string, string> = {
    url: '🔗', vcard: '👤', wifi: '📶', pdf: '📄', payment: '💳', menu: '🍽️', event: '🎫', form: '📋',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Analytics globaux</h1>
        <p className="text-sm text-gray-500 mt-0.5">Données des 30 derniers jours — {totalScans.toLocaleString('fr-FR')} scans</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '📊', label: 'Scans (30j)', value: totalScans.toLocaleString('fr-FR'), color: '#FF6A00' },
          { icon: '📱', label: 'QR codes actifs', value: (totalQr ?? 0).toLocaleString('fr-FR'), color: '#3b82f6' },
          { icon: '👥', label: 'Utilisateurs', value: (totalUsers ?? 0).toLocaleString('fr-FR'), color: '#10b981' },
          { icon: '📈', label: 'Scans / QR moyen', value: totalQr ? Math.round(totalScans / totalQr).toLocaleString() : '0', color: '#7c3aed' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: k.color + '15' }}>{k.icon}</div>
            <p className="text-2xl font-extrabold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="text-sm font-bold text-gray-900 mb-5">Scans quotidiens — 14 derniers jours</h2>
        <div className="flex items-end gap-1.5 h-36">
          {last14.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full">
                {d.count > 0 && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {d.count}
                  </div>
                )}
                <div className="w-full rounded-t cursor-default transition-all group-hover:opacity-80"
                  style={{
                    height: `${Math.max(Math.round((d.count / maxDaily) * 128), d.count > 0 ? 4 : 0)}px`,
                    background: 'linear-gradient(to top, #FF6A00, #f97316)',
                  }}
                />
              </div>
              <span className="text-[9px] text-gray-400 whitespace-nowrap">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Countries */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Top pays</h2>
          <div className="space-y-3">
            {topCountries.map(([code, cnt]) => (
              <div key={code}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-700">{COUNTRY_NAMES[code] ?? code}</span>
                  <span className="text-gray-400">{cnt.toLocaleString('fr-FR')} ({Math.round(cnt / totalScans * 100)}%)</span>
                </div>
                <ProgressBar value={cnt} max={topCountries[0]?.[1] ?? 1} color="#FF6A00" />
              </div>
            ))}
            {!topCountries.length && <p className="text-xs text-gray-400 text-center py-6">Aucune donnée disponible</p>}
          </div>
        </div>

        {/* Devices + OS */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Appareils</h2>
            <div className="space-y-3">
              {Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]).map(([device, cnt]) => (
                <div key={device}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-700 capitalize">{device}</span>
                    <span className="text-gray-400">{cnt.toLocaleString()} ({Math.round(cnt / totalScans * 100)}%)</span>
                  </div>
                  <ProgressBar value={cnt} max={Math.max(...Object.values(deviceCounts))} color={DEVICE_COLORS[device] ?? '#94a3b8'} />
                </div>
              ))}
              {!Object.keys(deviceCounts).length && <p className="text-xs text-gray-400 text-center py-4">Aucune donnée</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Types de QR scannés</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(qrTypeCounts).sort((a, b) => b[1] - a[1]).map(([type, cnt]) => (
                <div key={type} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
                  <span className="text-base">{TYPE_ICONS[type] ?? '📌'}</span>
                  <div>
                    <p className="text-[10px] font-bold text-gray-700 capitalize">{type}</p>
                    <p className="text-[10px] text-gray-400">{cnt.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {!Object.keys(qrTypeCounts).length && <p className="col-span-2 text-xs text-gray-400 text-center py-4">Aucune donnée</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Browsers + OS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Navigateurs</h2>
          <div className="space-y-3">
            {Object.entries(browserCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([b, cnt]) => (
              <div key={b}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-700">{b}</span>
                  <span className="text-gray-400">{cnt.toLocaleString()}</span>
                </div>
                <ProgressBar value={cnt} max={Math.max(...Object.values(browserCounts))} color="#3b82f6" />
              </div>
            ))}
            {!Object.keys(browserCounts).length && <p className="text-xs text-gray-400 text-center py-4">Aucune donnée</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Systèmes d&apos;exploitation</h2>
          <div className="space-y-3">
            {Object.entries(osCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([os, cnt]) => (
              <div key={os}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-700">{os}</span>
                  <span className="text-gray-400">{cnt.toLocaleString()}</span>
                </div>
                <ProgressBar value={cnt} max={Math.max(...Object.values(osCounts))} color="#7c3aed" />
              </div>
            ))}
            {!Object.keys(osCounts).length && <p className="text-xs text-gray-400 text-center py-4">Aucune donnée</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
