import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import ValidateButton from './ValidateButton'

export const instant = false

export default async function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const admin = createAdminClient()

  const { data: ticket } = await admin
    .from('tickets')
    .select('id, code, holder_name, holder_email, status, validated_at, event_id, created_at')
    .eq('code', code.toUpperCase())
    .single()

  if (!ticket) notFound()

  // Load event details
  let event: Record<string, unknown> = {}
  if (ticket.event_id) {
    const { data: qr } = await admin
      .from('qr_codes')
      .select('content, name')
      .eq('id', ticket.event_id)
      .single()
    if (qr) {
      try { event = JSON.parse(qr.content || '{}') } catch {}
      if (!event.name) event.name = qr.name
    }
  }

  const isValid = ticket.status === 'valid'
  const isUsed = ticket.status === 'used'
  const isCancelled = ticket.status === 'cancelled'
  const accentColor = (event.color as string) || '#041B4D'

  const statusConfig = {
    valid:     { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  label: '✅ Billet valide',   icon: '✅' },
    used:      { bg: 'bg-gray-50',   border: 'border-gray-200',   text: 'text-gray-600',   label: '✔️ Déjà utilisé',   icon: '✔️' },
    cancelled: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    label: '❌ Billet annulé',   icon: '❌' },
  }[ticket.status as 'valid' | 'used' | 'cancelled'] ?? { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', label: ticket.status, icon: '❓' }

  const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://qrcode-express.com'}/ticket/${code}`

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="text-center">
          <p className="text-4xl mb-2">🎟️</p>
          <h1 className="text-xl font-bold text-[#041B4D]">{(event.name as string) || 'Billet'}</h1>
          {!!event.date && (
            <p className="text-sm text-gray-500 mt-1">
              {new Date(event.date as string).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {event.time ? ` à ${event.time}` : ''}
            </p>
          )}
          {!!event.location && <p className="text-xs text-gray-400 mt-0.5">📍 {event.location as string}</p>}
        </div>

        {/* Status badge */}
        <div className={`rounded-2xl border p-4 text-center ${statusConfig.bg} ${statusConfig.border}`}>
          <p className={`font-bold text-lg ${statusConfig.text}`}>{statusConfig.label}</p>
          {isUsed && ticket.validated_at && (
            <p className="text-xs text-gray-500 mt-1">
              Validé le {new Date(ticket.validated_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Ticket details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div>
            <p className="text-xs text-gray-400">Participant</p>
            <p className="font-semibold text-[#041B4D]">{ticket.holder_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">E-mail</p>
            <p className="text-sm text-gray-700">{ticket.holder_email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Code billet</p>
            <p className="font-mono font-bold text-lg tracking-widest" style={{ color: accentColor }}>{ticket.code}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Inscrit le</p>
            <p className="text-sm text-gray-700">
              {new Date(ticket.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* QR code of this ticket (for scanning at entry) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-500">Présentez ce QR à l&apos;entrée</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketUrl)}&color=${encodeURIComponent(accentColor.replace('#', ''))}&bgcolor=ffffff`}
            alt="QR billet"
            width={180}
            height={180}
            className="rounded-lg"
          />
        </div>

        {/* Validate button — only shown for valid tickets */}
        {isValid && ticket.event_id && (
          <ValidateButton ticketCode={ticket.code} accentColor={accentColor} />
        )}
      </div>
    </main>
  )
}
