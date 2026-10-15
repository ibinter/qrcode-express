'use client'
import { useState } from 'react'
import { Shield, Link2, Pause, Play, Trash2, BarChart2, Eye } from 'lucide-react'

interface UTMConfig {
  source: string
  medium: string
  campaign: string
  content: string
  term: string
}

interface PixelsConfig {
  meta_pixel_id: string
  gtag_id: string
  tiktok_pixel_id: string
}

interface Props {
  qrId: string
  initialFallbackUrl: string
  initialStatus: string
  initialUtm?: UTMConfig | null
  initialPixels?: PixelsConfig | null
}

export default function QRSettingsPanel({ qrId, initialFallbackUrl, initialStatus, initialUtm, initialPixels }: Props) {
  const [fallbackUrl, setFallbackUrl] = useState(initialFallbackUrl || '')
  const [status, setStatus] = useState(initialStatus)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [utm, setUtm] = useState<UTMConfig>({
    source:   initialUtm?.source   ?? '',
    medium:   initialUtm?.medium   ?? '',
    campaign: initialUtm?.campaign ?? '',
    content:  initialUtm?.content  ?? '',
    term:     initialUtm?.term     ?? '',
  })
  const [utmSaving, setUtmSaving] = useState(false)
  const [utmSaved, setUtmSaved] = useState(false)

  const [pixels, setPixels] = useState<PixelsConfig>({
    meta_pixel_id:    initialPixels?.meta_pixel_id    ?? '',
    gtag_id:          initialPixels?.gtag_id          ?? '',
    tiktok_pixel_id:  initialPixels?.tiktok_pixel_id  ?? '',
  })
  const [pixelsSaving, setPixelsSaving] = useState(false)
  const [pixelsSaved, setPixelsSaved]   = useState(false)

  async function saveFallback() {
    setSaving(true); setSaved(false); setError('')
    const res = await fetch(`/api/qr/${qrId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fallback_url: fallbackUrl }),
    })
    if (!res.ok) { setError('Erreur lors de la sauvegarde'); setSaving(false); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function saveUtm() {
    setUtmSaving(true)
    const hasValues = Object.values(utm).some(Boolean)
    const res = await fetch(`/api/qr/${qrId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utm: hasValues ? utm : null }),
    })
    if (res.ok) { setUtmSaved(true); setTimeout(() => setUtmSaved(false), 2000) }
    setUtmSaving(false)
  }

  async function savePixels() {
    setPixelsSaving(true)
    const hasValues = Object.values(pixels).some(Boolean)
    const res = await fetch(`/api/qr/${qrId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pixels: hasValues ? pixels : null }),
    })
    if (res.ok) { setPixelsSaved(true); setTimeout(() => setPixelsSaved(false), 2000) }
    setPixelsSaving(false)
  }

  async function toggleStatus() {
    const next = status === 'active' ? 'paused' : 'active'
    const res = await fetch(`/api/qr/${qrId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) setStatus(next)
  }

  async function archiveQR() {
    if (!confirm('Archiver définitivement ce QR code ?')) return
    await fetch(`/api/qr/${qrId}`, { method: 'DELETE' })
    window.location.href = '/dashboard'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
      <h2 className="text-sm font-bold text-[#041B4D]">Paramètres du QR</h2>

      {/* QR Jamais mort */}
      <div className="border border-orange-100 rounded-xl p-4 bg-orange-50">
        <div className="flex items-center gap-2 mb-2">
          <Link2 size={14} className="text-[#FF6A00]" />
          <p className="text-sm font-semibold text-[#FF6A00]">QR jamais mort</p>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Si ce QR expire ou est mis en pause, les scanners seront redirigés vers cette URL au lieu d&apos;une page d&apos;erreur.
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={fallbackUrl}
            onChange={(e) => setFallbackUrl(e.target.value)}
            placeholder="https://votre-site.com/page-de-remplacement"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40"
          />
          <button
            onClick={saveFallback}
            disabled={saving}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
          >
            {saving ? '…' : saved ? '✅' : 'Sauver'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {fallbackUrl && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <Shield size={10} /> QR protégé — les scanners seront toujours redirigés
          </p>
        )}
      </div>

      {/* UTM Parameters */}
      <div className="border border-blue-100 rounded-xl p-4 bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 size={14} className="text-blue-600" />
          <p className="text-sm font-semibold text-blue-700">Paramètres UTM</p>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Ajoutez automatiquement des paramètres UTM à chaque scan pour suivre vos campagnes dans Google Analytics.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {([
            { key: 'source',   label: 'Source',   placeholder: 'ex: qrcode' },
            { key: 'medium',   label: 'Medium',   placeholder: 'ex: print' },
            { key: 'campaign', label: 'Campagne', placeholder: 'ex: promo2025' },
            { key: 'content',  label: 'Contenu',  placeholder: 'ex: flyer-a4' },
          ] as const).map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                type="text"
                value={utm[key]}
                onChange={(e) => setUtm((u) => ({ ...u, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveUtm}
          disabled={utmSaving}
          className="w-full py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #041B4D, #1a3a7a)' }}
        >
          {utmSaving ? '…' : utmSaved ? '✅ UTM sauvegardés' : 'Sauvegarder UTM'}
        </button>
        {utm.source && utm.medium && utm.campaign && (
          <p className="text-xs text-blue-600 mt-2 break-all font-mono">
            ?utm_source={utm.source}&utm_medium={utm.medium}&utm_campaign={utm.campaign}
          </p>
        )}
      </div>

      {/* Pixels de tracking */}
      <div className="border border-purple-100 rounded-xl p-4 bg-purple-50">
        <div className="flex items-center gap-2 mb-2">
          <Eye size={14} className="text-purple-600" />
          <p className="text-sm font-semibold text-purple-700">Pixels de tracking</p>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Chaque scan déclenchera vos pixels — idéal pour le retargeting publicitaire.
        </p>
        <div className="space-y-2 mb-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <span className="text-blue-600 font-bold">f</span> Meta Pixel ID
            </label>
            <input
              type="text"
              value={pixels.meta_pixel_id}
              onChange={(e) => setPixels((p) => ({ ...p, meta_pixel_id: e.target.value }))}
              placeholder="ex: 1234567890123456"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <span className="text-orange-500 font-bold">G</span> Google Tag (gtag)
            </label>
            <input
              type="text"
              value={pixels.gtag_id}
              onChange={(e) => setPixels((p) => ({ ...p, gtag_id: e.target.value }))}
              placeholder="ex: G-XXXXXXXXXX ou AW-XXXXXXXXX"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <span className="font-bold" style={{ color: '#010101' }}>♪</span> TikTok Pixel ID
            </label>
            <input
              type="text"
              value={pixels.tiktok_pixel_id}
              onChange={(e) => setPixels((p) => ({ ...p, tiktok_pixel_id: e.target.value }))}
              placeholder="ex: CXXXXXXXXXXXXXXXXX"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>
        <button
          onClick={savePixels}
          disabled={pixelsSaving}
          className="w-full py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          {pixelsSaving ? '…' : pixelsSaved ? '✅ Pixels sauvegardés' : 'Sauvegarder les pixels'}
        </button>
      </div>

      {/* Pause / Reprise */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {status === 'active' ? '⚡ QR actif' : '⏸️ QR en pause'}
          </p>
          <p className="text-xs text-gray-400">
            {status === 'active' ? 'Les scans sont comptabilisés' : 'Les scans sont bloqués'}
          </p>
        </div>
        <button
          onClick={toggleStatus}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            status === 'active'
              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
              : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
          }`}
        >
          {status === 'active' ? <><Pause size={12} /> Mettre en pause</> : <><Play size={12} /> Réactiver</>}
        </button>
      </div>

      {/* Archive */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">🗑️ Archiver</p>
          <p className="text-xs text-gray-400">Action irréversible</p>
        </div>
        <button
          onClick={archiveQR}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
        >
          <Trash2 size={12} /> Archiver
        </button>
      </div>
    </div>
  )
}
