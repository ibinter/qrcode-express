import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'
import RegisterForm from './RegisterForm'
import EventCountdown from './EventCountdown'
import Link from 'next/link'
import { buildMeta } from '@/lib/og-meta'
import { getLang } from '@/lib/i18n-server'
import { t, dir } from '@/lib/i18n'
import type { Metadata } from 'next'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'event').single()
  if (!qr) return buildMeta({ title: 'Événement' })
  let e: { name?: string; description?: string; cover?: string; date?: string } = {}
  try { e = JSON.parse(qr.content) } catch {}
  const desc = [e.date, e.description].filter(Boolean).join(' · ')
  return buildMeta({ title: e.name || 'Événement', description: desc || undefined, image: e.cover })
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lang = await getLang()
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

  const mapUrl = event.map_url as string | undefined
  const cover = event.cover as string | undefined
  const tags: string[] = Array.isArray(event.tags) ? event.tags as string[] : []

  return (
    <>
      <PixelSnippets pixels={pixels} />
      <main className="min-h-screen bg-gray-50" lang={lang} dir={dir(lang)}>

        {/* Hero cover */}
        <div className="relative w-full h-64 overflow-hidden">
          {cover ? (
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor}, #041B4D)` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
              {tags.map((t, i) => (
                <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white">{t}</span>
              ))}
            </div>
          )}

          {/* Status badge */}
          {isFull && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">{t(lang, 'event_sold_out').toUpperCase()}</div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-5 left-4 right-4">
            <h1 className="text-white font-extrabold text-2xl leading-tight drop-shadow-lg">
              {(event.name as string) || 'Événement'}
            </h1>
            {typeof event.organizer === 'string' && event.organizer && (
              <p className="text-white/80 text-sm mt-1">Par {event.organizer}</p>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 -mt-4 relative z-10 space-y-3 pb-10">

          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 space-y-4">

            {/* Countdown */}
            {date && !isFull && (
              <div className="border border-gray-100 rounded-2xl py-3 px-4 bg-gray-50">
                <p className="text-xs text-center text-gray-400 mb-2 font-semibold uppercase tracking-wider">{t(lang, 'countdown_label')}</p>
                <EventCountdown dateStr={date} accentColor={accentColor} />
              </div>
            )}

            {/* Infos */}
            <div className="space-y-3">
              {date && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{ background: accentColor + '18' }}>📅</div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">{t(lang, 'event_date')}</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {time && ` · ${time}`}
                    </p>
                  </div>
                </div>
              )}
              {typeof event.location === 'string' && event.location && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{ background: accentColor + '18' }}>📍</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">{t(lang, 'event_location')}</p>
                    <p className="text-sm font-bold text-gray-900">{event.location}</p>
                  </div>
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-opacity hover:opacity-80"
                      style={{ background: accentColor }}>
                      {t(lang, 'event_directions')} →
                    </a>
                  )}
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg"
                  style={{ background: accentColor + '18' }}>🎟️</div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">{t(lang, 'event_price')}</p>
                  <p className="text-sm font-extrabold" style={{ color: accentColor }}>
                    {price === 0 ? t(lang, 'event_free') : `${price.toLocaleString('fr-FR')} FCFA`}
                  </p>
                </div>
              </div>
              {capacity > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{ background: accentColor + '18' }}>👥</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold">{t(lang, 'event_capacity')}</p>
                    <p className="text-sm font-bold text-gray-900">
                      {isFull
                        ? <span className="text-red-600">{t(lang, 'event_sold_out')} · {sold}/{capacity}</span>
                        : `${capacity - (sold ?? 0)} ${t(lang, 'event_tickets_left')} / ${capacity}`}
                    </p>
                    {!isFull && (
                      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${Math.round(((sold ?? 0) / capacity) * 100)}%`, background: accentColor }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {typeof event.description === 'string' && event.description && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{t(lang, 'event_about')}</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Registration */}
          {isClosed ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5 text-center">
              <p className="text-yellow-700 font-semibold">{t(lang, 'event_closed')}</p>
            </div>
          ) : isFull ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-5 text-center">
              <p className="text-4xl mb-2">😔</p>
              <p className="text-red-700 font-bold">{t(lang, 'event_full')}</p>
              <p className="text-sm text-red-500 mt-1">{t(lang, 'event_sold_out')}</p>
            </div>
          ) : (
            <RegisterForm eventId={id} eventName={(event.name as string) || 'Événement'} price={price} accentColor={accentColor} />
          )}

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
              {t(lang, 'powered_by')} <span className="font-bold" style={{ color: accentColor }}>QR CODE EXPRESS</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
