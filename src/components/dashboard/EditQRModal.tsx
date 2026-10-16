'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

interface QRRow { id: string; name: string; type: string; mode: string; content: string; slug?: string }

interface Props {
  qr: QRRow
  onClose: () => void
  onSaved: (id: string, name: string, content: string) => void
}

export default function EditQRModal({ qr, onClose, onSaved }: Props) {
  const isDynamic = ['menu', 'coupon', 'biolink', 'vcard_plus', 'catalog', 'review', 'event', 'lead', 'payment'].includes(qr.type)
  const [name, setName] = useState(qr.name)
  const [content, setContent] = useState(qr.content)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // For dynamic types, edit the JSON prettily
  const [jsonText, setJsonText] = useState(() => {
    try { return JSON.stringify(JSON.parse(qr.content), null, 2) } catch { return qr.content }
  })

  async function handleSave() {
    setSaving(true)
    setError('')
    const finalContent = isDynamic ? (() => { try { return JSON.stringify(JSON.parse(jsonText)) } catch { return jsonText } })() : content
    const res = await fetch(`/api/qr/${qr.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: finalContent, name }),
    })
    if (!res.ok) { setError('Erreur lors de la sauvegarde'); setSaving(false); return }
    onSaved(qr.id, name, finalContent)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#041B4D]">Modifier le QR</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nom</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          </div>

          {isDynamic ? (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Données JSON ({qr.type})
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={12}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40"
              />
              <p className="text-xs text-gray-400 mt-1">Éditez le JSON directement. L'URL du QR reste identique.</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Contenu</label>
              <input value={content} onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
