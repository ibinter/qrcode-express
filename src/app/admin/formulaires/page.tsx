import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function AdminFormulaires() {
  const admin = createAdminClient()

  const { data: forms, count } = await admin
    .from('forms')
    .select('id, title, user_id, created_at, is_active', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50)

  const { count: totalSubmissions } = await admin
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })

  const userIds = [...new Set((forms ?? []).map(f => f.user_id).filter(Boolean))]
  const nameMap: Record<string, string> = {}
  if (userIds.length) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name').in('id', userIds)
    for (const p of profiles ?? []) nameMap[p.id] = p.full_name ?? p.id.slice(0, 8)
  }

  const formIds = (forms ?? []).map(f => f.id)
  const subCounts: Record<string, number> = {}
  if (formIds.length) {
    const { data: subs } = await admin.from('form_submissions').select('form_id').in('form_id', formIds)
    for (const s of subs ?? []) subCounts[s.form_id] = (subCounts[s.form_id] || 0) + 1
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Formulaires</h1>
        <p className="text-sm text-gray-500 mt-0.5">{count?.toLocaleString('fr-FR')} formulaires créés</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-green-500">{count?.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Formulaires total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-blue-500">{totalSubmissions?.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Soumissions totales</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-orange-500">
            {count ? ((totalSubmissions ?? 0) / count).toFixed(1) : '0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Soumissions / form (moy.)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Formulaire</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Créateur</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Soumissions</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Créé</th>
            </tr>
          </thead>
          <tbody>
            {(forms ?? []).map((form, i) => (
              <tr key={form.id} className={`border-b border-gray-50 hover:bg-orange-50/20 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-sm">📋</div>
                    <p className="text-xs font-bold text-gray-900 truncate max-w-[160px]">{form.title || 'Sans titre'}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a href={`/admin/utilisateurs/${form.user_id}`} className="text-xs text-orange-500 hover:underline">
                    {nameMap[form.user_id] ?? '—'}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold text-blue-500">{subCounts[form.id] ?? 0}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    form.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {form.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(form.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
            {!forms?.length && (
              <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">Aucun formulaire</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
