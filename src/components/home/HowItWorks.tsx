'use client'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

const STEP_ICONS = ['🎯', '🎨', '⬇️', '📊']
const STEP_KEYS = ['s1', 's2', 's3', 's4'] as const

export default function HowItWorks() {
  const t = useTranslations('howItWorks')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cards = el.querySelectorAll<HTMLElement>('.hiw-card')
    cards.forEach((c) => { c.style.opacity = '0'; c.style.transform = 'translateY(28px)' })
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        cards.forEach((c, i) => {
          setTimeout(() => {
            c.style.transition = 'opacity .6s ease, transform .6s ease'
            c.style.opacity = '1'
            c.style.transform = 'translateY(0)'
          }, i * 150)
        })
        observer.disconnect()
      }
    }, { threshold: 0.2 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative py-20 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #041B4D 0%, #0d2d6e 50%, #041B4D 100%)' }}>
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative max-w-5xl mx-auto" ref={ref}>
        <div className="text-center mb-14">
          <span className="inline-block bg-white/10 text-[#FF6A00] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-white/10">
            {t('badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-white">{t('title')}</h2>
          <p className="text-blue-200 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent hidden md:block" />

          {STEP_KEYS.map((key, i) => (
            <div key={key} className="hiw-card relative flex flex-col items-center text-center group">
              {/* Step number badge */}
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white z-10"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                {i + 1}
              </div>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.25)' }}>
                {STEP_ICONS[i]}
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">{t(`steps.${key}_title` as any)}</h3>
              <p className="text-blue-200/80 text-sm leading-relaxed max-w-xs">{t(`steps.${key}_desc` as any)}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <a
            href="#generateur"
            className="inline-block px-8 py-4 rounded-2xl font-bold text-white text-base shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)', boxShadow: '0 8px 32px rgba(255,106,0,0.4)' }}
          >
            {t('cta')}
          </a>
        </div>
      </div>
    </section>
  )
}
