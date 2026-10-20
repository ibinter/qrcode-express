'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface Props {
  initialCount?: number
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'k'
  return n.toLocaleString('fr-FR')
}

export default function VisitCounter({ initialCount = 3255 }: Props) {
  const [count, setCount] = useState(initialCount)
  const [animated, setAnimated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let ignore = false
    async function track() {
      try {
        const res = await fetch('/api/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer,
          }),
        })
        if (!res.ok || ignore) return
        const data = await res.json()
        if (data.count > 0) {
          setCount(data.count)
          setAnimated(true)
          setTimeout(() => setAnimated(false), 600)
        }
      } catch {}
    }
    track()
    return () => { ignore = true }
  }, [pathname])

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
      </span>
      <span className="text-xs text-blue-300">
        <span
          className={`font-bold text-white transition-all duration-300 ${animated ? 'scale-110 text-[#FF6A00]' : ''}`}
          style={{ display: 'inline-block' }}
        >
          {formatCount(count)}
        </span>
        {' '}visiteurs
      </span>
    </div>
  )
}
