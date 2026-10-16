'use client'
import { useState } from 'react'

const PLANS = ['free', 'essential', 'pro', 'business', 'agency', 'enterprise']

export default function AdminUserActions({ userId, currentPlan, currentCredits }: {
  userId: string; currentPlan: string; currentCredits: number
}) {
  const [plan, setPlan] = useState(currentPlan)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function callAdmin(action: string, body: object) {
    setLoading(action)
    setMsg('')
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, ...body }),
      })
      const d = await res.json()
      if (!res.ok) setMsg(`❌ ${d.error}`)
      else { setMsg(`✅ ${d.message}`); if (action === 'credits') setCredits(0) }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase">Actions admin</h3>

      {msg && (
        <div className={`text-xs p-2.5 rounded-lg ${msg.startsWith('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {msg}
        </div>
      )}

      {/* Change plan */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Changer le plan</p>
        <div className="flex gap-2">
          <select value={plan} onChange={(e) => setPlan(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#FF6A00]">
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button
            onClick={() => callAdmin('plan', { plan })}
            disabled={loading === 'plan' || plan === currentPlan}
            className="px-3 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity whitespace-nowrap"
          >
            {loading === 'plan' ? '…' : 'Appliquer'}
          </button>
        </div>
      </div>

      {/* Add/remove credits */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Ajouter / retirer des crédits</p>
        <p className="text-[10px] text-gray-600 mb-1.5">Solde actuel : <span className="text-[#FF6A00] font-bold">{currentCredits.toLocaleString('fr-FR')}</span></p>
        <div className="flex gap-2">
          <input
            type="number"
            value={credits || ''}
            onChange={(e) => setCredits(Number(e.target.value))}
            placeholder="ex: 100 ou -50"
            className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#FF6A00]"
          />
          <button
            onClick={() => callAdmin('credits', { amount: credits })}
            disabled={loading === 'credits' || !credits}
            className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity whitespace-nowrap"
          >
            {loading === 'credits' ? '…' : credits < 0 ? 'Retirer' : 'Ajouter'}
          </button>
        </div>
      </div>

      {/* Quick credit buttons */}
      <div>
        <p className="text-xs text-gray-600 mb-1.5">Ajouter rapidement</p>
        <div className="flex gap-1.5 flex-wrap">
          {[50, 100, 200, 500, 1000].map((n) => (
            <button key={n}
              onClick={() => callAdmin('credits', { amount: n })}
              disabled={!!loading}
              className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-bold hover:bg-blue-500/20 disabled:opacity-40 transition-colors"
            >
              +{n}
            </button>
          ))}
        </div>
      </div>

      {/* Reset subscription */}
      <div className="pt-2 border-t border-gray-800">
        <button
          onClick={() => callAdmin('reset_subscription', {})}
          disabled={!!loading}
          className="w-full py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg hover:bg-red-500/20 disabled:opacity-40 transition-colors"
        >
          {loading === 'reset_subscription' ? '…' : '⚠️ Réinitialiser abonnement'}
        </button>
      </div>
    </div>
  )
}
