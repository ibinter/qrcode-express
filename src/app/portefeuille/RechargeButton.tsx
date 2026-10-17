'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  packId: string
  amount: number
  credits: number
}

export default function RechargeButton({ packId, amount, credits }: Props) {
  const t = useTranslations('wallet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRecharge() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: packId }),
      })
      const data = await res.json()
      if (!res.ok || !data.payment_url) {
        setError(data.error || t('pay_error'))
        return
      }
      window.location.href = data.payment_url
    } catch {
      setError(t('network_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleRecharge}
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        {loading ? t('redirecting') : t('pay_btn')}
      </button>
      {error && <p className="text-xs text-red-500 mt-1 text-center">{error}</p>}
    </div>
  )
}
