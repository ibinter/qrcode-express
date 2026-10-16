import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function AdminParrainage() {
  const admin = createAdminClient()

  const { data: rewards } = await admin
    .from('referral_rewards')
    .select('id, referrer_id, referred_id, credits_given, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const userIds = [...new Set([
    ...(rewards ?? []).map(r => r.referrer_id),
    ...(rewards ?? []).map(r => r.referred_id),
  ].filter(Boolean))]

  const nameMap: Record<string, string> = {}
  if (userIds.length) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name').in('id', userIds)
    for (const p of profiles ?? []) nameMap[p.id] = p.full_name ?? p.id.slice(0, 8)
  }

  const referrerCounts: Record<string, { count: number; credits: number }> = {}
  for (const r of rewards ?? []) {
    if (!referrerCounts[r.referrer_id]) referrerCounts[r.referrer_id] = { count: 0, credits: 0 }
    referrerCounts[r.referrer_id].count += 1
    referrerCounts[r.referrer_id].credits += Number(r.credits_given || 0)
  }
  const topReferrers = Object.entries(referrerCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 10)

  const totalCreditsGiven = rewards?.reduce((s, r) => s + Number(r.credits_given || 0), 0) ?? 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Programme de parrainage</h1>
        <p className="text-sm text-gray-500 mt-0.5">Statistiques et historique des parrainages</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-orange-500">{(rewards?.length ?? 0).toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Total parrainages</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-blue-500">{Object.keys(referrerCounts).length}</p>
          <p className="text-xs text-gray-500 mt-1">Parrains actifs</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-green-500">{totalCreditsGiven.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Crédits distribués</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Top parrains</h2>
          <div className="space-y-3">
            {topReferrers.map(([uid, data], i) => (
              <div key={uid} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                <span className="text-xs font-bold text-gray-400 w-5 text-center">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-500 flex-shrink-0">
                  {nameMap[uid]?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <a href={`/admin/utilisateurs/${uid}`} className="text-xs font-semibold text-gray-900 hover:text-orange-500 truncate block transition-colors">
                    {nameMap[uid] ?? uid.slice(0, 8)}
                  </a>
                  <p className="text-[10px] text-gray-400">{data.credits.toLocaleString()} crédits distribués</p>
                </div>
                <span className="text-xs font-extrabold text-orange-500 whitespace-nowrap">
                  {data.count} filleul{data.count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
            {!topReferrers.length && <p className="text-xs text-gray-400 text-center py-6">Aucun parrainage</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Derniers parrainages</h2>
          <div className="space-y-3">
            {(rewards ?? []).slice(0, 12).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <a href={`/admin/utilisateurs/${r.referrer_id}`} className="text-xs font-semibold text-gray-900 hover:text-orange-500">
                      {nameMap[r.referrer_id] ?? r.referrer_id?.slice(0, 8)}
                    </a>
                    <span className="text-[10px] text-gray-400">→</span>
                    <a href={`/admin/utilisateurs/${r.referred_id}`} className="text-xs font-semibold text-blue-500 hover:underline">
                      {nameMap[r.referred_id] ?? r.referred_id?.slice(0, 8)}
                    </a>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600">+{r.credits_given} cr.</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    r.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>{r.status}</span>
                </div>
              </div>
            ))}
            {!rewards?.length && <p className="text-xs text-gray-400 text-center py-6">Aucun parrainage</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
