'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orgId: string
  initialName: string
  initialLogoUrl: string
}

export default function OrgSettingsForm({ orgId, initialName, initialLogoUrl }: Props) {
  const [name, setName] = useState(initialName)
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch(`/api/org/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), logo_url: logoUrl.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Erreur')
      else { setSuccess(true); router.refresh() }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer définitivement cette organisation ? Cette action est irréversible.')) return
    setDeleting(true)
    try {
      await fetch(`/api/org/${orgId}`, { method: 'DELETE' })
      router.push('/org')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">Modifications enregistrées ✅</div>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de l&apos;organisation</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/30"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Logo (URL)</label>
        <input
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/30"
        />
      </div>
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#041B4D] disabled:opacity-50 hover:bg-[#041B4D]/90 transition-opacity"
      >
        {saving ? 'Sauvegarde…' : 'Enregistrer'}
      </button>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-red-600 mb-2">Zone dangereuse</p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? 'Suppression…' : '🗑️ Supprimer l\'organisation'}
        </button>
      </div>
    </form>
  )
}
