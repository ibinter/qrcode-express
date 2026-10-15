import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

export const instant = false

interface VCardPlusData {
  name?: string
  title?: string
  company?: string
  phone?: string
  email?: string
  website?: string
  photo?: string
  whatsapp?: string
  linkedin?: string
  color?: string
}

export default async function VCardPlusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, name, status')
    .eq('id', id)
    .eq('type', 'vcard_plus')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let card: VCardPlusData = {}
  try { card = JSON.parse(qr.content) } catch {}

  const accent = card.color || '#041B4D'

  // Build vCard download string
  const vcf = [
    'BEGIN:VCARD', 'VERSION:3.0',
    card.name ? `FN:${card.name}` : '',
    card.title ? `TITLE:${card.title}` : '',
    card.company ? `ORG:${card.company}` : '',
    card.phone ? `TEL:${card.phone}` : '',
    card.email ? `EMAIL:${card.email}` : '',
    card.website ? `URL:${card.website}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\n')

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header banner */}
          <div className="h-24" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }} />

          {/* Avatar */}
          <div className="flex justify-center -mt-12 mb-4">
            {card.photo ? (
              <img src={card.photo} alt={card.name || ''} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-white"
                style={{ background: accent }}>
                {card.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>

          <div className="px-6 pb-6 text-center">
            <h1 className="text-xl font-bold text-[#041B4D]">{card.name || 'Sans nom'}</h1>
            {card.title && <p className="text-sm text-gray-500 mt-0.5">{card.title}</p>}
            {card.company && (
              <p className="text-xs font-semibold mt-1 px-3 py-0.5 rounded-full inline-block text-white" style={{ background: accent }}>
                {card.company}
              </p>
            )}

            {/* Contact buttons */}
            <div className="mt-5 space-y-2">
              {card.phone && (
                <a href={`tel:${card.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                  📞 {card.phone}
                </a>
              )}
              {card.email && (
                <a href={`mailto:${card.email}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                  ✉️ {card.email}
                </a>
              )}
              {card.whatsapp && (
                <a href={`https://wa.me/${card.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#25D366' }}>
                  💬 WhatsApp
                </a>
              )}
              {card.linkedin && (
                <a href={card.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#0077B5' }}>
                  🔗 LinkedIn
                </a>
              )}
              {card.website && (
                <a href={card.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                  🌐 {card.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {/* Save contact button */}
            <a
              href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vcf)}`}
              download={`${card.name || 'contact'}.vcf`}
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${accent}, #FF6A00)` }}
            >
              📥 Enregistrer le contact
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">Propulsé par QR CODE EXPRESS</p>
      </div>
    </main>
  )
}
