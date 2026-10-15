'use client'
import { QRType } from '@/lib/types'

const QR_TYPES: { type: QRType; label: string; icon: string }[] = [
  { type: 'url', label: 'URL / Site web', icon: '🔗' },
  { type: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { type: 'vcard', label: 'Contact', icon: '👤' },
  { type: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { type: 'text', label: 'Texte', icon: '📝' },
  { type: 'email', label: 'E-mail', icon: '✉️' },
  { type: 'phone', label: 'Téléphone', icon: '📞' },
  { type: 'sms', label: 'SMS', icon: '💬' },
  { type: 'pdf', label: 'PDF', icon: '📄' },
  { type: 'app', label: 'App Store', icon: '📲' },
  { type: 'menu', label: 'Menu', icon: '🍽️' },
  { type: 'coupon', label: 'Coupon', icon: '🎫' },
  { type: 'biolink', label: 'Bio Links', icon: '🔗' },
  { type: 'social', label: 'Réseaux sociaux', icon: '📱' },
  { type: 'location', label: 'Localisation', icon: '📍' },
]

interface Props {
  selected: QRType
  onChange: (type: QRType) => void
}

export default function QRTypeSelector({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {QR_TYPES.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            selected === type
              ? 'bg-[#041B4D] text-white border-[#041B4D]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#041B4D]'
          }`}
        >
          <span>{icon}</span> {label}
        </button>
      ))}
    </div>
  )
}
