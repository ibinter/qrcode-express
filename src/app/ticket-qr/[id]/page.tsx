import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

export default async function TicketLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content, name').eq('id', id).eq('type', 'ticket').single()
  if (!qr) notFound()

  let d: Record<string, string> = {}
  try { d = JSON.parse(qr.content) } catch {}

  const color = d.color || '#041B4D'
  const categoryColors: Record<string, string> = {
    VIP: '#F59E0B', Premium: '#8B5CF6', Presse: '#3B82F6', Invité: '#10B981', Staff: '#6B7280', Standard: color, Gratuit: '#10B981',
  }
  const catColor = categoryColors[d.category] || color

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm">
        {d.cover && (
          <img src={d.cover} alt="cover" className="w-full h-44 object-cover rounded-3xl shadow-2xl mb-4" />
        )}

        <div className="rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            {d.logo ? (
              <img src={d.logo} alt="organizer" className="w-12 h-12 rounded-xl object-contain bg-white/20 p-1 mx-auto mb-3" />
            ) : (
              <p className="text-5xl mb-3">🎟️</p>
            )}
            {d.organizer && <p className="text-xs opacity-70 uppercase tracking-widest mb-1">{d.organizer}</p>}
            <h1 className="text-2xl font-extrabold">{d.event_name || 'Événement'}</h1>
            {d.category && (
              <span className="inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-widest" style={{ background: catColor }}>
                {d.category.toUpperCase()}
              </span>
            )}
          </div>

          <div className="bg-white px-6 py-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {d.date && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</p>
                  <p className="font-semibold text-sm mt-0.5">{new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              )}
              {d.time && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Heure</p>
                  <p className="font-semibold text-sm mt-0.5">{d.time}</p>
                </div>
              )}
            </div>
            {d.location && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lieu</p>
                <p className="font-semibold text-sm mt-0.5">📍 {d.location}</p>
              </div>
            )}
            {(d.price || d.seat) && (
              <div className="grid grid-cols-2 gap-3">
                {d.price && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prix</p>
                    <p className="font-semibold text-sm mt-0.5">{d.price}</p>
                  </div>
                )}
                {d.seat && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Siège</p>
                    <p className="font-semibold text-sm mt-0.5">{d.seat}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white flex items-center px-4">
            <div className="w-5 h-5 rounded-full bg-gray-900 -ml-7 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2" />
            <div className="w-5 h-5 rounded-full bg-gray-900 -mr-7 flex-shrink-0" />
          </div>

          <div className="bg-white px-6 py-5 text-center">
            {d.holder_name && <p className="font-bold text-[#041B4D]">{d.holder_name}</p>}
            {d.holder_email && <p className="text-xs text-gray-400 mt-0.5">{d.holder_email}</p>}
            {d.note && <p className="text-xs text-gray-500 mt-3 italic">{d.note}</p>}
            <p className="text-xs text-gray-300 mt-4">{id}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
