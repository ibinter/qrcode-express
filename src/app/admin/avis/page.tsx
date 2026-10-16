import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function AdminAvis() {
  const admin = createAdminClient()

  const { data: reviews, count } = await admin
    .from('reviews')
    .select('id, reviewer_name, rating, comment, status, created_at, qr_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50)

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '—'

  const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews ?? []) {
    const rt = Math.round(r.rating)
    if (rt >= 1 && rt <= 5) ratingDist[rt] = (ratingDist[rt] || 0) + 1
  }

  const maxRatingCount = Math.max(...Object.values(ratingDist), 1)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Avis & Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">{count?.toLocaleString('fr-FR')} avis collectés</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-4xl font-extrabold text-yellow-500">{avgRating}</p>
          <div className="flex justify-center gap-0.5 mt-1">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-lg ${parseFloat(avgRating as string) >= s ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Note moyenne</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-xs font-bold text-gray-600 mb-3">Distribution des notes</h3>
          <div className="space-y-2">
            {[5,4,3,2,1].map(star => {
              const cnt = ratingDist[star] ?? 0
              const pct = Math.round((cnt / maxRatingCount) * 100)
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600 w-4">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-5 text-right">{cnt}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center items-center gap-2">
          <p className="text-3xl font-extrabold text-orange-500">{count?.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500">Avis total</p>
          <p className="text-xs text-gray-400 mt-1">
            {reviews?.filter(r => r.status === 'published').length ?? 0} publiés ·{' '}
            {reviews?.filter(r => r.status === 'pending').length ?? 0} en attente
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Auteur</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Note</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Commentaire</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {(reviews ?? []).map((r, i) => (
              <tr key={r.id} className={`border-b border-gray-50 hover:bg-orange-50/20 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-900">{r.reviewer_name || 'Anonyme'}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${r.rating >= s ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-[250px] truncate">{r.comment || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    r.status === 'published' ? 'bg-green-100 text-green-600' :
                    r.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                  }`}>{r.status || 'pending'}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
            {!reviews?.length && (
              <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">Aucun avis</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
