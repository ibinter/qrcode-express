'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function LoyaltyPage() {
  const params = useParams()
  const id = params.id as string
  const [qrData, setQrData] = useState<Record<string, unknown> | null>(null)
  const [stamps, setStamps] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stamped, setStamped] = useState(false)

  useEffect(() => {
    fetch(`/api/loyalty/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setQrData(d.card)
        setStamps(d.stamps ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function addStamp() {
    setStamped(true)
    const res = await fetch(`/api/loyalty/${id}/stamp`, { method: 'POST' })
    const data = await res.json()
    setStamps(data.stamps ?? stamps + 1)
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center"><p className="text-2xl animate-spin">🪙</p><p className="text-sm text-gray-500 mt-2">Chargement…</p></div>
    </main>
  )

  if (!qrData) return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center"><p className="text-4xl mb-3">😕</p><p className="font-bold text-[#041B4D]">Carte introuvable</p></div>
    </main>
  )

  const card = qrData as Record<string, unknown>
  const color = (card.color as string) || '#041B4D'
  const total = (card.total_stamps as number) || 10
  const pct = Math.min(Math.round((stamps / total) * 100), 100)
  const completed = stamps >= total

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-3xl text-white text-center p-8 shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
          {card.logo && <img src={card.logo as string} alt="logo" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3" />}
          <p className="text-4xl mb-2">🪙</p>
          <h1 className="text-2xl font-extrabold">{card.name as string}</h1>
          {card.description && <p className="text-sm opacity-80 mt-1">{card.description as string}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <p className="font-bold text-[#041B4D]">Mes tampons</p>
            <span className="text-2xl font-extrabold" style={{ color }}>{stamps} / {total}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
            <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-lg transition-all ${i < stamps ? 'scale-110' : 'bg-gray-100'}`}
                style={i < stamps ? { background: color } : {}}>
                {i < stamps ? '✓' : ''}
              </div>
            ))}
          </div>
        </div>

        {completed ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-bold text-green-700 text-lg">Félicitations !</p>
            <p className="text-sm text-green-600 mt-1">{card.reward_text as string || 'Votre récompense est débloquée !'}</p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-amber-700">
              🎁 Encore {total - stamps} tampon{total - stamps > 1 ? 's' : ''} pour : <span className="font-bold">{card.reward_text as string}</span>
            </p>
          </div>
        )}

        {!stamped && !completed && (
          <button onClick={addStamp}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            🪙 Tamponner ma carte
          </button>
        )}
        {stamped && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-700">✅ Tampon ajouté !</p>
          </div>
        )}
      </div>
    </main>
  )
}
