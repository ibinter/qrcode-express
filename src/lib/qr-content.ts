import { QRType } from './types'

export function buildQRContent(type: QRType, data: Record<string, string>): string {
  switch (type) {
    case 'url':
      return data.url || ''
    case 'text':
      return data.text || ''
    case 'email':
      return `mailto:${data.email}${data.subject ? `?subject=${encodeURIComponent(data.subject)}` : ''}${data.body ? `&body=${encodeURIComponent(data.body)}` : ''}`
    case 'phone':
      return `tel:${data.phone}`
    case 'sms':
      return `smsto:${data.phone}${data.message ? `:${data.message}` : ''}`
    case 'wifi':
      return `WIFI:T:${data.encryption || 'WPA'};S:${data.ssid};P:${data.password};;`
    case 'vcard':
      return buildVCard(data)
    case 'whatsapp':
      return `https://wa.me/${(data.phone || '').replace(/\D/g, '')}${data.message ? `?text=${encodeURIComponent(data.message)}` : ''}`
    case 'app': {
      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.url || `${appUrl}/app/mon-app`
    }
    case 'menu':
      return data.menu_json ? `${typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'}/menu/__ID__` : ''
    case 'coupon':
      return data.coupon_json ? `${typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'}/coupon/__ID__` : ''
    case 'biolink':
      return data.bio_json ? `${typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'}/bio/__ID__` : ''
    case 'pdf':
      return data.pdf_url || ''
    case 'social':
      return data.url || ''
    case 'location':
      return `geo:${data.lat},${data.lng}`
    case 'event': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.event_json ? `${origin}/event/__ID__` : buildVEvent(data)
    }
    case 'vcard_plus': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.vcard_json ? `${origin}/vcard/__ID__` : ''
    }
    case 'catalog': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.catalog_json ? `${origin}/catalog/__ID__` : ''
    }
    case 'review': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.review_json ? `${origin}/review/__ID__` : ''
    }
    case 'lead': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.lead_json ? `${origin}/form/__ID__` : ''
    }
    case 'payment': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.payment_json ? `${origin}/pay/__ID__` : ''
    }
    case 'business': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.business_json ? `${origin}/business/__ID__` : ''
    }
    case 'gallery': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.gallery_json ? `${origin}/gallery/__ID__` : ''
    }
    case 'video': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.video_json ? `${origin}/video/__ID__` : ''
    }
    case 'audio': {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express.com'
      return data.audio_json ? `${origin}/audio/__ID__` : ''
    }
    default:
      return data.url || data.text || ''
  }
}

function buildVCard(data: Record<string, string>): string {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name || ''}`,
    data.org ? `ORG:${data.org}` : '',
    data.title ? `TITLE:${data.title}` : '',
    data.phone ? `TEL:${data.phone}` : '',
    data.email ? `EMAIL:${data.email}` : '',
    data.website ? `URL:${data.website}` : '',
    data.address ? `ADR:;;${data.address};;;;` : '',
    'END:VCARD',
  ].filter(Boolean).join('\n')
}

function buildVEvent(data: Record<string, string>): string {
  return [
    'BEGIN:VEVENT',
    `SUMMARY:${data.title || ''}`,
    `DTSTART:${data.start || ''}`,
    `DTEND:${data.end || ''}`,
    data.location ? `LOCATION:${data.location}` : '',
    data.description ? `DESCRIPTION:${data.description}` : '',
    'END:VEVENT',
  ].filter(Boolean).join('\n')
}
