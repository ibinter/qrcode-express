import { createAdminClient } from '@/lib/supabase/admin'
import AdminQRAction from './AdminQRAction'

export const instant = false

const TYPE_ICONS: Record<string, string> = {
  url: '🔗', vcard: '👤', wifi: '📶', pdf: '📄', image: '🖼️',
  video: '🎬', payment: '💳', menu: '🍽️', app: '📱', social: '📣',
  event: '🎫', form: '📋', catalog: '🛍️', bio: '🌐', review: '⭐',
  coupon: '🏷️', ticket: '🎟️',
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: '#10b981', bg: '#f0fdf4', label: 'Actif' },
  paused: { color: '#f59e0b', bg: '#fffbeb', label: 'En pause' },
  archived: { color: '#94a3b8', bg: '#f8fafc', label: 'Archivé' },
}

export default async function AdminQR({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const status = sp.status
  const type = sp.type
  const page = Number(sp.page ?? 1)
  const perPage = 30

  const admin = createAdminClient()

  let query = admin
    .from('qr_codes')
    .select('id, user_id, name, type, mode, status, scan_count, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1)

  if (status) query = query.eq('status', status)
  if (type) query = query.eq('type', type)

  const { data: qrs, count } = await query
  const totalPages = Math.ceil((count ?? 0) / perPage)

  const userIds = [...new Set((qrs ?? []).map(q => q.user_id).filter(Boolean))]
  const nameMap: Record<string, string> = {}
  if (userIds.length) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name').in('id', userIds)
    for (const p of profiles ?? []) nameMap[p.id] = p.full_name ?? p.id.slice(0, 8)
  }

  const [
    { count: activeCount },
    { count: pausedCount },
    { count: archivedCount },
    { data: typeDist },
  ] = await Promise.all([
    admin.from('qr_codes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('qr_codes').select('*', { count: 'exact', head: true }).eq('status', 'paused'),
    admin.from('qr_codes').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
    admin.from('qr_codes').select('type'),
  ])

  const typeCounts = (typeDist ?? []).reduce<Record<string, number>>((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1; return acc
  }, {})

  const TYPES = Object.keys(TYPE_ICONS)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">QR Codes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count?.toLocaleString('fr-FR')} QR codes</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { icon: '📊', label: 'Total', value: (typeDist?.length ?? 0).toLocaleString(), color: '#FF6A00' },
          { icon: '✅', label: 'Actifs', value: (activeCount ?? 0).toLocaleString(), color: '#10b981' },
          { icon: '⏸️', label: 'En pause', value: (pausedCount ?? 0).toLocaleString(), color: '#f59e0b' },
          { icon: '📦', label: 'Archivés', value: (archivedCount ?? 0).toLocaleString(), color: '#94a3b8' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: k.color + '15' }}>{k.icon}</div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Types distribution */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <a href="/admin/qr"
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${!type && !status ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Tous ({typeDist?.length ?? 0})
          </a>
          {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([t, cnt]) => (
            <a key={t} href={`/admin/qr?type=${t}`}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${type === t ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {TYPE_ICONS[t] ?? '📌'} {t} ({cnt})
            </a>
          ))}
        </div>
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50 flex-wrap">
          {['active', 'paused', 'archived'].map(s => {
            const cfg = STATUS_CONFIG[s]
            return (
              <a key={s} href={`/admin/qr?status=${s}${type ? `&type=${type}` : ''}`}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${status === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cfg.label}
              </a>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">QR Code</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Propriétaire</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Mode</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Scans</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(qrs ?? []).map((q, i) => {
              const cfg = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.active
              return (
                <tr key={q.id} className={`border-b border-gray-50 hover:bg-orange-50/20 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-900">{q.name || '(sans nom)'}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{q.id.slice(0, 12)}…</p>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/admin/utilisateurs/${q.user_id}`} className="text-xs text-orange-500 hover:underline font-semibold">
                      {nameMap[q.user_id] ?? '—'}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-700">{TYPE_ICONS[q.type] ?? '📌'} {q.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${q.mode === 'dynamic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {q.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{(q.scan_count ?? 0).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminQRAction qrId={q.id} currentStatus={q.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/admin/qr?page=${p}${status ? `&status=${status}` : ''}${type ? `&type=${type}` : ''}`}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${
                p === page ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}>{p}</a>
          ))}
        </div>
      )}
    </div>
  )
}
