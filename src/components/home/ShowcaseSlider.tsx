'use client'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'

const QR_TYPE_DATA: { icon: string; color: string; bg: string; tag: 'free' | 'dynamic' | 'pro'; nameKey: string; descKey: string; type: string }[] = [
  { icon: '🔗', color: '#041B4D', bg: '#EEF2FF', tag: 'free', nameKey: 'url_name', descKey: 'url_desc', type: 'url' },
  { icon: '🍽️', color: '#FF6A00', bg: '#FFF7ED', tag: 'dynamic', nameKey: 'menu_name', descKey: 'menu_desc', type: 'menu' },
  { icon: '🎟️', color: '#7c3aed', bg: '#F5F3FF', tag: 'dynamic', nameKey: 'ticketing_name', descKey: 'ticketing_desc', type: 'lead' },
  { icon: '💳', color: '#16a34a', bg: '#F0FDF4', tag: 'dynamic', nameKey: 'payment_name', descKey: 'payment_desc', type: 'payment' },
  { icon: '📋', color: '#0ea5e9', bg: '#F0F9FF', tag: 'dynamic', nameKey: 'form_name', descKey: 'form_desc', type: 'lead' },
  { icon: '🎫', color: '#10b981', bg: '#ECFDF5', tag: 'dynamic', nameKey: 'coupon_name', descKey: 'coupon_desc', type: 'coupon' },
  { icon: '💬', color: '#25d366', bg: '#F0FDF4', tag: 'free', nameKey: 'whatsapp_name', descKey: 'whatsapp_desc', type: 'whatsapp' },
  { icon: '🔗', color: '#8b5cf6', bg: '#F5F3FF', tag: 'dynamic', nameKey: 'biolink_name', descKey: 'biolink_desc', type: 'biolink' },
  { icon: '📶', color: '#3b82f6', bg: '#EFF6FF', tag: 'free', nameKey: 'wifi_name', descKey: 'wifi_desc', type: 'wifi' },
  { icon: '👤', color: '#ec4899', bg: '#FDF2F8', tag: 'pro', nameKey: 'vcard_plus_name', descKey: 'vcard_plus_desc', type: 'vcard_plus' },
  { icon: '🛍️', color: '#f97316', bg: '#FFF7ED', tag: 'dynamic', nameKey: 'catalog_name', descKey: 'catalog_desc', type: 'catalog' },
  { icon: '⭐', color: '#eab308', bg: '#FEFCE8', tag: 'dynamic', nameKey: 'review_name', descKey: 'review_desc', type: 'review' },
  { icon: '📄', color: '#ef4444', bg: '#FEF2F2', tag: 'pro', nameKey: 'pdf_name', descKey: 'pdf_desc', type: 'pdf' },
  { icon: '📍', color: '#f59e0b', bg: '#FFFBEB', tag: 'free', nameKey: 'location_name', descKey: 'location_desc', type: 'location' },
  { icon: '📲', color: '#0ea5e9', bg: '#F0F9FF', tag: 'pro', nameKey: 'app_name', descKey: 'app_desc', type: 'app' },
  { icon: '✉️', color: '#6366f1', bg: '#EEF2FF', tag: 'free', nameKey: 'email_name', descKey: 'email_desc', type: 'email' },
  { icon: '📅', color: '#d97706', bg: '#FFFBEB', tag: 'free', nameKey: 'event_name', descKey: 'event_desc', type: 'event' },
  { icon: '📱', color: '#ec4899', bg: '#FDF2F8', tag: 'free', nameKey: 'social_name', descKey: 'social_desc', type: 'social' },
  { icon: '🪪', color: '#64748b', bg: '#F8FAFC', tag: 'free', nameKey: 'vcard_name', descKey: 'vcard_desc', type: 'vcard' },
  { icon: '📝', color: '#6b7280', bg: '#F9FAFB', tag: 'free', nameKey: 'text_name', descKey: 'text_desc', type: 'text' },
]

const TAG_CLASSES = {
  dynamic: 'bg-blue-100 text-blue-700',
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-orange-100 text-orange-700',
}

export default function ShowcaseSlider() {
  const t = useTranslations('showcase')
  const trackRef = useRef<HTMLDivElement>(null)

  const items = QR_TYPE_DATA.map((item) => ({
    ...item,
    name: t(item.nameKey as any),
    desc: t(item.descKey as any),
    tagLabel: t(`tag_${item.tag}` as any),
  }))

  return (
    <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #041B4D 0%, #0d2d6e 60%, #041B4D 100%)' }}>
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative max-w-6xl mx-auto px-4 mb-10 text-center">
        <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-white/10">
          {t('badge')}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          {t('title')}
        </h2>
        <p className="text-blue-200 text-lg">{t('subtitle')}</p>
      </div>

      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .slider-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: scrollLeft 40s linear infinite;
        }
        .slider-track:hover { animation-play-state: paused; }
        .slider-wrap { overflow: hidden; }
      `}</style>

      <div className="slider-wrap">
        <div className="slider-track" ref={trackRef}>
          {[...items, ...items].map((item, i) => (
            <a
              key={i}
              href={`/?type=${item.type}#generateur`}
              className="flex-shrink-0 w-44 rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex flex-col items-center text-center gap-3 hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all duration-200 cursor-pointer no-underline"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{ background: item.bg }}>
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-[#041B4D] text-sm leading-tight">{item.name}</p>
                <p className="text-xs text-gray-400 mt-1 leading-snug">{item.desc}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_CLASSES[item.tag]}`}>
                {item.tagLabel}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
