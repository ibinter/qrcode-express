'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function DownloadPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    fetch(`/api/download/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.needs_password) { setNeedsPassword(true) } else { setData(d.file) }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function unlock() {
    const res = await fetch(`/api/download/${id}?password=${encodeURIComponent(password)}`)
    const d = await res.json()
    if (d.file) { setData(d.file); setNeedsPassword(false) } else { setPasswordError(true) }
  }

  async function doDownload() {
    await fetch(`/api/download/${id}/track`, { method: 'POST' })
    setDownloaded(true)
    window.location.href = data!.file_url as string
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center"><p className="text-2xl animate-spin">⬇️</p></main>

  const color = (data?.color as string) || '#041B4D'

  if (needsPassword) return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-3xl text-white text-center p-8 shadow-lg" style={{ background: `linear-gradient(135deg, #041B4D, #041B4Dcc)` }}>
          <p className="text-5xl mb-3">🔒</p>
          <h1 className="text-xl font-extrabold">Fichier protégé</h1>
          <p className="text-sm opacity-80 mt-1">Saisissez le mot de passe pour accéder au téléchargement</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(false) }}
            className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 ${passwordError ? 'border-red-400' : 'border-gray-200'}`} />
          {passwordError && <p className="text-xs text-red-500">Mot de passe incorrect</p>}
          <button onClick={unlock} className="w-full py-3 rounded-xl text-white font-bold text-sm" style={{ background: '#041B4D' }}>Déverrouiller</button>
        </div>
      </div>
    </main>
  )

  if (!data) return <main className="min-h-screen flex items-center justify-center px-4"><div className="text-center"><p className="text-4xl mb-3">😕</p><p className="font-bold text-[#041B4D]">Fichier introuvable</p></div></main>

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-3xl text-white text-center p-8 shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          <p className="text-5xl mb-3">⬇️</p>
          <h1 className="text-2xl font-extrabold">{data.title as string}</h1>
          {data.description && <p className="text-sm opacity-80 mt-1">{data.description as string}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          {data.file_name && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}15` }}>📄</div>
              <div>
                <p className="font-semibold text-sm text-[#041B4D]">{data.file_name as string}</p>
                {data.file_size && <p className="text-xs text-gray-400">{data.file_size as string}</p>}
              </div>
            </div>
          )}
        </div>

        {downloaded ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-700">✅ Téléchargement démarré !</p>
          </div>
        ) : (
          <button onClick={doDownload}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            {(data.button_label as string) || '⬇️ Télécharger'}
          </button>
        )}
      </div>
    </main>
  )
}
