'use client'
import { useTranslations } from 'next-intl'
import { QRType } from '@/lib/types'

// Plan display labels (UI names, not internal codes)
const TYPE_PLAN_LABEL: Partial<Record<QRType, string>> = {
  vcard_plus: 'Essentiel', giftcard: 'Starter', job: 'Starter',
  ticket: 'Essentiel', appointment: 'Essentiel', download: 'Essentiel',
  menu: 'Essentiel', coupon: 'Essentiel', biolink: 'Essentiel',
  catalog: 'Essentiel', review: 'Essentiel', event: 'Essentiel',
  lead: 'Essentiel', gallery: 'Essentiel', video: 'Essentiel', audio: 'Essentiel',
  loyalty: 'Pro', survey: 'Pro', payment: 'Pro',
}

// Credit cost for pay-per-use (without subscription)
const TYPE_CREDIT_COST: Partial<Record<QRType, number>> = {
  vcard_plus: 35, giftcard: 30, job: 30,
  ticket: 35, appointment: 35, download: 35,
  menu: 35, coupon: 35, biolink: 35,
  catalog: 35, review: 35, event: 35,
  lead: 35, gallery: 35, video: 35, audio: 35,
  loyalty: 50, survey: 50, payment: 50,
}

const PLAN_COLORS: Record<string, string> = {
  Gratuit: 'bg-green-100 text-green-700',
  Starter: 'bg-blue-100 text-blue-700',
  Essentiel: 'bg-orange-100 text-orange-700',
  Pro: 'bg-purple-100 text-purple-700',
}

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
      {QR_TYPE_ICONS.map(({ type, icon }) => {
        const planLabel = TYPE_PLAN_LABEL[type]
        const creditCost = TYPE_CREDIT_COST[type]
        const isSelected = selected === type

        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              isSelected
                ? 'bg-[#041B4D] text-white border-[#041B4D]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#041B4D]'
            }`}
          >
            <span>{icon}</span>
            <span>{t(type as any)}</span>
            {!isSelected && (
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full leading-none ${PLAN_COLORS[planLabel ?? 'Gratuit']}`}>
                {planLabel ? `🔒 ${planLabel}` : '✓ Gratuit'}
              </span>
            )}
            {isSelected && planLabel && (
              <span className="text-[9px] font-bold px-1 py-0.5 rounded-full leading-none bg-white/20 text-white">
                {creditCost} cr
              </span>
            )}
            {isSelected && !planLabel && (
              <span className="text-[9px] font-bold px-1 py-0.5 rounded-full leading-none bg-white/20 text-white">
                ✓ Gratuit
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
