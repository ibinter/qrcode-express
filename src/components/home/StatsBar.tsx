'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

const STATS_META = [
  { value: 26, suffix: '', key: 'barcodes', icon: '📊', color: '#3b82f6' },
  { value: 31, suffix: '', key: 'labels_count', icon: '🏷️', color: '#a855f7' },
  { value: 33, suffix: '', key: 'qrtypes', icon: '📱', color: '#FF6A00' },
  { value: 0, suffix: ' FCFA', key: 'free', icon: '🎁', color: '#10b981' },
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
        const duration = 1400
        const steps = 50
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
  const t = useTranslations('stats')
  return (
    <section className="relative py-10 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #041B4D 0%, #0d2d6e 60%, #041B4D 100%)' }}>
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
        {STATS_META.map((s, i) => (
          <div key={s.key} className={`flex flex-col items-center gap-1 py-4 ${i < STATS_META.length - 1 ? 'md:border-r md:border-white/10' : ''}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-1"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              {s.icon}
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-white">
              <Counter target={s.value} suffix={s.suffix} />
            </p>
            <p className="text-xs text-blue-300 font-medium text-center">{t(s.key as any)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
