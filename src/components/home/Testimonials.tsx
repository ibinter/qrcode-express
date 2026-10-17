'use client'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

const TESTIMONIALS = [
  { name: 'Kouamé Brou',        avatar: 'KB', color: '#FF6A00', stars: 5 },
  { name: 'Fatou Diallo',       avatar: 'FD', color: '#7c3aed', stars: 5 },
  { name: 'Ama Konan',          avatar: 'AK', color: '#ec4899', stars: 5 },
  { name: 'Moussa Ouédraogo',   avatar: 'MO', color: '#0ea5e9', stars: 5 },
  { name: 'Ibrahim Koné',       avatar: 'IK', color: '#16a34a', stars: 5 },
  { name: 'Mariam Traoré',      avatar: 'MT', color: '#8b5cf6', stars: 5 },
]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="text-yellow-400 text-sm">★</span>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const t = useTranslations('testimonials')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cards = el.querySelectorAll<HTMLElement>('.tcard')
    cards.forEach((c) => { c.style.opacity = '0'; c.style.transform = 'translateY(24px)' })
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        cards.forEach((c, i) => {
          setTimeout(() => {
            c.style.transition = 'opacity .5s ease, transform .5s ease'
            c.style.opacity = '1'
            c.style.transform = 'translateY(0)'
          }, i * 80)
        })
        observer.disconnect()
      }
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-20 px-4 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="text-center mb-14">
          <span className="inline-block bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-yellow-100">
            {t('badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
            {t('title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((item, i) => (
            <div key={item.name} className="tcard bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              {/* Quote mark */}
              <div className="text-4xl font-black leading-none" style={{ color: item.color + '33' }}>"</div>

              {/* Stars */}
              <Stars n={item.stars} />

              {/* Text */}
              <p className="text-sm text-gray-600 leading-relaxed flex-1 -mt-2">
                {t(`t${i}_text` as any)}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}bb)` }}>
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#041B4D] leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t(`t${i}_role` as any)}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: item.color }}>📍 {t(`t${i}_city` as any)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating summary */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
          <div>
            <p className="text-5xl font-black text-[#041B4D]">4.9</p>
            <Stars n={5} />
            <p className="text-xs text-gray-400 mt-1">{t('rating_label')}</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-gray-100" />
          <div>
            <p className="text-5xl font-black text-[#041B4D]">500+</p>
            <p className="text-sm font-semibold text-gray-500">{t('qr_label')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('qr_sub')}</p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-gray-100" />
          <div>
            <p className="text-5xl font-black text-[#041B4D]">98%</p>
            <p className="text-sm font-semibold text-gray-500">{t('satisfied_label')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('satisfied_sub')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
