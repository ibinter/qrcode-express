'use client'
import { useState, Suspense } from 'react'
import { useParams } from 'next/navigation'

function QRPasswordForm() {
  const { slug } = useParams<{ slug: string }>()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/qr/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Mot de passe incorrect')
      setLoading(false)
      return
    }

    window.location.href = data.destination
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-xl font-bold text-[#041B4D] mb-1">QR code protégé</h1>
        <p className="text-sm text-gray-500 mb-6">Entrez le mot de passe pour accéder au contenu</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #041B4D, #1a3a7a)' }}
          >
            {loading ? 'Vérification…' : 'Accéder'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function QRPasswordPage() {
  return (
    <Suspense>
      <QRPasswordForm />
    </Suspense>
  )
}
