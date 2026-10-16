'use client'
import { useEffect, useState } from 'react'

interface DailyPoint { date: string; count: number }
interface Country { code: string; count: number }
interface Device { type: string; count: number }
interface AnalyticsData { daily: DailyPoint[]; countries: Country[]; devices: Device[] }

const COUNTRY_FLAGS: Record<string, string> = {
  FR:'🇫🇷', CI:'🇨🇮', SN:'🇸🇳', CM:'🇨🇲', MA:'🇲🇦', DZ:'🇩🇿', TN:'🇹🇳',
  NG:'🇳🇬', GH:'🇬🇭', BJ:'🇧🇯', TG:'🇹🇬', BF:'🇧🇫', ML:'🇲🇱', GN:'🇬🇳',
  US:'🇺🇸', GB:'🇬🇧', DE:'🇩🇪', BE:'🇧🇪', CH:'🇨🇭', CA:'🇨🇦', BR:'🇧🇷',
}
const COUNTRY_NAMES: Record<string, string> = {
  FR:'France', CI:'Côte d\'Ivoire', SN:'Sénégal', CM:'Cameroun', MA:'Maroc', DZ:'Algérie', TN:'Tunisie',
  NG:'Nigeria', GH:'Ghana', BJ:'Bénin', TG:'Togo', BF:'Burkina Faso', ML:'Mali', GN:'Guinée',
  US:'États-Unis', GB:'Royaume-Uni', DE:'Allemagne', BE:'Belgique', CH:'Suisse', CA:'Canada', BR:'Brésil',
}

export default function AnalyticsWidget() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
        <div className="h-24 bg-gray-50 rounded" />
      </div>
    )
  }

  if (!data || !data.daily.length) return null

  const totalScans = data.daily.reduce((s, d) => s + d.count, 0)
  if (totalScans === 0) return null

  const max = Math.max(...data.daily.map((d) => d.count), 1)
  const formatDay = (date: string) => {
    const d = new Date(date + 'T00:00:00')
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#041B4D]">Analytics — 14 derniers jours</h2>
          <p className="text-xs text-gray-400 mt-0.5">{totalScans.toLocaleString('fr-FR')} scans au total</p>
        </div>
        <span className="text-xl">📊</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-[3px] h-20 mb-1">
        {data.daily.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#041B4D] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none"
            >
              {d.count} scan{d.count > 1 ? 's' : ''}
            </div>
            <div
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 2)}%`,
                background: d.count > 0 ? 'linear-gradient(to top, #FF6A00, #ffaa55)' : '#e5e7eb',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between px-0.5">
        <span className="text-[9px] text-gray-400">{formatDay(data.daily[0].date)}</span>
        <span className="text-[9px] text-gray-400">{formatDay(data.daily[data.daily.length - 1].date)}</span>
      </div>

      {/* Countries + devices */}
      {(data.countries.length > 0 || data.devices.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
          {data.countries.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Pays</p>
              <div className="space-y-1.5">
                {data.countries.slice(0, 4).map((c) => {
                  const pct = Math.round((c.count / totalScans) * 100)
                  return (
                    <div key={c.code} className="flex items-center gap-2">
                      <span className="text-sm">{COUNTRY_FLAGS[c.code] ?? '🌍'}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[10px] text-gray-600">{COUNTRY_NAMES[c.code] ?? c.code}</span>
                          <span className="text-[10px] text-gray-400">{pct}%</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#FF6A00]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {data.devices.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Appareils</p>
              <div className="space-y-1.5">
                {data.devices.slice(0, 4).map((d) => {
                  const pct = Math.round((d.count / totalScans) * 100)
                  const icon = d.type === 'mobile' ? '📱' : d.type === 'tablet' ? '📟' : d.type === 'desktop' ? '💻' : '❓'
                  const label = d.type === 'mobile' ? 'Mobile' : d.type === 'tablet' ? 'Tablette' : d.type === 'desktop' ? 'Bureau' : d.type
                  return (
                    <div key={d.type} className="flex items-center gap-2">
                      <span className="text-sm">{icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[10px] text-gray-600">{label}</span>
                          <span className="text-[10px] text-gray-400">{pct}%</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#041B4D]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
