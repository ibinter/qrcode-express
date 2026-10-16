import { createAdminClient } from '@/lib/supabase/admin'
import { connection } from 'next/server'

export const instant = false

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  success: { color: '#10b981', bg: '#f0fdf4', label: 'Réussi' },
  pending: { color: '#f59e0b', bg: '#fffbeb', label: 'En attente' },
  failed: { color: '#ef4444', bg: '#fef2f2', label: 'Échoué' },
  refunded: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Remboursé' },
}

export default async function AdminTransactions({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await connection()
  const sp = await searchParams
  const status = sp.status
  const page = Number(sp.page ?? 1)
  const perPage = 30

  const admin = createAdminClient()

  let query = admin
    .from('transactions')
    .select('id, user_id, amount, description, status, reference, created_at, metadata', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1)

  if (status) query = query.eq('status', status)

  const { data: txs, count } = await query
  const totalPages = Math.ceil((count ?? 0) / perPage)

  const userIds = [...new Set((txs ?? []).map(t => t.user_id).filter(Boolean))]
  const nameMap: Record<string, string> = {}
  if (userIds.length) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name').in('id', userIds)
    for (const p of profiles ?? []) nameMap[p.id] = p.full_name ?? p.id.slice(0, 8)
  }

  const { data: allRevenue } = await admin.from('transactions').select('amount').eq('status', 'success')
  const totalRevenue = allRevenue?.reduce((s, t) => s + Number(t.amount), 0) ?? 0

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { data: monthRevenue } = await admin.from('transactions').select('amount').eq('status', 'success').gte('created_at', startOfMonth)
  const monthTotal = monthRevenue?.reduce((s, t) => s + Number(t.amount), 0) ?? 0

  const { data: allTxStatus } = await admin.from('transactions').select('status')
  const statusCounts = (allTxStatus ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1; return acc
  }, {})

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Transactions & Revenus</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count?.toLocaleString('fr-FR')} transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '💰', label: 'Revenu total', value: `${totalRevenue.toLocaleString('fr-FR')} FCFA`, color: '#10b981' },
          { icon: '📅', label: 'Ce mois', value: `${monthTotal.toLocaleString('fr-FR')} FCFA`, color: '#3b82f6' },
          { icon: '✅', label: 'Réussies', value: (statusCounts['success'] ?? 0).toLocaleString(), color: '#10b981' },
          { icon: '⏳', label: 'En attente', value: (statusCounts['pending'] ?? 0).toLocaleString(), color: '#f59e0b' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: k.color + '15' }}>{k.icon}</div>
              <p className="text-xs text-gray-500">{k.label}</p>
            </div>
            <p className="text-xl font-extrabold text-gray-900">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-4 flex gap-2 flex-wrap">
        {['', 'success', 'pending', 'failed', 'refunded'].map((s) => {
          const cfg = STATUS_CONFIG[s]
          return (
            <a key={s} href={s ? `/admin/transactions?status=${s}` : '/admin/transactions'}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                (status === s) || (!status && !s)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s ? (cfg?.label ?? s) : 'Toutes'}
              {s && statusCounts[s] ? ` (${statusCounts[s]})` : ''}
            </a>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Description</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Montant</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Méthode</th>
            </tr>
          </thead>
          <tbody>
            {(txs ?? []).map((tx, i) => {
              const meta = (tx.metadata ?? {}) as Record<string, unknown>
              const method = meta.method as string ?? '—'
              const cfg = STATUS_CONFIG[tx.status]
              return (
                <tr key={tx.id} className={`border-b border-gray-50 hover:bg-orange-50/20 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(tx.created_at).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <a href={`/admin/utilisateurs/${tx.user_id}`} className="text-xs text-orange-500 hover:underline font-semibold">
                      {nameMap[tx.user_id] ?? tx.user_id?.slice(0, 8) ?? '—'}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[180px] truncate">{tx.description || '—'}</td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{Number(tx.amount).toLocaleString('fr-FR')} F</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: cfg?.bg ?? '#f1f5f9', color: cfg?.color ?? '#64748b' }}>
                      {cfg?.label ?? tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{method}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/admin/transactions?page=${p}${status ? `&status=${status}` : ''}`}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${
                p === page ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}>{p}</a>
          ))}
        </div>
      )}
    </div>
  )
}
