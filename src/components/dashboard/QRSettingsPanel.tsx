'use client'
import { useState } from 'react'
import { Shield, Link2, Pause, Play, Trash2 } from 'lucide-react'

interface Props {
  qrId: string
  initialFallbackUrl: string
  initialStatus: string
}

export default function QRSettingsPanel({ qrId, initialFallbackUrl, initialStatus }: Props) {
  const [fallbackUrl, setFallbackUrl] = useState(initialFallbackUrl || '')
  const [status, setStatus] = useState(initialStatus)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

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
