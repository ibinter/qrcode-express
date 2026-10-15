import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'
import RegisterForm from './RegisterForm'

export const instant = false

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, content, status, design')
    .eq('id', id)
    .eq('type', 'event')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let event: Record<string, unknown> = {}
  try { event = JSON.parse(qr.content || '{}') } catch {}

  const pixels = (qr.design as Record<string, unknown>)?.pixels as Record<string, string> | undefined

  // Count tickets already sold
  const { count: sold } = await admin
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', id)
    .neq('status', 'cancelled')

  const capacity = Number(event.capacity) || 0
  const isFull = capacity > 0 && (sold ?? 0) >= capacity
  const isClosed = qr.status === 'paused'

  const accentColor = (event.color as string) || '#041B4D'
  const date = event.date as string | undefined
  const time = event.time as string | undefined
  const price = Number(event.price) || 0

  return (
    <>
      <PixelSnippets pixels={pixels} />
      <main className="min-h-screen bg-gray-50">
        {/* Hero banner */}
        <div className="relative" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
          {!!event.logo && (
            <img src={event.logo as string} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="relative max-w-lg mx-auto px-6 py-12 text-center text-white">
            <p className="text-4xl mb-3">🎟️</p>
            <h1 className="text-2xl font-bold leading-tight mb-2">{(event.name as string) || 'Événement'}</h1>
            {!!event.organizer && (
              <p className="text-sm opacity-80">Par {event.organizer as string}</p>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
          {/* Event details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            {date && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-semibold text-[#041B4D]">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {time && ` à ${time}`}
                  </p>
                </div>
              </div>
            )}
            {!!event.location && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">📍</span>
                <p className="text-gray-700">{event.location as string}</p>
              </div>
            )}
            {capacity > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">👥</span>
                <p className="text-gray-700">
                  {isFull ? (
                    <span className="text-red-600 font-semibold">Complet ({sold}/{capacity} places)</span>
                  ) : (
                    <span>{(sold ?? 0)}/{capacity} places réservées</span>
                  )}
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-2xl">💰</span>
              <p className="font-semibold" style={{ color: accentColor }}>
                {price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`}
              </p>
            </div>
          </div>

          {/* Description */}
          {!!event.description && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description as string}</p>
            </div>
          )}

          {/* Registration form */}
          {isClosed ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
              <p className="text-yellow-700 font-semibold">Les inscriptions sont temporairement fermées.</p>
            </div>
          ) : isFull ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
              <p className="text-red-700 font-semibold">Désolé, cet événement est complet.</p>
            </div>
          ) : (
            <RegisterForm eventId={id} eventName={(event.name as string) || 'Événement'} price={price} accentColor={accentColor} />
          )}
        </div>
      </main>
    </>
  )
}
