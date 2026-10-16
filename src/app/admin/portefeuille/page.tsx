import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function AdminPortefeuille() {
  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, credits, plan')
    .order('credits', { ascending: false })
    .limit(50)

  const { data: recharges } = await admin
    .from('transactions')
    .select('id, user_id, amount, description, status, created_at')
    .ilike('description', '%crédit%')
    .order('created_at', { ascending: false })
    .limit(20)

  const userIds = [...new Set((recharges ?? []).map(t => t.user_id).filter(Boolean))]
  const nameMap: Record<string, string> = {}
  if (userIds.length) {
    const { data: nameProfiles } = await admin.from('profiles').select('id, full_name').in('id', userIds)
    for (const p of nameProfiles ?? []) nameMap[p.id] = p.full_name ?? p.id.slice(0, 8)
  }

  const totalCredits = profiles?.reduce((s, p) => s + (p.credits || 0), 0) ?? 0
  const avgCredits = profiles?.length ? Math.round(totalCredits / profiles.length) : 0
  const richUsers = profiles?.filter(p => (p.credits || 0) > 100).length ?? 0

  const PLAN_COLORS: Record<string, string> = {
    free: '#94a3b8', essential: '#10b981', pro: '#3b82f6', business: '#7c3aed', agency: '#f59e0b', enterprise: '#ec4899',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Portefeuille & Crédits</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestion des crédits utilisateurs</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-orange-500">{totalCredits.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Crédits en circulation</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-blue-500">{avgCredits.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Crédits moy. / utilisateur</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-green-500">{richUsers}</p>
          <p className="text-xs text-gray-500 mt-1">Utilisateurs avec +100 crédits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Top utilisateurs par crédits</h2>
          <div className="space-y-2.5">
            {(profiles ?? []).slice(0, 15).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${PLAN_COLORS[p.plan] ?? '#94a3b8'}, #FF6A00)` }}>
                  {p.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <a href={`/admin/utilisateurs/${p.id}`} className="text-xs font-semibold text-gray-900 hover:text-orange-500 transition-colors truncate block">
                    {p.full_name ?? p.id.slice(0, 8)}
                  </a>
                </div>
                <span className="text-xs font-extrabold text-orange-500">{(p.credits || 0).toLocaleString('fr-FR')} cr.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Dernières recharges de crédits</h2>
          <div className="space-y-3">
            {(recharges ?? []).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <a href={`/admin/utilisateurs/${tx.user_id}`} className="text-xs font-semibold text-orange-500 hover:underline">
                    {nameMap[tx.user_id] ?? tx.user_id?.slice(0, 8)}
                  </a>
                  <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600">+{Number(tx.amount).toLocaleString('fr-FR')} F</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    tx.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>{tx.status}</span>
                </div>
              </div>
            ))}
            {!recharges?.length && <p className="text-xs text-gray-400 text-center py-6">Aucune recharge</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
