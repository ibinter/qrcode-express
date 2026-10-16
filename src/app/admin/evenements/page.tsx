import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function AdminEvenements() {
  const admin = createAdminClient()

  const { data: events, count } = await admin
    .from('events')
    .select('id, title, user_id, date, location, max_capacity, created_at', { count: 'exact' })
    .order('date', { ascending: false })
    .limit(50)

  const { count: totalTickets } = await admin
    .from('tickets')
    .select('*', { count: 'exact', head: true })

  const userIds = [...new Set((events ?? []).map(e => e.user_id).filter(Boolean))]
  const nameMap: Record<string, string> = {}
  if (userIds.length) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name').in('id', userIds)
    for (const p of profiles ?? []) nameMap[p.id] = p.full_name ?? p.id.slice(0, 8)
  }

  const eventIds = (events ?? []).map(e => e.id)
  const ticketCounts: Record<string, number> = {}
  if (eventIds.length) {
    const { data: tickets } = await admin.from('tickets').select('event_id').in('event_id', eventIds)
    for (const t of tickets ?? []) ticketCounts[t.event_id] = (ticketCounts[t.event_id] || 0) + 1
  }

  const now = new Date()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Événements & Tickets</h1>
        <p className="text-sm text-gray-500 mt-0.5">{count?.toLocaleString('fr-FR')} événements, {totalTickets?.toLocaleString('fr-FR')} tickets</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-purple-500">{count?.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Événements total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-orange-500">{totalTickets?.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Tickets vendus</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-extrabold text-green-500">
            {(events ?? []).filter(e => new Date(e.date) > now).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Événements à venir</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Événement</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Organisateur</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tickets</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Capacité</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((ev, i) => {
              const isUpcoming = new Date(ev.date) > now
              const ticketCount = ticketCounts[ev.id] ?? 0
              const isFull = ev.max_capacity && ticketCount >= ev.max_capacity
              return (
                <tr key={ev.id} className={`border-b border-gray-50 hover:bg-orange-50/20 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-sm">🎫</div>
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[160px]">{ev.title || 'Sans titre'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/admin/utilisateurs/${ev.user_id}`} className="text-xs text-orange-500 hover:underline">
                      {nameMap[ev.user_id] ?? '—'}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {ev.date ? new Date(ev.date).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-orange-500">{ticketCount}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{ev.max_capacity ?? 'Illimitée'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isFull ? 'bg-red-100 text-red-600' :
                      isUpcoming ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isFull ? 'Complet' : isUpcoming ? 'À venir' : 'Passé'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {!events?.length && (
              <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">Aucun événement</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
