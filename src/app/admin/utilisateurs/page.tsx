import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export const instant = false

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8', essential: '#10b981', pro: '#3b82f6',
  business: '#7c3aed', agency: '#f59e0b', enterprise: '#ec4899',
}

export default async function AdminUsers({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const plan = sp.plan
  const search = sp.q ?? ''
  const page = Number(sp.page ?? 1)
  const perPage = 25

  const admin = createAdminClient()

  let query = admin
    .from('profiles')
    .select('id, full_name, plan, credits, created_at, referral_code', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1)

  if (plan) query = query.eq('plan', plan)
  if (search) query = query.ilike('full_name', `%${search}%`)

  const { data: users, count } = await query
  const totalPages = Math.ceil((count ?? 0) / perPage)

  const { data: authList } = await admin.auth.admin.listUsers({ page, perPage })
  const emailMap: Record<string, string> = {}
  for (const u of authList?.users ?? []) emailMap[u.id] = u.email ?? ''

  const { data: planStats } = await admin.from('profiles').select('plan')
  const planCounts = (planStats ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.plan] = (acc[p.plan] || 0) + 1; return acc
  }, {})

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count?.toLocaleString('fr-FR')} inscrits au total</p>
        </div>
      </div>

      {/* Plan stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {['free', 'essential', 'pro', 'business', 'agency', 'enterprise'].map((p) => (
          <Link key={p} href={`/admin/utilisateurs?plan=${p}`}
            className={`bg-white rounded-xl border p-3 text-center transition-all hover:shadow-sm ${plan === p ? 'border-orange-400 bg-orange-50' : 'border-gray-100'}`}>
            <p className="text-lg font-extrabold" style={{ color: PLAN_COLORS[p] }}>{(planCounts[p] ?? 0).toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 font-semibold capitalize mt-0.5">{p}</p>
          </Link>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form method="get" action="/admin/utilisateurs" className="flex-1 min-w-[200px]">
          {plan && <input type="hidden" name="plan" value={plan} />}
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Rechercher par nom…"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400/40"
          />
        </form>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/utilisateurs"
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${!plan ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Tous
          </Link>
          {['free', 'essential', 'pro', 'business', 'agency', 'enterprise'].map((p) => (
            <Link key={p} href={`/admin/utilisateurs?plan=${p}${search ? `&q=${search}` : ''}`}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all capitalize ${plan === p ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Crédits</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Inscrit</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u, i) => (
              <tr key={u.id} className={`border-b border-gray-50 hover:bg-orange-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${PLAN_COLORS[u.plan] ?? '#94a3b8'}, #FF6A00)` }}>
                      {u.full_name?.[0]?.toUpperCase() ?? emailMap[u.id]?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <p className="font-semibold text-gray-900 text-xs">{u.full_name ?? '—'}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{emailMap[u.id] ?? u.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                    style={{ background: (PLAN_COLORS[u.plan] ?? '#94a3b8') + '20', color: PLAN_COLORS[u.plan] ?? '#94a3b8' }}>
                    {u.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold text-orange-500">{(u.credits ?? 0).toLocaleString('fr-FR')}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/utilisateurs/${u.id}`}
                    className="text-xs text-orange-500 hover:text-orange-700 transition-colors font-semibold">
                    Gérer →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link key={p}
              href={`/admin/utilisateurs?page=${p}${plan ? `&plan=${plan}` : ''}`}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${
                p === page ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
