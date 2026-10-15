'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewOrgForm() {
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), logo_url: logoUrl.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création')
      } else {
        router.push(`/org/${data.org.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Nom de l&apos;organisation <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: IBIG SOFT, Agence XYZ…"
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/30"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Logo (URL, optionnel)</label>
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
        disabled={loading || !name.trim()}
        className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#041B4D] disabled:opacity-50 hover:bg-[#041B4D]/90 transition-opacity"
      >
        {loading ? 'Création…' : 'Créer l\'organisation'}
      </button>
    </form>
  )
}
