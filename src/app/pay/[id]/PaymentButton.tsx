'use client'
import { useState } from 'react'

interface Props {
  qrId: string
  fixedAmount: number
  customAmount: boolean
  accentColor: string
}

export default function PaymentButton({ qrId, fixedAmount, customAmount, accentColor }: Props) {
  const [amount, setAmount] = useState(fixedAmount || 0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    if (!amount || amount < 100) {
      setError('Montant minimum : 100 FCFA')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/pay/${qrId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, payer_name: name, payer_phone: phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'initialisation du paiement.')
      } else if (data.payment_url) {
        window.location.href = data.payment_url
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="text-base font-bold text-[#041B4D]">Effectuer le paiement</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {customAmount && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Montant (FCFA) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={100}
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="ex: 5000"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
          />
        </div>
      )}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom (optionnel)"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Votre numéro Mobile Money"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
      />

      {!customAmount && fixedAmount > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold" style={{ color: accentColor }}>
            {fixedAmount.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading || !amount || amount < 100}
        className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        style={{ background: accentColor }}
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <>💳 Payer {amount > 0 ? `${amount.toLocaleString('fr-FR')} FCFA` : ''}</>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Paiement sécurisé via GeniusPay · Wave · Orange Money · MTN MoMo
      </p>
    </div>
  )
}
