'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  ticketCode: string
  accentColor: string
}

export default function ValidateButton({ ticketCode, accentColor }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleValidate() {
    if (!confirm('Marquer ce billet comme utilisé ?')) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/ticket/${ticketCode}/validate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur de validation')
      } else {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 text-center">{error}</div>
      )}
      <button
        onClick={handleValidate}
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-opacity"
        style={{ background: accentColor }}
      >
        {loading ? 'Validation…' : '✅ Valider ce billet (organisateur)'}
      </button>
    </div>
  )
}
