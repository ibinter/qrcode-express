import { createAdminClient } from '@/lib/supabase/admin'
import { connection } from 'next/server'
import Link from 'next/link'

export const instant = false

function KPI({ icon, label, value, sub, color, href }: {
  icon: string; label: string; value: string | number; sub?: string; color: string; href?: string
}) {
  const inner = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: color + '15' }}>
          {icon}
        </div>
        {sub && <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default async function AdminOverview() {
  await connection()
  const admin = createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: totalQr },
    { data: scanData },
    { data: revenueData },
    { data: monthRevenue },
    { count: newUsersToday },
    { count: newUsersWeek },
    { data: planDist },
    { data: recentUsers },
    { data: recentTx },
    { count: activeSubscriptions },
    { count: totalOrgs },
    { count: totalForms },
    { count: totalEvents },
    { count: formSubmissionsCount },
    { count: totalTickets },
    { count: totalReviews },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('qr_codes').select('*', { count: 'exact', head: true }).neq('status', 'archived'),
    admin.from('qr_codes').select('scan_count'),
    admin.from('transactions').select('amount').eq('status', 'success'),
    admin.from('transactions').select('amount').eq('status', 'success').gte('created_at', startOfMonth),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfToday),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek),
    admin.from('profiles').select('plan'),
    admin.from('profiles').select('id, full_name, plan, credits, created_at').order('created_at', { ascending: false }).limit(6),
    admin.from('transactions').select('id, amount, status, description, created_at, user_id').eq('status', 'success').order('created_at', { ascending: false }).limit(5),
    admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('organizations').select('*', { count: 'exact', head: true }),
    admin.from('forms').select('*', { count: 'exact', head: true }),
    admin.from('events').select('*', { count: 'exact', head: true }),
    admin.from('form_submissions').select('*', { count: 'exact', head: true }),
    admin.from('tickets').select('*', { count: 'exact', head: true }),
    admin.from('reviews').select('*', { count: 'exact', head: true }),
  ])

  const totalScans = scanData?.reduce((s, q) => s + (q.scan_count || 0), 0) ?? 0
  const totalRevenue = revenueData?.reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const monthRevenueTotal = monthRevenue?.reduce((s, t) => s + Number(t.amount), 0) ?? 0

  const planCounts = (planDist ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.plan] = (acc[p.plan] || 0) + 1
    return acc
  }, {})

  const PLAN_COLORS: Record<string, string> = {
    free: '#94a3b8', essential: '#10b981', pro: '#3b82f6', business: '#7c3aed', agency: '#f59e0b', enterprise: '#ec4899',
  }

  const qrByType = (scanData as unknown as { type?: string }[] | null)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Vue d&apos;ensemble</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-600">Plateforme opérationnelle</span>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPI icon="👥" label="Utilisateurs" value={totalUsers ?? 0}
          sub={`+${newUsersToday ?? 0} aujourd'hui`} color="#FF6A00" href="/admin/utilisateurs" />
        <KPI icon="📱" label="QR codes actifs" value={totalQr ?? 0}
          sub="hors archives" color="#3b82f6" href="/admin/qr" />
        <KPI icon="📊" label="Scans total" value={totalScans}
          sub="tous QR" color="#10b981" href="/admin/analytics" />
        <KPI icon="💰" label="Revenus total" value={`${totalRevenue.toLocaleString('fr-FR')} F`}
          sub={`${monthRevenueTotal.toLocaleString('fr-FR')} ce mois`} color="#f59e0b" href="/admin/transactions" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPI icon="🆕" label="Nouveaux (7j)" value={newUsersWeek ?? 0} sub="cette semaine" color="#8b5cf6" />
        <KPI icon="📋" label="Abonnements actifs" value={activeSubscriptions ?? 0} color="#ec4899" href="/admin/transactions" />
        <KPI icon="🏢" label="Organisations" value={totalOrgs ?? 0} color="#0ea5e9" href="/admin/organisations" />
        <KPI icon="🎫" label="Événements" value={totalEvents ?? 0} color="#f59e0b" href="/admin/evenements" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <KPI icon="📋" label="Formulaires" value={totalForms ?? 0} color="#10b981" href="/admin/formulaires" />
        <KPI icon="✅" label="Soumissions forms" value={formSubmissionsCount ?? 0} color="#3b82f6" />
        <KPI icon="🎟️" label="Tickets vendus" value={totalTickets ?? 0} color="#7c3aed" href="/admin/evenements" />
        <KPI icon="⭐" label="Avis clients" value={totalReviews ?? 0} color="#f59e0b" href="/admin/avis" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Plan distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Répartition des plans</h2>
            <Link href="/admin/utilisateurs" className="text-xs text-orange-500 hover:underline font-semibold">Détail →</Link>
          </div>
          <div className="space-y-3">
            {Object.entries(planCounts).sort((a, b) => b[1] - a[1]).map(([plan, count]) => {
              const pct = totalUsers ? Math.round((count / totalUsers) * 100) : 0
              return (
                <div key={plan}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold capitalize text-gray-700">{plan}</span>
                    <span className="text-gray-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: PLAN_COLORS[plan] ?? '#FF6A00' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Derniers inscrits */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Derniers inscrits</h2>
            <Link href="/admin/utilisateurs" className="text-xs text-orange-500 hover:underline font-semibold">Voir tout →</Link>
          </div>
          <div className="space-y-2.5">
            {(recentUsers ?? []).map((u) => (
              <Link key={u.id} href={`/admin/utilisateurs/${u.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${PLAN_COLORS[u.plan] ?? '#FF6A00'}, #FF6A00)` }}>
                  {u.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-orange-500 transition-colors">
                    {u.full_name ?? 'Sans nom'}
                  </p>
                  <p className="text-[10px] text-gray-400">{new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize"
                  style={{ background: (PLAN_COLORS[u.plan] ?? '#94a3b8') + '20', color: PLAN_COLORS[u.plan] ?? '#94a3b8' }}>
                  {u.plan}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Dernières transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Dernières transactions</h2>
            <Link href="/admin/transactions" className="text-xs text-orange-500 hover:underline font-semibold">Voir tout →</Link>
          </div>
          <div className="space-y-3">
            {(recentTx ?? []).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-sm flex-shrink-0">💰</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{tx.description || 'Paiement'}</p>
                  <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <p className="text-xs font-bold text-green-600 whitespace-nowrap">+{Number(tx.amount).toLocaleString('fr-FR')} F</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accès rapides */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Accès rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { href: '/admin/utilisateurs', icon: '👥', label: 'Utilisateurs' },
            { href: '/admin/transactions', icon: '💰', label: 'Revenus' },
            { href: '/admin/qr', icon: '📱', label: 'QR Codes' },
            { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
            { href: '/admin/organisations', icon: '🏢', label: 'Orgs' },
            { href: '/admin/formulaires', icon: '📋', label: 'Formulaires' },
            { href: '/admin/evenements', icon: '🎫', label: 'Événements' },
            { href: '/admin/avis', icon: '⭐', label: 'Avis' },
            { href: '/admin/portefeuille', icon: '💼', label: 'Portefeuille' },
            { href: '/admin/parrainage', icon: '🎁', label: 'Parrainage' },
            { href: '/admin/ia', icon: '🤖', label: 'IA & Design' },
            { href: '/admin/webhooks', icon: '🔔', label: 'Webhooks' },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group text-center">
              <span className="text-xl">{l.icon}</span>
              <span className="text-[10px] font-semibold text-gray-600 group-hover:text-orange-600 transition-colors">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
