'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCodeMini from './QRCodeMini'
import EditQRModal from './EditQRModal'
import LinkHealthBadge from './LinkHealthBadge'

interface QRRow {
  id: string
  name: string
  type: string
  mode: string
  content: string
  slug?: string
  scan_count: number
  status: string
  created_at: string
  design?: Record<string, unknown>
}

interface Props {
  qrs: QRRow[]
  typeIcons: Record<string, string>
}

const DYNAMIC_PATHS: Record<string, string> = { menu: 'menu', coupon: 'coupon', biolink: 'bio', vcard_plus: 'vcard', catalog: 'catalog', review: 'review', event: 'event', lead: 'form' }

function getPublicUrl(qr: QRRow): string {
  if (qr.mode === 'dynamic' && DYNAMIC_PATHS[qr.type]) {
    return `${window.location.origin}/${DYNAMIC_PATHS[qr.type]}/${qr.id}`
  }
  // Slug-based dynamic QRs (url, whatsapp, etc. with dynamic mode)
  if (qr.mode === 'dynamic' && qr.slug) {
    return `${window.location.origin}/r/${qr.slug}`
  }
  if (qr.type === 'app') return `${window.location.origin}/app/${qr.id}`
  return qr.content
}

export default function QRDashboardCards({ qrs, typeIcons }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [list, setList] = useState(qrs)
  const [copied, setCopied] = useState<string | null>(null)
  const [editingQR, setEditingQR] = useState<QRRow | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Archiver ce QR code ?')) return
    setDeletingId(id)
    await fetch(`/api/qr/${id}`, { method: 'DELETE' })
    setList((prev) => prev.filter((q) => q.id !== id))
    setDeletingId(null)
    router.refresh()
  }

  function handleCopy(qr: QRRow) {
    const url = getPublicUrl(qr)
    navigator.clipboard.writeText(url)
    setCopied(qr.id)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleSaved(id: string, name: string, content: string) {
    setList((prev) => prev.map((q) => q.id === id ? { ...q, name, content } : q))
  }

  return (
    <>
      {editingQR && (
        <EditQRModal
          qr={editingQR}
          onClose={() => setEditingQR(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((qr) => (
          <div key={qr.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
            {/* Top row */}
            <div className="flex items-start gap-3">
              <QRCodeMini content={
                qr.mode === 'dynamic' && DYNAMIC_PATHS[qr.type]
                  ? `${typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express-ibig.vercel.app'}/${DYNAMIC_PATHS[qr.type]}/${qr.id}`
                  : qr.mode === 'dynamic' && qr.slug
                  ? `${typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express-ibig.vercel.app'}/r/${qr.slug}`
                  : qr.content}
                color={(qr.design?.fgColor as string) || '#041B4D'}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#041B4D] text-sm leading-tight line-clamp-2">
                  {typeIcons[qr.type] || '📱'} {qr.name || `QR ${qr.type}`}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    qr.mode === 'dynamic' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {qr.mode === 'dynamic' ? '⚡ Dynamique' : 'Statique'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">
                    Actif
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-2">
              <span className="font-semibold text-[#041B4D]">📊 {qr.scan_count ?? 0} scans</span>
              <div className="flex items-center gap-2">
                {qr.mode === 'dynamic' && qr.content?.startsWith('http') && (
                  <LinkHealthBadge
                    qrId={qr.id}
                    url={qr.content}
                    initialHealth={(qr.design?.link_health as any) ?? null}
                    compact
                  />
                )}
                <span>{new Date(qr.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            {/* Actions row 1 */}
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(qr)}
                className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 font-semibold hover:bg-gray-50 transition-colors text-gray-700"
              >
                {copied === qr.id ? '✅ Copié !' : '🔗 Copier'}
              </button>
              <button
                onClick={() => setEditingQR(qr)}
                className="flex-1 text-xs py-1.5 rounded-lg border border-[#FF6A00]/30 text-[#FF6A00] font-semibold hover:bg-orange-50 transition-colors"
              >
                ✏️ Éditer
              </button>
            </div>

            {/* Actions row 2 */}
            <div className="flex gap-2">
              <Link
                href={`/dashboard/${qr.id}`}
                className="flex-1 text-center text-xs py-1.5 rounded-lg border border-blue-100 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
              >
                📈 Stats
              </Link>
              <button
                onClick={() => handleDelete(qr.id)}
                disabled={deletingId === qr.id}
                className="px-3 py-1.5 rounded-lg border border-red-100 text-red-400 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deletingId === qr.id ? '...' : '🗑️'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
