'use client'
import { useTranslations } from 'next-intl'
import { QRType } from '@/lib/types'

const QR_TYPE_ICONS: { type: QRType; icon: string }[] = [
  { type: 'url', icon: '🔗' },
  { type: 'whatsapp', icon: '💬' },
  { type: 'vcard', icon: '👤' },
  { type: 'vcard_plus', icon: '🪪' },
  { type: 'wifi', icon: '📶' },
  { type: 'text', icon: '📝' },
  { type: 'email', icon: '✉️' },
  { type: 'phone', icon: '📞' },
  { type: 'sms', icon: '💬' },
  { type: 'pdf', icon: '📄' },
  { type: 'event', icon: '📅' },
  { type: 'app', icon: '📲' },
  { type: 'menu', icon: '🍽️' },
  { type: 'coupon', icon: '🎫' },
  { type: 'biolink', icon: '🔗' },
  { type: 'social', icon: '📱' },
  { type: 'location', icon: '📍' },
  { type: 'catalog', icon: '🛍️' },
  { type: 'review', icon: '⭐' },
  { type: 'lead', icon: '📋' },
  { type: 'payment', icon: '💳' },
  { type: 'business', icon: '🏪' },
  { type: 'gallery', icon: '🖼️' },
  { type: 'video', icon: '▶️' },
  { type: 'audio', icon: '🎵' },
  { type: 'crypto', icon: '₿' },
  { type: 'ticket', icon: '🎟️' },
  { type: 'loyalty', icon: '🪙' },
  { type: 'appointment', icon: '📆' },
  { type: 'survey', icon: '📊' },
  { type: 'job', icon: '💼' },
  { type: 'giftcard', icon: '🎁' },
  { type: 'download', icon: '⬇️' },
]

interface Props {
  selected: QRType
  onChange: (type: QRType) => void
}

export default function QRTypeSelector({ selected, onChange }: Props) {
  const t = useTranslations('qrTypes')
  return (
    <div className="flex flex-wrap gap-2">
      {QR_TYPE_ICONS.map(({ type, icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            selected === type
              ? 'bg-[#041B4D] text-white border-[#041B4D]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#041B4D]'
          }`}
        >
          <span>{icon}</span> {t(type as any)}
        </button>
      ))}
    </div>
  )
}
