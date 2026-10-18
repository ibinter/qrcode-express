'use client'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

type FeatureItem = { icon: string; title: string; desc: string; color: string; bg: string }

function FeatureCard({ f, delay }: { f: FeatureItem; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(32px)'
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          el.style.transition = 'opacity .6s ease, transform .6s ease'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }, delay)
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: f.bg }}>
        {f.icon}
      </div>
      <div>
        <h3 className="font-bold text-[#041B4D] mb-1 text-base">{f.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
      </div>
    </div>
  )
}

const FEATURE_KEYS = [
  { icon: '📊', color: '#041B4D', bg: '#EEF2FF', titleKey: 'barcode_title', descKey: 'barcode_desc' },
  { icon: '🏷️', color: '#8b5cf6', bg: '#F5F3FF', titleKey: 'labels_title', descKey: 'labels_desc' },
  { icon: '🎟️', color: '#7c3aed', bg: '#F5F3FF', titleKey: 'ticketing_title', descKey: 'ticketing_desc' },
  { icon: '💳', color: '#16a34a', bg: '#F0FDF4', titleKey: 'payment_title', descKey: 'payment_desc' },
  { icon: '📋', color: '#0ea5e9', bg: '#F0F9FF', titleKey: 'forms_title', descKey: 'forms_desc' },
  { icon: '🏢', color: '#041B4D', bg: '#EEF2FF', titleKey: 'orgs_title', descKey: 'orgs_desc' },
  { icon: '🎁', color: '#FF6A00', bg: '#FFF7ED', titleKey: 'referral_title', descKey: 'referral_desc' },
  { icon: '🎨', color: '#ec4899', bg: '#FDF2F8', titleKey: 'design_title', descKey: 'design_desc' },
  { icon: '⚡', color: '#3b82f6', bg: '#EFF6FF', titleKey: 'dynamic_title', descKey: 'dynamic_desc' },
  { icon: '📈', color: '#10b981', bg: '#ECFDF5', titleKey: 'analytics_title', descKey: 'analytics_desc' },
  { icon: '🍽️', color: '#f97316', bg: '#FFF7ED', titleKey: 'menu_title', descKey: 'menu_desc' },
  { icon: '💬', color: '#25d366', bg: '#F0FDF4', titleKey: 'whatsapp_title', descKey: 'whatsapp_desc' },
  { icon: '🪪', color: '#8b5cf6', bg: '#F5F3FF', titleKey: 'vcard_title', descKey: 'vcard_desc' },
  { icon: '✨', color: '#7c3aed', bg: '#F5F3FF', titleKey: 'ai_title', descKey: 'ai_desc' },
  { icon: '📥', color: '#f59e0b', bg: '#FFFBEB', titleKey: 'bulk_title', descKey: 'bulk_desc' },
  { icon: '🖨️', color: '#0ea5e9', bg: '#F0F9FF', titleKey: 'print_title', descKey: 'print_desc' },
  { icon: '🌍', color: '#0891b2', bg: '#ECFEFF', titleKey: 'multilingual_title', descKey: 'multilingual_desc' },
  { icon: '🔒', color: '#64748b', bg: '#F8FAFC', titleKey: 'security_title', descKey: 'security_desc' },
  { icon: '📱', color: '#ec4899', bg: '#FDF2F8', titleKey: 'social_title', descKey: 'social_desc' },
  { icon: '🪙', color: '#f59e0b', bg: '#FFFBEB', titleKey: 'loyalty_title', descKey: 'loyalty_desc' },
  { icon: '📆', color: '#6366f1', bg: '#EEF2FF', titleKey: 'appointment_title', descKey: 'appointment_desc' },
  { icon: '🎨', color: '#8b5cf6', bg: '#F5F3FF', titleKey: 'themes_title', descKey: 'themes_desc' },
]

export default function Features() {
  const t = useTranslations('features')
  const ti = useTranslations('features.items')
  return (
    <section className="relative py-20 px-4 bg-gray-50 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #041B4D 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-50 text-[#041B4D] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-blue-100">
            {t('badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
            {t('title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Top 3 features — premium highlighted cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {FEATURE_KEYS.slice(0, 3).map((f) => (
            <div key={f.titleKey}
              className="relative bg-white rounded-2xl p-6 flex flex-col gap-4 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              style={{ boxShadow: `0 4px 24px ${f.color}18, 0 1px 4px rgba(0,0,0,0.06)` }}>
              {/* Colored top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: f.color }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm mt-1"
                style={{ background: f.bg }}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-[#041B4D] mb-2 text-base leading-snug">{ti(f.titleKey as any)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{ti(f.descKey as any)}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full self-start"
                style={{ background: f.bg, color: f.color }}>
                {t('new')}
              </span>
            </div>
          ))}
        </div>

        {/* Remaining features — 3-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURE_KEYS.slice(3).map((f, i) => (
            <FeatureCard
              key={f.titleKey}
              f={{ icon: f.icon, title: ti(f.titleKey as any), desc: ti(f.descKey as any), color: f.color, bg: f.bg }}
              delay={i * 60}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
