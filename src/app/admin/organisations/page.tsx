import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function AdminOrganisations() {
  const admin = createAdminClient()

  const { data: orgs, count } = await admin
    .from('organizations')
    .select('id, name, slug, created_at, owner_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50)

  const ownerIds = [...new Set((orgs ?? []).map(o => o.owner_id).filter(Boolean))]
  const nameMap: Record<string, string> = {}
  if (ownerIds.length) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name').in('id', ownerIds)
    for (const p of profiles ?? []) nameMap[p.id] = p.full_name ?? p.id.slice(0, 8)
  }

  // Members count per org
  const orgIds = (orgs ?? []).map(o => o.id)
  const memberCounts: Record<string, number> = {}
  if (orgIds.length) {
    const { data: members } = await admin.from('org_members').select('org_id').in('org_id', orgIds)
    for (const m of members ?? []) memberCounts[m.org_id] = (memberCounts[m.org_id] || 0) + 1
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Organisations</h1>
        <p className="text-sm text-gray-500 mt-0.5">{count?.toLocaleString('fr-FR')} organisations créées</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-blue-500">{count?.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Total organisations</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-green-500">
            {Object.values(memberCounts).reduce((a, b) => a + b, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Membres total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-orange-500">
            {orgs?.length ? (Object.values(memberCounts).reduce((a, b) => a + b, 0) / orgs.length).toFixed(1) : '0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Membres / org (moy.)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Organisation</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Propriétaire</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Membres</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Créée</th>
            </tr>
          </thead>
          <tbody>
            {(orgs ?? []).map((org, i) => (
              <tr key={org.id} className={`border-b border-gray-50 hover:bg-orange-50/20 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-500">
                      {org.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{org.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{org.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a href={`/admin/utilisateurs/${org.owner_id}`} className="text-xs text-orange-500 hover:underline">
                    {nameMap[org.owner_id] ?? '—'}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold text-blue-500">{memberCounts[org.id] ?? 0}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(org.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
            {!orgs?.length && (
              <tr><td colSpan={4} className="text-center py-10 text-sm text-gray-400">Aucune organisation</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
