'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCodeMini from './QRCodeMini'
import LinkHealthBadge from './LinkHealthBadge'

const EditQRModal = dynamic(() => import('./EditQRModal'), { ssr: false })

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

const DYNAMIC_PATHS: Record<string, string> = {
  menu: 'menu', coupon: 'coupon', biolink: 'bio', vcard_plus: 'vcard',
  catalog: 'catalog', review: 'review', event: 'event', lead: 'form', payment: 'pay',
}

const TYPE_LABELS: Record<string, string> = {
  url: 'URL', whatsapp: 'WhatsApp', vcard: 'Contact', vcard_plus: 'Carte Pro',
  wifi: 'Wi-Fi', text: 'Texte', email: 'E-mail', phone: 'Téléphone',
  sms: 'SMS', pdf: 'PDF', app: 'App', menu: 'Menu', coupon: 'Coupon',
  biolink: 'Bio Link', social: 'Réseaux', location: 'Localisation',
  catalog: 'Catalogue', review: 'Avis', lead: 'Formulaire', payment: 'Paiement',
}

function getPublicUrl(qr: QRRow): string {
  if (qr.mode === 'dynamic' && DYNAMIC_PATHS[qr.type]) {
    return `${window.location.origin}/${DYNAMIC_PATHS[qr.type]}/${qr.id}`
  }
  if (qr.mode === 'dynamic' && qr.slug) {
    return `${window.location.origin}/r/${qr.slug}`
  }
  if (qr.type === 'app') return `${window.location.origin}/app/${qr.slug ?? qr.id}`
  return qr.content
}

async function downloadQR(qr: QRRow) {
  try {
    const url = qr.mode === 'dynamic' && DYNAMIC_PATHS[qr.type]
      ? `${window.location.origin}/${DYNAMIC_PATHS[qr.type]}/${qr.id}`
      : qr.mode === 'dynamic' && qr.slug
      ? `${window.location.origin}/r/${qr.slug}`
      : qr.content
    const QRCodeStyling = (await import('qr-code-styling')).default
    const qrInstance = new QRCodeStyling({
      width: 512, height: 512,
      data: url || 'https://qrcode-express.com',
      dotsOptions: { color: (qr.design?.fgColor as string) || '#041B4D', type: 'square' },
      backgroundOptions: { color: '#FFFFFF' },
      qrOptions: { errorCorrectionLevel: 'M' },
      image: undefined,
    })
    qrInstance.download({ name: qr.name || `qr-${qr.id}`, extension: 'png' })
  } catch {}
}

type SortKey = 'date' | 'scans' | 'name'
type FilterType = 'all' | string
type ViewMode = 'grid' | 'list'

function QRPreviewModal({ qr, onClose, typeIcons }: { qr: QRRow; onClose: () => void; typeIcons: Record<string, string> }) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(false)

  const qrUrl = qr.mode === 'dynamic' && DYNAMIC_PATHS[qr.type]
    ? `${window.location.origin}/${DYNAMIC_PATHS[qr.type]}/${qr.id}`
    : qr.mode === 'dynamic' && qr.slug
    ? `${window.location.origin}/r/${qr.slug}`
    : qr.content

  useEffect(() => {
    let instance: any
    async function render() {
      if (!canvasRef.current) return
      const QRCodeStyling = (await import('qr-code-styling')).default
      instance = new QRCodeStyling({
        width: 280, height: 280,
        data: qrUrl || 'https://qrcode-express.com',
        dotsOptions: { color: (qr.design?.fgColor as string) || '#041B4D', type: 'square' },
        backgroundOptions: { color: '#FFFFFF' },
        qrOptions: { errorCorrectionLevel: 'M' },
      })
      canvasRef.current.innerHTML = ''
      instance.append(canvasRef.current)
      setRendered(true)
    }
    render()
    return () => { if (canvasRef.current) canvasRef.current.innerHTML = '' }
  }, [qr.id])

  async function handleDownloadPng() {
    await downloadQR(qr)
  }

  async function handleDownloadSvg() {
    try {
      const QRCodeStyling = (await import('qr-code-styling')).default
      const inst = new QRCodeStyling({
        width: 512, height: 512,
        data: qrUrl || 'https://qrcode-express.com',
        dotsOptions: { color: (qr.design?.fgColor as string) || '#041B4D', type: 'square' },
        backgroundOptions: { color: '#FFFFFF' },
        qrOptions: { errorCorrectionLevel: 'M' },
      })
      inst.download({ name: qr.name || `qr-${qr.id}`, extension: 'svg' })
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-[#041B4D] text-sm">{typeIcons[qr.type] || '📱'} {qr.name || `QR ${qr.type}`}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {qr.mode === 'dynamic' ? '⚡ Dynamique' : 'Statique'} · {TYPE_LABELS[qr.type] || qr.type}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR preview */}
        <div className="flex justify-center mb-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-inner">
            {!rendered && <div className="w-[280px] h-[280px] flex items-center justify-center text-gray-300 text-sm">Chargement…</div>}
            <div ref={canvasRef} />
          </div>
        </div>

        {/* URL */}
        <p className="text-[10px] text-gray-400 text-center truncate mb-4 px-2">{qrUrl}</p>

        {/* Download buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPng}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#041B4D] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            PNG
          </button>
          <button
            onClick={handleDownloadSvg}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#041B4D] text-[#041B4D] text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            SVG
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QRDashboardCards({ qrs, typeIcons }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [list, setList] = useState(qrs)
  const [copied, setCopied] = useState<string | null>(null)
  const [editingQR, setEditingQR] = useState<QRRow | null>(null)
  const [previewQR, setPreviewQR] = useState<QRRow | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all')
  const [sort, setSort] = useState<SortKey>('date')
  const [view, setView] = useState<ViewMode>('grid')
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Archiver ce QR code ?')) return
    setDeletingId(id)
    await fetch(`/api/qr/${id}`, { method: 'DELETE' })
    setList(prev => prev.filter(q => q.id !== id))
    setDeletingId(null)
    router.refresh()
  }

  async function handleToggleStatus(qr: QRRow) {
    const newStatus = qr.status === 'active' ? 'paused' : 'active'
    setTogglingId(qr.id)
    const res = await fetch(`/api/qr/${qr.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) setList(prev => prev.map(q => q.id === qr.id ? { ...q, status: newStatus } : q))
    setTogglingId(null)
  }

  function handleCopy(qr: QRRow) {
    const url = getPublicUrl(qr)
    navigator.clipboard.writeText(url)
    setCopied(qr.id)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleSaved(id: string, name: string, content: string) {
    setList(prev => prev.map(q => q.id === id ? { ...q, name, content } : q))
  }

  // Get unique types for filter pills
  const uniqueTypes = useMemo(() => {
    const types = [...new Set(list.map(q => q.type))]
    return types.sort()
  }, [list])

  // Filter + sort
  const filtered = useMemo(() => {
    let result = list
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(qr =>
        (qr.name || '').toLowerCase().includes(q) ||
        qr.type.toLowerCase().includes(q) ||
        (TYPE_LABELS[qr.type] || '').toLowerCase().includes(q)
      )
    }
    if (filterType !== 'all') result = result.filter(qr => qr.type === filterType)
    if (filterStatus !== 'all') result = result.filter(qr => qr.status === filterStatus)
    result = [...result].sort((a, b) => {
      if (sort === 'scans') return (b.scan_count || 0) - (a.scan_count || 0)
      if (sort === 'name') return (a.name || '').localeCompare(b.name || '')
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return result
  }, [list, search, filterType, filterStatus, sort])

  return (
    <>
      {editingQR && (
        <EditQRModal qr={editingQR} onClose={() => setEditingQR(null)} onSaved={handleSaved} />
      )}
      {previewQR && (
        <QRPreviewModal qr={previewQR} onClose={() => setPreviewQR(null)} typeIcons={typeIcons} />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un QR code..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 focus:border-[#FF6A00] transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort + View */}
        <div className="flex gap-2 shrink-0">
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 font-semibold text-gray-700"
          >
            <option value="date">Plus récent</option>
            <option value="scans">Plus scanné</option>
            <option value="name">Nom A→Z</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 font-semibold text-gray-700"
          >
            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="paused">En pause</option>
          </select>

          {/* Grid/List toggle */}
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2.5 transition-colors ${view === 'grid' ? 'bg-[#FF6A00] text-white' : 'text-gray-400 hover:bg-gray-50'}`}
              title="Vue grille"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2.5 transition-colors ${view === 'list' ? 'bg-[#FF6A00] text-white' : 'text-gray-400 hover:bg-gray-50'}`}
              title="Vue liste"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Type filter pills */}
      {uniqueTypes.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setFilterType('all')}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${filterType === 'all' ? 'bg-[#041B4D] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            Tous ({list.length})
          </button>
          {uniqueTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${filterType === type ? 'bg-[#FF6A00] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-200 hover:text-[#FF6A00]'}`}
            >
              {typeIcons[type]} {TYPE_LABELS[type] || type} ({list.filter(q => q.type === type).length})
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      {(search || filterType !== 'all' || filterStatus !== 'all') && (
        <p className="text-xs text-gray-500 mb-4">
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''} {search ? `pour "${search}"` : ''}
          {filtered.length !== list.length && (
            <button onClick={() => { setSearch(''); setFilterType('all'); setFilterStatus('all') }}
              className="ml-2 text-[#FF6A00] hover:underline font-semibold">
              Réinitialiser
            </button>
          )}
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm font-semibold">Aucun QR trouvé</p>
          <button onClick={() => { setSearch(''); setFilterType('all'); setFilterStatus('all') }}
            className="mt-3 text-sm text-[#FF6A00] hover:underline font-semibold">
            Voir tous les QR
          </button>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(qr => (
            <div key={qr.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-md ${
                qr.status === 'paused' ? 'border-yellow-200 opacity-80' : 'border-gray-100'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start gap-3">
                <div className="relative">
                  <QRCodeMini
                    content={qr.mode === 'dynamic' && DYNAMIC_PATHS[qr.type]
                      ? `${typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'}/${DYNAMIC_PATHS[qr.type]}/${qr.id}`
                      : qr.mode === 'dynamic' && qr.slug
                      ? `${typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'}/r/${qr.slug}`
                      : qr.content}
                    color={(qr.design?.fgColor as string) || '#041B4D'}
                  />
                  {qr.status === 'paused' && (
                    <div className="absolute inset-0 bg-white/60 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⏸️</span>
                    </div>
                  )}
                </div>
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
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      qr.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {qr.status === 'active' ? '● Actif' : '⏸ Pause'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-2">
                <span className="font-semibold text-[#041B4D]">📊 {(qr.scan_count ?? 0).toLocaleString()} scans</span>
                <div className="flex items-center gap-2">
                  {qr.mode === 'dynamic' && qr.content?.startsWith('http') && (
                    <LinkHealthBadge qrId={qr.id} url={qr.content} initialHealth={(qr.design?.link_health as any) ?? null} compact />
                  )}
                  <span>{new Date(qr.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Actions row 1 */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleCopy(qr)}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 font-semibold hover:bg-gray-50 transition-colors text-gray-700"
                  title="Copier le lien"
                >
                  {copied === qr.id ? '✅' : '🔗'}
                </button>
                <button
                  onClick={() => setEditingQR(qr)}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-[#FF6A00]/30 text-[#FF6A00] font-semibold hover:bg-orange-50 transition-colors"
                  title="Éditer"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setPreviewQR(qr)}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-purple-100 text-purple-600 font-semibold hover:bg-purple-50 transition-colors"
                  title="Prévisualiser & Télécharger"
                >
                  👁️
                </button>
                <button
                  onClick={() => handleToggleStatus(qr)}
                  disabled={togglingId === qr.id}
                  className={`flex-1 text-xs py-1.5 rounded-lg border font-semibold transition-colors disabled:opacity-50 ${
                    qr.status === 'active'
                      ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                  title={qr.status === 'active' ? 'Mettre en pause' : 'Réactiver'}
                >
                  {togglingId === qr.id ? '⏳' : qr.status === 'active' ? '⏸️' : '▶️'}
                </button>
              </div>

              {/* Stats link + download + delete */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => downloadQR(qr)}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-[#041B4D]/20 text-[#041B4D] text-xs font-bold hover:bg-[#041B4D]/5 transition-colors"
                  title="Télécharger PNG"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PNG
                </button>
                <Link
                  href={`/dashboard/${qr.id}`}
                  className="flex-1 text-center text-xs py-1.5 rounded-lg border border-blue-100 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                >
                  📈 Analytics
                </Link>
                <button
                  onClick={() => handleDelete(qr.id)}
                  disabled={deletingId === qr.id}
                  className="px-3 py-1.5 rounded-lg border border-red-100 text-red-400 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Archiver"
                >
                  {deletingId === qr.id ? '...' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">QR Code</th>
                <th className="text-left text-xs font-bold text-gray-500 px-4 py-3 hidden sm:table-cell">Type</th>
                <th className="text-left text-xs font-bold text-gray-500 px-4 py-3 hidden md:table-cell">Statut</th>
                <th className="text-right text-xs font-bold text-gray-500 px-4 py-3">Scans</th>
                <th className="text-right text-xs font-bold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(qr => (
                <tr key={qr.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <QRCodeMini
                        content={qr.mode === 'dynamic' && DYNAMIC_PATHS[qr.type]
                          ? `${typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'}/${DYNAMIC_PATHS[qr.type]}/${qr.id}`
                          : qr.mode === 'dynamic' && qr.slug
                          ? `${typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'}/r/${qr.slug}`
                          : qr.content}
                        color={(qr.design?.fgColor as string) || '#041B4D'}
                      />
                      <div>
                        <p className="font-semibold text-[#041B4D] text-xs">{qr.name || `QR ${qr.type}`}</p>
                        <p className="text-[10px] text-gray-400">{new Date(qr.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-600">{typeIcons[qr.type]} {TYPE_LABELS[qr.type] || qr.type}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      qr.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {qr.status === 'active' ? 'Actif' : 'Pause'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-bold text-[#041B4D]">{(qr.scan_count ?? 0).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleCopy(qr)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Copier">
                        {copied === qr.id ? '✅' : '🔗'}
                      </button>
                      <button onClick={() => setPreviewQR(qr)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors" title="Prévisualiser & Télécharger">👁️</button>
                      <button onClick={() => downloadQR(qr)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Télécharger PNG">⬇️</button>
                      <button onClick={() => setEditingQR(qr)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition-colors" title="Éditer">✏️</button>
                      <button onClick={() => handleToggleStatus(qr)} disabled={togglingId === qr.id}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${qr.status === 'active' ? 'hover:bg-yellow-50 text-yellow-500' : 'hover:bg-green-50 text-green-500'}`}
                        title={qr.status === 'active' ? 'Pause' : 'Activer'}>
                        {togglingId === qr.id ? '⏳' : qr.status === 'active' ? '⏸️' : '▶️'}
                      </button>
                      <Link href={`/dashboard/${qr.id}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Analytics">📈</Link>
                      <button onClick={() => handleDelete(qr.id)} disabled={deletingId === qr.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors disabled:opacity-50" title="Archiver">
                        {deletingId === qr.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
