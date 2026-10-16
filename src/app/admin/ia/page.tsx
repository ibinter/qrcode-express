import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function AdminIA() {
  const admin = createAdminClient()

  // QR codes generated with AI (mode = 'ai' or has ai_prompt)
  const { data: aiQr, count: aiCount } = await admin
    .from('qr_codes')
    .select('id, name, type, user_id, created_at, mode', { count: 'exact' })
    .eq('mode', 'ai')
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: designTemplates } = await admin
    .from('design_templates')
    .select('id, name, category, is_premium, created_at')
    .order('created_at', { ascending: false })

  const userIds = [...new Set((aiQr ?? []).map(q => q.user_id).filter(Boolean))]
  const nameMap: Record<string, string> = {}
  if (userIds.length) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name').in('id', userIds)
    for (const p of profiles ?? []) nameMap[p.id] = p.full_name ?? p.id.slice(0, 8)
  }

  const freeTemplates = designTemplates?.filter(t => !t.is_premium).length ?? 0
  const premiumTemplates = designTemplates?.filter(t => t.is_premium).length ?? 0

  const categoryCounts: Record<string, number> = {}
  for (const t of designTemplates ?? []) {
    const c = t.category ?? 'Autre'
    categoryCounts[c] = (categoryCounts[c] || 0) + 1
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">IA & Design</h1>
        <p className="text-sm text-gray-500 mt-0.5">Génération IA, templates et personnalisation</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-purple-500">{aiCount?.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">QR générés par IA</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-blue-500">{(designTemplates?.length ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Templates design</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-green-500">{freeTemplates}</p>
          <p className="text-xs text-gray-500 mt-1">Templates gratuits</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-orange-500">{premiumTemplates}</p>
          <p className="text-xs text-gray-500 mt-1">Templates premium</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Derniers QR générés par IA</h2>
          <div className="space-y-3">
            {(aiQr ?? []).slice(0, 10).map((q) => (
              <div key={q.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-sm">🤖</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{q.name || q.type}</p>
                  <a href={`/admin/utilisateurs/${q.user_id}`} className="text-[10px] text-orange-500 hover:underline">
                    {nameMap[q.user_id] ?? '—'}
                  </a>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">{new Date(q.created_at).toLocaleDateString('fr-FR')}</p>
                  <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">{q.type}</span>
                </div>
              </div>
            ))}
            {!aiQr?.length && <p className="text-xs text-gray-400 text-center py-6">Aucun QR généré par IA</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Templates par catégorie</h2>
          <div className="space-y-3 mb-4">
            {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, cnt]) => (
              <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs font-semibold text-gray-700">{cat}</span>
                <span className="text-xs font-bold text-blue-500">{cnt} templates</span>
              </div>
            ))}
          </div>
          <h3 className="text-xs font-bold text-gray-600 mb-3">Derniers templates</h3>
          <div className="space-y-2">
            {(designTemplates ?? []).slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <p className="text-xs text-gray-700 font-medium">{t.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">{t.category}</span>
                  {t.is_premium && (
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">Premium</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
