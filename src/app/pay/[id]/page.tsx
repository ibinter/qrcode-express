import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'
import PaymentButton from './PaymentButton'

export const instant = false

const METHOD_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  wave:   { label: 'Wave',         icon: '🌊', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  orange: { label: 'Orange Money', icon: '🟠', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  mtn:    { label: 'MTN MoMo',     icon: '🟡', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
}

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, content, status, design')
    .eq('id', id)
    .eq('type', 'payment')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let payment: Record<string, unknown> = {}
  try { payment = JSON.parse(qr.content || '{}') } catch {}

  const pixels = (qr.design as Record<string, unknown>)?.pixels as Record<string, string> | undefined
  const accentColor = (payment.color as string) || '#16A34A'
  const isClosed = qr.status === 'paused'
  const methods: string[] = Array.isArray(payment.methods) ? payment.methods as string[] : ['wave', 'orange', 'mtn']
  const fixedAmount = Number(payment.amount) || 0
  const customAmount = !!payment.custom_amount

  return (
    <>
      <PixelSnippets pixels={pixels} />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="relative" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
          {payment.logo && (
            <img src={payment.logo as string} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="relative max-w-lg mx-auto px-6 py-10 text-center text-white">
            <p className="text-4xl mb-3">💳</p>
            <h1 className="text-2xl font-bold leading-tight mb-1">{(payment.merchant as string) || 'Paiement'}</h1>
            {payment.description && (
              <p className="text-sm opacity-90 leading-relaxed mt-1">{payment.description as string}</p>
            )}
            {fixedAmount > 0 && !customAmount && (
              <p className="text-3xl font-extrabold mt-3">
                {fixedAmount.toLocaleString('fr-FR')} <span className="text-xl font-semibold opacity-80">FCFA</span>
              </p>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
          {isClosed ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <p className="text-yellow-700 font-semibold">Ce lien de paiement est temporairement désactivé.</p>
            </div>
          ) : (
            <>
              {/* Accepted methods */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3">Méthodes acceptées</p>
                <div className="flex gap-3">
                  {methods.map((m) => {
                    const cfg = METHOD_CONFIG[m]
                    if (!cfg) return null
                    return (
                      <div key={m} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold ${cfg.color}`}>
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Payment form */}
              <PaymentButton
                qrId={id}
                fixedAmount={fixedAmount}
                customAmount={customAmount}
                accentColor={accentColor}
              />
            </>
          )}
        </div>
      </main>
    </>
  )
}
