'use client'
import { useState } from 'react'
import { Bell, BellOff, Check, Loader2 } from 'lucide-react'

interface Props {
  qrId: string
  initialEmail: string
  userEmail: string
}

export default function ScanNotificationToggle({ qrId, initialEmail, userEmail }: Props) {
  const [email, setEmail] = useState(initialEmail || userEmail)
  const [enabled, setEnabled] = useState(!!initialEmail)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async (newEnabled: boolean, newEmail: string) => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/qr/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrId, email: newEnabled ? newEmail : null }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enabled ? <Bell size={16} className="text-[#FF6A00]" /> : <BellOff size={16} className="text-gray-400" />}
          <span className="text-sm font-medium text-gray-700">
            {enabled ? 'Notifications activées' : 'Notifications désactivées'}
          </span>
        </div>
        <button
          onClick={() => { const next = !enabled; setEnabled(next); save(next, email) }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-[#FF6A00]' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {enabled && (
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6A00]"
          />
          <button
            onClick={() => save(true, email)}
            disabled={saving || !email}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            style={{ background: saved ? '#059669' : 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
            {saved ? 'Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>
      )}
    </div>
  )
}
