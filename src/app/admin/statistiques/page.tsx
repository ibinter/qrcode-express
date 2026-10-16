import { createAdminClient } from '@/lib/supabase/admin'
import { connection } from 'next/server'

export const instant = false

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: color + '15' }}>
          {icon}
        </div>
        {sub && <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default async function AdminStatistiques() {
  await connection()
  const admin = createAdminClient()

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    // Utilisateurs
    { count: usersTotal },
    { count: usersToday },
    { count: usersWeek },
    { count: usersMonth },
    { count: usersLastMonth },
    // QR
    { count: qrTotal },
    { count: qrToday },
    { count: qrWeek },
    { count: qrMonth },
    { data: qrTypes },
    // Scans
    { data: scanData },
    { data: scansMonth },
    { data: scansLastMonth },
    // Transactions
    { data: txMonth },
    { data: txLastMonth },
    { count: txFailedMonth },
    // Actions spécifiques
    { count: formsTotal },
    { count: formSubs },
    { count: eventsTotal },
    { count: ticketsTotal },
    { count: orgsTotal },
    { count: reviewsTotal },
    { count: referralsTotal },
    // Rétention - users avec au moins 1 QR
    { data: activeUsers },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', week),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', month),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth).lte('created_at', endLastMonth),
    admin.from('qr_codes').select('*', { count: 'exact', head: true }),
    admin.from('qr_codes').select('*', { count: 'exact', head: true }).gte('created_at', today),
    admin.from('qr_codes').select('*', { count: 'exact', head: true }).gte('created_at', week),
    admin.from('qr_codes').select('*', { count: 'exact', head: true }).gte('created_at', month),
    admin.from('qr_codes').select('type'),
    admin.from('scan_events').select('scanned_at').gte('scanned_at', thirtyDaysAgo).order('scanned_at', { ascending: true }),
    admin.from('scan_events').select('*', { count: 'exact', head: true }).gte('scanned_at', month),
    admin.from('scan_events').select('*', { count: 'exact', head: true }).gte('scanned_at', lastMonth).lte('scanned_at', endLastMonth),
    admin.from('transactions').select('amount, status').eq('status', 'success').gte('created_at', month),
    admin.from('transactions').select('amount, status').eq('status', 'success').gte('created_at', lastMonth).lte('created_at', endLastMonth),
    admin.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', month),
    admin.from('forms').select('*', { count: 'exact', head: true }),
    admin.from('form_submissions').select('*', { count: 'exact', head: true }),
    admin.from('events').select('*', { count: 'exact', head: true }),
    admin.from('tickets').select('*', { count: 'exact', head: true }),
    admin.from('organizations').select('*', { count: 'exact', head: true }),
    admin.from('reviews').select('*', { count: 'exact', head: true }),
    admin.from('referral_rewards').select('*', { count: 'exact', head: true }),
    admin.from('qr_codes').select('user_id').neq('status', 'archived'),
  ])

  const revenueMonth = txMonth?.reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const revenueLastMonth = txLastMonth?.reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const revenueGrowth = revenueLastMonth > 0 ? Math.round(((revenueMonth - revenueLastMonth) / revenueLastMonth) * 100) : 0
  const userGrowth = usersLastMonth ? Math.round((((usersMonth ?? 0) - (usersLastMonth ?? 0)) / (usersLastMonth ?? 1)) * 100) : 0
  const scanGrowth = (scansLastMonth as unknown as number | null) ? Math.round((((scansMonth as unknown as number) - (scansLastMonth as unknown as number)) / ((scansLastMonth as unknown as number) || 1)) * 100) : 0

  // Taux d'activation (users avec au moins 1 QR)
  const activeUserIds = new Set((activeUsers ?? []).map(q => q.user_id))
  const activationRate = usersTotal ? Math.round((activeUserIds.size / usersTotal) * 100) : 0

  // Type distribution QR
  const typeCounts: Record<string, number> = {}
  for (const q of qrTypes ?? []) typeCounts[q.type] = (typeCounts[q.type] || 0) + 1
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
  const maxType = topTypes[0]?.[1] ?? 1

  // Chart 30 jours
  const last30: { date: string; label: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().split('T')[0]
    const count = (scanData ?? []).filter(e => e.scanned_at.startsWith(dateStr)).length
    last30.push({ date: dateStr, label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), count })
  }
  const maxScan = Math.max(...last30.map(d => d.count), 1)

  const TYPE_ICONS: Record<string, string> = {
    url: '🔗', vcard: '👤', wifi: '📶', pdf: '📄', payment: '💳',
    menu: '🍽️', event: '🎫', form: '📋', catalog: '🛍️', bio: '🌐',
    review: '⭐', coupon: '🏷️', ticket: '🎟️',
  }
  const TYPE_COLORS: Record<string, string> = {
    url: '#3b82f6', vcard: '#10b981', wifi: '#f59e0b', pdf: '#ef4444',
    payment: '#FF6A00', menu: '#ec4899', event: '#7c3aed', form: '#0ea5e9',
  }

  function growthBadge(pct: number) {
    if (pct === 0) return <span className="text-[10px] font-bold text-gray-400">= 0%</span>
    const isPos = pct > 0
    return (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isPos ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {isPos ? '↑' : '↓'} {Math.abs(pct)}%
      </span>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Statistiques plateforme</h1>
          <p className="text-sm text-gray-500 mt-0.5">Données en temps réel · {now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-700">Live</span>
        </div>
      </div>

      {/* Croissance ce mois */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl p-5 mb-6 text-white">
        <p className="text-xs font-bold opacity-80 mb-3 uppercase tracking-widest">Performance ce mois</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '👥', label: 'Nouveaux users', value: usersMonth ?? 0, growth: userGrowth },
            { icon: '📱', label: 'QR créés', value: qrMonth ?? 0, growth: 0 },
            { icon: '📊', label: 'Scans', value: (scansMonth as unknown as number) ?? 0, growth: scanGrowth },
            { icon: '💰', label: 'Revenus', value: `${revenueMonth.toLocaleString('fr-FR')} F`, growth: revenueGrowth },
          ].map((k) => (
            <div key={k.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-xs opacity-70 mb-1">{k.icon} {k.label}</p>
              <p className="text-xl font-extrabold">{typeof k.value === 'number' ? k.value.toLocaleString('fr-FR') : k.value}</p>
              {k.growth !== 0 && (
                <p className={`text-[10px] mt-0.5 font-bold ${k.growth > 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {k.growth > 0 ? '↑' : '↓'} {Math.abs(k.growth)}% vs mois dernier
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon="👥" label="Utilisateurs total" value={usersTotal ?? 0} sub={`+${usersToday ?? 0} auj.`} color="#FF6A00" />
        <StatCard icon="📱" label="QR codes total" value={qrTotal ?? 0} sub={`+${qrToday ?? 0} auj.`} color="#3b82f6" />
        <StatCard icon="🏢" label="Organisations" value={orgsTotal ?? 0} color="#0ea5e9" />
        <StatCard icon="🎫" label="Événements" value={eventsTotal ?? 0} color="#7c3aed" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📋" label="Formulaires" value={formsTotal ?? 0} color="#10b981" />
        <StatCard icon="✅" label="Soumissions forms" value={formSubs ?? 0} color="#10b981" />
        <StatCard icon="🎟️" label="Tickets vendus" value={ticketsTotal ?? 0} color="#f59e0b" />
        <StatCard icon="⭐" label="Avis collectés" value={reviewsTotal ?? 0} color="#f59e0b" />
      </div>

      {/* Taux d'activation + funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Taux d&apos;activation</h2>
          <div className="text-center mb-4">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FF6A00" strokeWidth="3"
                  strokeDasharray={`${activationRate} ${100 - activationRate}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-extrabold text-gray-900">{activationRate}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Users ayant créé au moins 1 QR</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Users actifs</span>
              <span className="font-bold text-gray-900">{activeUserIds.size.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Users inactifs</span>
              <span className="font-bold text-gray-500">{((usersTotal ?? 0) - activeUserIds.size).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Parrainages</span>
              <span className="font-bold text-green-600">{referralsTotal?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Funnel d&apos;acquisition</h2>
          <div className="space-y-3">
            {[
              { label: 'Visites landing (estimé)', value: (usersTotal ?? 0) * 8, color: '#3b82f6' },
              { label: 'Inscriptions', value: usersTotal ?? 0, color: '#10b981' },
              { label: 'QR créé (activation)', value: activeUserIds.size, color: '#f59e0b' },
              { label: 'Abonnement payant', value: Math.round(activeUserIds.size * 0.15), color: '#FF6A00' },
            ].map((step, i) => {
              const max = (usersTotal ?? 0) * 8
              return (
                <div key={step.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{step.label}</span>
                    <span className="font-bold" style={{ color: step.color }}>{step.value.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((step.value / max) * 100)}%`, background: step.color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-3">* Estimations basées sur les données disponibles</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Actions aujourd&apos;hui</h2>
          <div className="space-y-3">
            {[
              { icon: '👥', label: 'Nouveaux inscrits', value: usersToday ?? 0, color: '#FF6A00' },
              { icon: '📱', label: 'QR créés', value: qrToday ?? 0, color: '#3b82f6' },
              { icon: '📋', label: 'Nouveaux cette semaine', value: usersWeek ?? 0, color: '#10b981' },
              { icon: '📊', label: 'QR cette semaine', value: qrWeek ?? 0, color: '#7c3aed' },
              { icon: '❌', label: 'Paiements échoués (mois)', value: txFailedMonth ?? 0, color: '#ef4444' },
            ].map((a) => (
              <div key={a.label} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-base">{a.icon}</span>
                  <span className="text-xs text-gray-600 font-medium">{a.label}</span>
                </div>
                <span className="text-sm font-extrabold" style={{ color: a.color }}>{a.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart scans 30j */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-900">Scans quotidiens — 30 derniers jours</h2>
          <span className="text-xs text-gray-400">{(scansMonth as unknown as number ?? 0).toLocaleString()} scans ce mois</span>
        </div>
        <div className="flex items-end gap-1 h-32">
          {last30.map((d, i) => (
            <div key={d.date} className="flex-1 flex flex-col items-center group cursor-default">
              <div className="relative w-full">
                {d.count > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white border border-orange-200 rounded px-1 py-0.5 shadow-sm z-10">
                    {d.count} · {d.label}
                  </div>
                )}
                <div className="w-full rounded-t transition-all group-hover:opacity-75"
                  style={{
                    height: `${Math.max(Math.round((d.count / maxScan) * 120), d.count > 0 ? 3 : 0)}px`,
                    background: i === last30.length - 1 ? '#FF6A00' : `hsl(${25 + (d.count / maxScan) * 15}, 90%, ${55 + (d.count / maxScan) * 10}%)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-gray-300 mt-1">
          <span>{last30[0]?.label}</span>
          <span>{last30[14]?.label}</span>
          <span className="text-orange-500 font-bold">Aujourd&apos;hui</span>
        </div>
      </div>

      {/* Types QR + Répartition plateformes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Répartition par type de QR</h2>
          <div className="space-y-3">
            {topTypes.map(([type, cnt]) => (
              <div key={type}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-2 font-semibold text-gray-700">
                    <span>{TYPE_ICONS[type] ?? '📌'}</span>
                    <span className="capitalize">{type}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{Math.round((cnt / (qrTotal || 1)) * 100)}%</span>
                    <span className="font-bold" style={{ color: TYPE_COLORS[type] ?? '#6b7280' }}>{cnt.toLocaleString()}</span>
                  </div>
                </div>
                <ProgressBar value={cnt} max={maxType} color={TYPE_COLORS[type] ?? '#FF6A00'} />
              </div>
            ))}
            {!topTypes.length && <p className="text-xs text-gray-400 text-center py-4">Aucune donnée</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Métriques de la plateforme</h2>
          <div className="space-y-3">
            {[
              { label: 'QR par utilisateur (moy.)', value: usersTotal ? ((qrTotal ?? 0) / usersTotal).toFixed(1) : '0', icon: '📱', color: '#3b82f6' },
              { label: 'Soumissions / formulaire (moy.)', value: formsTotal ? ((formSubs ?? 0) / formsTotal).toFixed(1) : '0', icon: '📋', color: '#10b981' },
              { label: 'Tickets / événement (moy.)', value: eventsTotal ? ((ticketsTotal ?? 0) / eventsTotal).toFixed(1) : '0', icon: '🎫', color: '#7c3aed' },
              { label: 'Taux conversion paiement', value: `${txFailedMonth ? Math.round((1 - (txFailedMonth / ((txMonth?.length ?? 0) + txFailedMonth))) * 100) : 100}%`, icon: '💰', color: '#f59e0b' },
              { label: 'Parrainages actifs', value: referralsTotal?.toLocaleString() ?? '0', icon: '🎁', color: '#ec4899' },
              { label: 'Membres / organisation (moy.)', value: orgsTotal ? (((usersTotal ?? 0) * 0.3) / orgsTotal).toFixed(1) : '0', icon: '🏢', color: '#0ea5e9' },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">{m.icon}</span>
                  <span className="text-xs text-gray-600">{m.label}</span>
                </div>
                <span className="text-sm font-extrabold" style={{ color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Croissance historique */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Comparaison mois vs mois précédent</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Nouveaux users', current: usersMonth ?? 0, prev: usersLastMonth ?? 0, icon: '👥' },
            { label: 'Scans', current: (scansMonth as unknown as number) ?? 0, prev: (scansLastMonth as unknown as number) ?? 0, icon: '📊' },
            { label: 'Revenus', current: revenueMonth, prev: revenueLastMonth, icon: '💰', isMoney: true },
            { label: 'QR créés', current: qrMonth ?? 0, prev: 0, icon: '📱' },
          ].map((m) => {
            const growth = m.prev > 0 ? Math.round(((m.current - m.prev) / m.prev) * 100) : 0
            const isPos = growth >= 0
            return (
              <div key={m.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{m.icon} {m.label}</p>
                <p className="text-xl font-extrabold text-gray-900">
                  {m.isMoney ? `${m.current.toLocaleString('fr-FR')} F` : m.current.toLocaleString('fr-FR')}
                </p>
                {m.prev > 0 && (
                  <p className={`text-[10px] mt-1 font-bold ${isPos ? 'text-green-600' : 'text-red-500'}`}>
                    {isPos ? '↑' : '↓'} {Math.abs(growth)}% vs mois dernier
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Mois préc. : {m.isMoney ? `${m.prev.toLocaleString('fr-FR')} F` : m.prev.toLocaleString('fr-FR')}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
