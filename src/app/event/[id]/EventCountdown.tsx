'use client'
import { useEffect, useState } from 'react'

export default function EventCountdown({ dateStr, accentColor }: { dateStr: string; accentColor: string }) {
  const [diff, setDiff] = useState<{ d: number; h: number; m: number; s: number } | null>(null)
  const [past, setPast] = useState(false)

  useEffect(() => {
    function compute() {
      const now = Date.now()
      const target = new Date(dateStr).getTime()
      const delta = target - now
      if (delta <= 0) { setPast(true); return }
      setDiff({
        d: Math.floor(delta / 86400000),
        h: Math.floor((delta % 86400000) / 3600000),
        m: Math.floor((delta % 3600000) / 60000),
        s: Math.floor((delta % 60000) / 1000),
      })
    }
    compute()
    const t = setInterval(compute, 1000)
    return () => clearInterval(t)
  }, [dateStr])

  if (past) return <p className="text-xs text-center text-red-400 font-semibold">Événement passé</p>
  if (!diff) return null

  const box = "flex flex-col items-center gap-0.5"
  const num = "text-2xl font-black leading-none"
  const lbl = "text-xs opacity-70"
  const sep = "text-xl font-black opacity-40 mt-1"

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className={box}><span className={num} style={{ color: accentColor }}>{String(diff.d).padStart(2,'0')}</span><span className={lbl}>jours</span></div>
      <span className={sep}>:</span>
      <div className={box}><span className={num} style={{ color: accentColor }}>{String(diff.h).padStart(2,'0')}</span><span className={lbl}>heures</span></div>
      <span className={sep}>:</span>
      <div className={box}><span className={num} style={{ color: accentColor }}>{String(diff.m).padStart(2,'0')}</span><span className={lbl}>min</span></div>
      <span className={sep}>:</span>
      <div className={box}><span className={num} style={{ color: accentColor }}>{String(diff.s).padStart(2,'0')}</span><span className={lbl}>sec</span></div>
    </div>
  )
}
