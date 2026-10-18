import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content, name').eq('id', id).eq('type', 'appointment').single()
  if (!qr) notFound()

  let d: Record<string, string & string[]> = {}
  try { d = JSON.parse(qr.content) } catch {}

  const color = d.color || '#041B4D'
  const services: string[] = Array.isArray(d.services) ? d.services : []

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-3xl text-white text-center p-8 shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          <p className="text-5xl mb-3">📆</p>
          <h1 className="text-2xl font-extrabold">{d.name || 'Rendez-vous'}</h1>
          {d.profession && <p className="text-sm opacity-80 mt-1">{d.profession}</p>}
        </div>

        {d.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-600">{d.description}</p>
          </div>
        )}

        {services.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Services</p>
            <div className="flex flex-wrap gap-2">
              {services.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: color }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {d.schedule && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">🕐 Horaires</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{d.schedule}</p>
          </div>
        )}

        {d.address && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">📍 Adresse</p>
            <p className="text-sm text-gray-700">{d.address}</p>
          </div>
        )}

        <div className="space-y-3">
          {d.booking_url && (
            <a href={d.booking_url} target="_blank" rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm shadow"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
              📅 Prendre rendez-vous
            </a>
          )}
          {d.phone && (
            <a href={`https://wa.me/${d.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-green-500 text-white font-bold text-sm shadow">
              💬 WhatsApp
            </a>
          )}
          {d.phone && (
            <a href={`tel:${d.phone}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm">
              📞 Appeler
            </a>
          )}
          {d.email && (
            <a href={`mailto:${d.email}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm">
              ✉️ Envoyer un e-mail
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
