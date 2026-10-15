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
      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://qrcode-express-ibig.vercel.app'
      return data.url || `${appUrl}/app/mon-app`
    }
    case 'pdf':
      return data.pdf_url || ''
    case 'social':
      return data.url || ''
    case 'location':
      return `geo:${data.lat},${data.lng}`
    case 'event':
      return buildVEvent(data)
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
