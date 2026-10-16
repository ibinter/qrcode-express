'use client'
import { useState } from 'react'

export default function AdminQRAction({ qrId, currentStatus }: { qrId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function update(newStatus: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'qr_status', qrId, status: newStatus }),
      })
      if (res.ok) setStatus(newStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-1">
      {status !== 'active' && (
        <button onClick={() => update('active')} disabled={loading}
          className="text-[10px] px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded font-bold hover:bg-green-500/20 disabled:opacity-40">
          Activer
        </button>
      )}
      {status === 'active' && (
        <button onClick={() => update('paused')} disabled={loading}
          className="text-[10px] px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded font-bold hover:bg-yellow-500/20 disabled:opacity-40">
          Pause
        </button>
      )}
      {status !== 'archived' && (
        <button onClick={() => update('archived')} disabled={loading}
          className="text-[10px] px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-bold hover:bg-red-500/20 disabled:opacity-40">
          Archiver
        </button>
      )}
    </div>
  )
}
