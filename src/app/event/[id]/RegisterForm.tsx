'use client'
import { useState } from 'react'

interface Props {
  eventId: string
  eventName: string
  price: number
  accentColor: string
}

export default function RegisterForm({ eventId, eventName, price, accentColor }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [ticket, setTicket] = useState<{ code: string } | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/event/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
      } else {
        setTicket(data.ticket)
      }
    } finally {
      setLoading(false)
    }
  }

  if (ticket) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-4">
        <p className="text-4xl">🎉</p>
        <h2 className="text-lg font-bold text-[#041B4D]">Inscription confirmée !</h2>
        <p className="text-sm text-gray-600">
          Bonjour <strong>{name}</strong>, votre place pour <strong>{eventName}</strong> est réservée.
        </p>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Votre code billet</p>
          <p className="text-xl font-mono font-bold tracking-widest text-[#041B4D]">{ticket.code}</p>
        </div>
        <a
          href={`/ticket/${ticket.code}`}
          className="block w-full py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: accentColor }}
        >
          Voir mon billet →
        </a>
        <p className="text-xs text-gray-400">Présentez ce billet à l&apos;entrée.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
      <h2 className="text-base font-bold text-[#041B4D]">S&apos;inscrire à l&apos;événement</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom complet *"
        required
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre adresse e-mail *"
        required
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Téléphone (optionnel)"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
      />

      <button
        type="submit"
        disabled={loading || !name.trim() || !email.trim()}
        className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-opacity"
        style={{ background: accentColor }}
      >
        {loading ? 'Inscription en cours…' : price > 0 ? `Réserver — ${price.toLocaleString('fr-FR')} FCFA` : 'Réserver ma place gratuite'}
      </button>
    </form>
  )
}
