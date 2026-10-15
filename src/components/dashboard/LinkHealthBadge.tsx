'use client'
import { useState } from 'react'

interface HealthData {
  status: 'ok' | 'broken' | 'redirect' | 'unknown'
  http_status?: number
  checked_at?: string
}

interface Props {
  qrId: string
  url: string
  initialHealth?: HealthData | null
  compact?: boolean
}

const STATUS_CONFIG = {
  ok:       { dot: 'bg-green-500',  label: 'Lien actif',    icon: '✅', color: 'text-green-700 bg-green-50 border-green-200' },
  redirect: { dot: 'bg-yellow-400', label: 'Redirection',   icon: '↪️', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  broken:   { dot: 'bg-red-500',    label: 'Lien cassé',    icon: '🔴', color: 'text-red-700 bg-red-50 border-red-200' },
  unknown:  { dot: 'bg-gray-300',   label: 'Non vérifié',   icon: '⚪', color: 'text-gray-500 bg-gray-50 border-gray-200' },
}

export default function LinkHealthBadge({ qrId, url, initialHealth, compact = false }: Props) {
  const [health, setHealth] = useState<HealthData>(initialHealth ?? { status: 'unknown' })
  const [checking, setChecking] = useState(false)

  async function check() {
    if (checking) return
    setChecking(true)
    try {
      const res = await fetch('/api/link-health/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_id: qrId, url }),
      })
      if (res.ok) {
        const data = await res.json()
        setHealth(data)
      }
    } finally {
      setChecking(false)
    }
  }

  const cfg = STATUS_CONFIG[health.status]

  if (compact) {
    return (
      <button
        onClick={check}
        disabled={checking}
        title={`${cfg.label}${health.checked_at ? ` — vérifié ${new Date(health.checked_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}`}
        className="flex items-center gap-1"
      >
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${checking ? 'bg-blue-400 animate-pulse' : cfg.dot}`} />
      </button>
    )
  }

  return (
    <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${cfg.color}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${checking ? 'bg-blue-400 animate-pulse' : cfg.dot}`} />
        <div>
          <p className="text-xs font-semibold">{checking ? 'Vérification…' : cfg.label}</p>
          {health.checked_at && (
            <p className="text-xs opacity-70">
              Vérifié {new Date(health.checked_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {health.http_status ? ` · HTTP ${health.http_status}` : ''}
            </p>
          )}
          {!health.checked_at && <p className="text-xs opacity-70">Jamais vérifié</p>}
        </div>
      </div>
      <button
        onClick={check}
        disabled={checking}
        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/60 hover:bg-white transition-colors disabled:opacity-50"
      >
        {checking ? '…' : 'Vérifier'}
      </button>
    </div>
  )
}
