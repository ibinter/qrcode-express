'use client'
import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 20, suffix: '+', label: 'types de QR codes', icon: '📱' },
  { value: 30, suffix: 's', label: 'pour créer un QR', icon: '⚡' },
  { value: 100, suffix: '%', label: 'sans filigrane', icon: '✨' },
  { value: 0, suffix: ' FCFA', label: 'pour commencer', icon: '🎁' },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const duration = 1200
        const steps = 40
        const step = target / steps
        let current = 0
        const timer = setInterval(() => {
          current = Math.min(current + step, target)
          setCount(Math.floor(current))
          if (current >= target) clearInterval(timer)
        }, duration / steps)
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function StatsBar() {
  return (
    <section className="bg-white border-b border-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl mb-1">{s.icon}</span>
            <p className="text-3xl md:text-4xl font-extrabold text-[#041B4D]">
              <Counter target={s.value} suffix={s.suffix} />
            </p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
