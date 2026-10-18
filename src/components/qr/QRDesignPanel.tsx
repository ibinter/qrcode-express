'use client'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { QRDesign } from '@/lib/types'
import { Save, Trash2, BookmarkPlus, ChevronDown } from 'lucide-react'
import { usePlan, tierAtLeast } from '@/components/ui/PlanGate'

interface Props {
  design: QRDesign
  onChange: (d: QRDesign) => void
}

interface DesignTemplate {
  id: string
  name: string
  design: QRDesign
  created_at: string
}

// Mini SVG thumbnail for each frame style (70x88 viewBox)
function FrameThumb({ id, color = '#041B4D' }: { id: string; color?: string }) {
  const qr = <rect x="14" y="12" width="42" height="42" rx="2" fill="#e5e7eb" />
  const qrDots = <>
    <rect x="17" y="15" width="8" height="8" rx="1" fill="#9ca3af"/>
    <rect x="28" y="15" width="8" height="8" rx="1" fill="#9ca3af"/>
    <rect x="39" y="15" width="8" height="8" rx="1" fill="#9ca3af"/>
    <rect x="17" y="26" width="8" height="8" rx="1" fill="#9ca3af"/>
    <rect x="39" y="26" width="8" height="8" rx="1" fill="#9ca3af"/>
    <rect x="17" y="37" width="8" height="8" rx="1" fill="#9ca3af"/>
    <rect x="28" y="37" width="8" height="8" rx="1" fill="#9ca3af"/>
    <rect x="39" y="37" width="8" height="8" rx="1" fill="#9ca3af"/>
    <rect x="28" y="26" width="4" height="4" rx="1" fill="#6b7280"/>
  </>

  switch (id) {
    case 'none': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="35" cy="44" r="28" fill="none" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 3"/>
      <line x1="20" y1="30" x2="50" y2="58" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="50" y1="30" x2="20" y2="58" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>

    case 'simple': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="10" y="8" width="50" height="50" fill="none" stroke={color} strokeWidth="3"/>
      {qr}{qrDots}
    </svg>

    case 'bold': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="8" y="6" width="54" height="54" fill="none" stroke={color} strokeWidth="5"/>
      {qr}{qrDots}
    </svg>

    case 'rounded': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="58" rx="14" fill={color}/>
      {qr}{qrDots}
    </svg>

    case 'dotted': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="10" y="8" width="50" height="50" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round"/>
      {qr}{qrDots}
    </svg>

    case 'scan_me': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="8" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill={color}/>
      <rect x="6" y="64" width="58" height="8" rx="0" fill={color}/>
      <path d="M6 58 Q6 72 14 72 H56 Q64 72 64 58Z" fill={color}/>
      <text x="35" y="67" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
    </svg>

    case 'scan_me_dark': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="8" fill={color}/>
      <rect x="14" y="12" width="42" height="42" rx="2" fill="white"/>
      {qrDots}
      <text x="35" y="67" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
    </svg>

    case 'banner_bottom': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill={color}/>
      {qr}{qrDots}
      <text x="35" y="67" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
    </svg>

    case 'banner_top': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill={color}/>
      <text x="35" y="17" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
      <rect x="14" y="22" width="42" height="42" rx="2" fill="white"/>
      {qrDots}
    </svg>

    case 'wave': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <path d="M6 55 Q17 48 24 55 Q31 62 42 55 Q53 48 64 55 L64 72 Q64 72 56 72 H14 Q6 72 6 72Z" fill={color}/>
      <text x="35" y="66" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
    </svg>

    case 'zigzag': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <path d="M6 55 L13 50 L20 55 L27 50 L34 55 L41 50 L48 55 L55 50 L62 55 L64 55 L64 72 H6Z" fill={color}/>
      <text x="35" y="66" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
    </svg>

    case 'arrow': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="58" rx="3" fill={color}/>
      {qr}{qrDots}
      <text x="35" y="17" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
      <polygon points="35,72 27,60 43,60" fill={color}/>
    </svg>

    case 'speech': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="16" width="58" height="56" rx="8" fill={color}/>
      <polygon points="20,16 14,4 30,16" fill={color}/>
      <text x="35" y="28" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
      <rect x="14" y="32" width="42" height="32" rx="2" fill="white"/>
    </svg>

    case 'bubble': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="29" fill={color}/>
      {qr}{qrDots}
      <text x="35" y="80" textAnchor="middle" fill={color} fontSize="6" fontWeight="bold" fontFamily="sans-serif">SCAN</text>
    </svg>

    case 'ribbon': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="8" y="4" width="54" height="56" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <path d="M14 60 L6 68 L14 64 L20 72 L35 60 L50 72 L56 64 L64 68 L56 60Z" fill={color}/>
      <text x="35" y="58" textAnchor="middle" fill={color} fontSize="6" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
    </svg>

    case 'tag': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M10 4 L60 4 L60 62 L35 76 L10 62Z" fill={color}/>
      <rect x="18" y="12" width="34" height="34" rx="2" fill="white"/>
      <circle cx="35" cy="10" r="3" fill="white"/>
    </svg>

    case 'ticket': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="4" y="10" width="62" height="60" rx="6" fill={color}/>
      <circle cx="4" cy="30" r="8" fill="white"/>
      <circle cx="4" cy="50" r="8" fill="white"/>
      <circle cx="66" cy="30" r="8" fill="white"/>
      <circle cx="66" cy="50" r="8" fill="white"/>
      <rect x="14" y="18" width="42" height="34" rx="2" fill="white"/>
      {qrDots}
      <text x="35" y="76" textAnchor="middle" fill={color} fontSize="6" fontWeight="bold" fontFamily="sans-serif">🎟️ TICKET</text>
    </svg>

    // Icon frames
    case 'restaurant': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill={color}/>
      <path d="M6 58 H64 L64 65 Q64 72 56 72 H14 Q6 72 6 65Z" fill={color}/>
      <text x="35" y="67" textAnchor="middle" fill="white" fontSize="12" fontFamily="serif">🍽</text>
    </svg>

    case 'shopping': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill={color}/>
      <path d="M6 58 H64 L64 65 Q64 72 56 72 H14 Q6 72 6 65Z" fill={color}/>
      <text x="35" y="67" textAnchor="middle" fill="white" fontSize="12" fontFamily="serif">🛍</text>
    </svg>

    case 'coffee': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill={color}/>
      <path d="M6 58 H64 L64 65 Q64 72 56 72 H14 Q6 72 6 65Z" fill={color}/>
      <text x="35" y="67" textAnchor="middle" fill="white" fontSize="12" fontFamily="serif">☕</text>
    </svg>

    case 'wifi': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill={color}/>
      <path d="M6 58 H64 L64 65 Q64 72 56 72 H14 Q6 72 6 65Z" fill={color}/>
      <text x="35" y="67" textAnchor="middle" fill="white" fontSize="12" fontFamily="serif">📶</text>
    </svg>

    case 'phone': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill={color}/>
      <path d="M6 58 H64 L64 65 Q64 72 56 72 H14 Q6 72 6 65Z" fill={color}/>
      <text x="35" y="67" textAnchor="middle" fill="white" fontSize="12" fontFamily="serif">📱</text>
    </svg>

    case 'gift': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill={color}/>
      <path d="M6 58 H64 L64 65 Q64 72 56 72 H14 Q6 72 6 65Z" fill={color}/>
      <text x="35" y="67" textAnchor="middle" fill="white" fontSize="12" fontFamily="serif">🎁</text>
    </svg>

    case 'envelope': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="4" y="14" width="62" height="48" rx="5" fill="white" stroke={color} strokeWidth="2.5"/>
      <rect x="14" y="20" width="42" height="30" rx="2" fill="#e5e7eb"/>
      {qrDots}
      <polyline points="4,14 35,42 66,14" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
      <text x="35" y="78" textAnchor="middle" fill={color} fontSize="6" fontWeight="bold" fontFamily="sans-serif">SCAN ME</text>
    </svg>

    case 'scooter': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="58" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <text x="35" y="76" textAnchor="middle" fill={color} fontSize="16" fontFamily="serif">🛵</text>
    </svg>

    case 'chef': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="58" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <text x="35" y="76" textAnchor="middle" fill={color} fontSize="16" fontFamily="serif">👨‍🍳</text>
    </svg>

    case 'beer': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="58" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <text x="35" y="76" textAnchor="middle" fill={color} fontSize="16" fontFamily="serif">🍺</text>
    </svg>

    case 'drink': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="58" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <text x="35" y="76" textAnchor="middle" fill={color} fontSize="16" fontFamily="serif">🥤</text>
    </svg>

    case 'clipboard': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="8" y="8" width="54" height="68" rx="4" fill="white" stroke={color} strokeWidth="2"/>
      <rect x="22" y="4" width="26" height="10" rx="5" fill={color}/>
      {qr}{qrDots}
    </svg>

    case 'youtube': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill="#FF0000"/>
      <path d="M6 58 H64 L64 65 Q64 72 56 72 H14 Q6 72 6 65Z" fill="#FF0000"/>
      <polygon points="29,62 29,70 43,66" fill="white"/>
      <text x="46" y="68" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">Scan</text>
    </svg>

    case 'instagram': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill="url(#ig)"/>
      <path d="M6 58 H64 L64 65 Q64 72 56 72 H14 Q6 72 6 65Z" fill={color}/>
      <text x="35" y="68" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">📸 Scannez</text>
      <defs><linearGradient id="ig" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#833ab4"/><stop offset="100%" stopColor="#fd1d1d"/></linearGradient></defs>
    </svg>

    case 'whatsapp': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="68" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <rect x="6" y="58" width="58" height="14" rx="0" fill="#25d366"/>
      <path d="M6 58 H64 L64 65 Q64 72 56 72 H14 Q6 72 6 65Z" fill="#25d366"/>
      <text x="35" y="68" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">💬 WhatsApp</text>
    </svg>

    case 'delivery': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="4" width="58" height="58" rx="3" fill="white" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
      <text x="35" y="76" textAnchor="middle" fill={color} fontSize="16" fontFamily="serif">🚚</text>
    </svg>

    case 'mobile_frame': return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="10" y="2" width="50" height="80" rx="10" fill={color}/>
      <rect x="14" y="10" width="42" height="62" rx="4" fill="white"/>
      <rect x="28" y="5" width="14" height="3" rx="1.5" fill="#6b7280"/>
      <rect x="18" y="14" width="34" height="34" rx="2" fill="#e5e7eb"/>
      {qrDots}
    </svg>

    default: return <svg viewBox="0 0 70 88" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="8" y="8" width="54" height="54" fill="none" stroke={color} strokeWidth="2"/>
      {qr}{qrDots}
    </svg>
  }
}

// ─── Factory presets ───────────────────────────────────────────────────────
interface Preset {
  id: string
  name: string
  emoji: string
  design: Partial<QRDesign>
  preview: { fg: string; bg: string; accent?: string }
}

const PRESETS: Preset[] = [
  {
    id: 'classic', name: 'Classique', emoji: '⬛',
    design: { fgColor: '#041B4D', bgColor: '#FFFFFF', bgTransparent: false, moduleStyle: 'squares', eyeStyle: 'square', frameStyle: 'none', fgGradient: undefined },
    preview: { fg: '#041B4D', bg: '#FFFFFF' },
  },
  {
    id: 'orange', name: 'Orange Express', emoji: '🟠',
    design: { fgColor: '#FF6A00', bgColor: '#FFFFFF', bgTransparent: false, moduleStyle: 'dots', eyeStyle: 'circle', frameStyle: 'scan_me', frameColor: '#FF6A00', fgGradient: undefined },
    preview: { fg: '#FF6A00', bg: '#FFFFFF' },
  },
  {
    id: 'night', name: 'Nuit Étoilée', emoji: '🌙',
    design: { fgColor: '#FFFFFF', bgColor: '#0f0f1a', bgTransparent: false, moduleStyle: 'dots', eyeStyle: 'classy', frameStyle: 'none', fgGradient: undefined },
    preview: { fg: '#FFFFFF', bg: '#0f0f1a' },
  },
  {
    id: 'electric', name: 'Électrique', emoji: '⚡',
    design: { fgColor: '#7c3aed', bgColor: '#FFFFFF', bgTransparent: false, moduleStyle: 'squares', eyeStyle: 'square', fgGradient: '#06b6d4', gradientType: 'linear', frameStyle: 'none' },
    preview: { fg: '#7c3aed', bg: '#FFFFFF', accent: '#06b6d4' },
  },
  {
    id: 'forest', name: 'Forêt', emoji: '🌿',
    design: { fgColor: '#15803d', bgColor: '#f0fdf4', bgTransparent: false, moduleStyle: 'rounded', eyeStyle: 'rounded', frameStyle: 'simple', frameColor: '#15803d', fgGradient: undefined },
    preview: { fg: '#15803d', bg: '#f0fdf4' },
  },
  {
    id: 'pro_navy', name: 'Pro Navy', emoji: '🔷',
    design: { fgColor: '#1e3a8a', bgColor: '#f0f4ff', bgTransparent: false, moduleStyle: 'dots', eyeStyle: 'rounded', frameStyle: 'none', fgGradient: undefined },
    preview: { fg: '#1e3a8a', bg: '#f0f4ff' },
  },
  {
    id: 'restaurant', name: 'Restaurant', emoji: '🍽️',
    design: { fgColor: '#B91C1C', bgColor: '#FFFFFF', bgTransparent: false, moduleStyle: 'squares', eyeStyle: 'rounded', frameStyle: 'restaurant', frameColor: '#B91C1C', fgGradient: undefined },
    preview: { fg: '#B91C1C', bg: '#FFFFFF' },
  },
  {
    id: 'coffee', name: 'Café', emoji: '☕',
    design: { fgColor: '#6B4226', bgColor: '#FFF8F0', bgTransparent: false, moduleStyle: 'rounded', eyeStyle: 'rounded', frameStyle: 'coffee', frameColor: '#6B4226', fgGradient: undefined },
    preview: { fg: '#6B4226', bg: '#FFF8F0' },
  },
  {
    id: 'whatsapp', name: 'WhatsApp', emoji: '💬',
    design: { fgColor: '#128C7E', bgColor: '#FFFFFF', bgTransparent: false, moduleStyle: 'rounded', eyeStyle: 'circle', frameStyle: 'whatsapp', frameColor: '#128C7E', fgGradient: undefined },
    preview: { fg: '#128C7E', bg: '#FFFFFF' },
  },
  {
    id: 'insta', name: 'Instagram', emoji: '📸',
    design: { fgColor: '#C13584', bgColor: '#FFFFFF', bgTransparent: false, moduleStyle: 'dots', eyeStyle: 'circle', fgGradient: '#f09433', gradientType: 'linear', frameStyle: 'scan_me', frameColor: '#C13584' },
    preview: { fg: '#C13584', bg: '#FFFFFF', accent: '#f09433' },
  },
  {
    id: 'gold', name: 'Or Luxe', emoji: '✨',
    design: { fgColor: '#92400e', bgColor: '#fffbeb', bgTransparent: false, moduleStyle: 'rounded', eyeStyle: 'classy', frameStyle: 'simple', frameColor: '#d97706', fgGradient: '#d97706', gradientType: 'linear' },
    preview: { fg: '#92400e', bg: '#fffbeb', accent: '#d97706' },
  },
  {
    id: 'pink', name: 'Rose Doux', emoji: '🌸',
    design: { fgColor: '#9D174D', bgColor: '#fff0f6', bgTransparent: false, moduleStyle: 'dots', eyeStyle: 'circle', frameStyle: 'none', fgGradient: '#f472b6', gradientType: 'radial' },
    preview: { fg: '#9D174D', bg: '#fff0f6', accent: '#f472b6' },
  },
]

type FrameId = QRDesign['frameStyle']

const FRAMES: { id: FrameId; label: string }[] = [
  { id: 'none',          label: 'Aucun' },
  { id: 'simple',        label: 'Simple' },
  { id: 'bold',          label: 'Épais' },
  { id: 'dotted',        label: 'Pointillé' },
  { id: 'rounded',       label: 'Arrondi' },
  { id: 'scan_me',       label: 'Scan Me' },
  { id: 'scan_me_dark',  label: 'Dark' },
  { id: 'banner_bottom', label: 'Bas' },
  { id: 'banner_top',    label: 'Haut' },
  { id: 'wave',          label: 'Vague' },
  { id: 'zigzag',        label: 'Zigzag' },
  { id: 'arrow',         label: 'Flèche' },
  { id: 'speech',        label: 'Bulle' },
  { id: 'bubble',        label: 'Ovale' },
  { id: 'ribbon',        label: 'Ruban' },
  { id: 'tag',           label: 'Étiquette' },
  { id: 'ticket',        label: 'Ticket' },
  { id: 'envelope',      label: 'Enveloppe' },
  { id: 'clipboard',     label: 'Presse-papiers' },
  { id: 'mobile_frame',  label: 'Smartphone' },
  { id: 'restaurant',    label: 'Restaurant' },
  { id: 'shopping',      label: 'Shopping' },
  { id: 'coffee',        label: 'Café' },
  { id: 'drink',         label: 'Boisson' },
  { id: 'beer',          label: 'Bière' },
  { id: 'chef',          label: 'Chef' },
  { id: 'gift',          label: 'Cadeau' },
  { id: 'scooter',       label: 'Scooter' },
  { id: 'delivery',      label: 'Livraison' },
  { id: 'wifi',          label: 'Wi-Fi' },
  { id: 'phone',         label: 'Téléphone' },
  { id: 'youtube',       label: 'YouTube' },
  { id: 'whatsapp',      label: 'WhatsApp' },
  { id: 'instagram',     label: 'Instagram' },
]

const ICON_FRAME_IDS = ['restaurant','shopping','coffee','wifi','phone','gift','scooter','chef','beer','drink','clipboard','youtube','instagram','whatsapp','delivery','mobile_frame','envelope','ticket','tag','ribbon']

const LOGO_SIZES = [
  { id: 'small',  label: 'Petit',  pct: '20%' },
  { id: 'medium', label: 'Moyen',  pct: '30%' },
  { id: 'large',  label: 'Grand',  pct: '40%' },
] as const

export default function QRDesignPanel({ design, onChange }: Props) {
  const update = (patch: Partial<QRDesign>) => onChange({ ...design, ...patch })
  const fileRef = useRef<HTMLInputElement>(null)
  const frameColor = design.frameColor ?? '#041B4D'
  const { tier } = usePlan()
  const isPremium = tierAtLeast(tier, 'starter')

  // Templates state
  const [templates, setTemplates] = useState<DesignTemplate[]>([])
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateError, setTemplateError] = useState('')

  useEffect(() => {
    fetch('/api/design-templates')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.templates) setTemplates(data.templates) })
      .catch(() => {})
  }, [])

  const saveTemplate = async () => {
    if (!saveName.trim()) return
    setSavingTemplate(true); setTemplateError('')
    try {
      const res = await fetch('/api/design-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName.trim(), design }),
      })
      const data = await res.json()
      if (!res.ok) { setTemplateError(data.error || 'Erreur'); return }
      setTemplates(prev => [data.template, ...prev])
      setSaveName('')
      setTemplatesOpen(false)
    } finally {
      setSavingTemplate(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    await fetch(`/api/design-templates?id=${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      update({
        logo: ev.target?.result as string,
        logoSize: design.logoSize ?? 'medium',
        errorCorrection: 'H',
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {/* ── Presets factory ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Styles prêts à l&apos;emploi
          <span className="ml-1.5 text-[10px] font-normal text-gray-400">Cliquez pour appliquer</span>
        </label>
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex gap-2 w-max">
            {PRESETS.map(p => {
              const isActive = design.fgColor === p.design.fgColor && design.bgColor === p.design.bgColor && design.frameStyle === p.design.frameStyle
              return (
                <button
                  key={p.id}
                  onClick={() => onChange({ ...design, ...p.design })}
                  title={p.name}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all shrink-0 w-16 ${
                    isActive ? 'border-[#FF6A00] shadow-sm bg-orange-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {/* Swatch */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-gray-100 shrink-0"
                    style={{ background: p.preview.bg }}>
                    {p.preview.accent ? (
                      <div className="absolute inset-0 opacity-90"
                        style={{ background: `linear-gradient(135deg, ${p.preview.fg}, ${p.preview.accent})` }} />
                    ) : (
                      <div className="absolute inset-0">
                        {/* Mini QR dots illustration */}
                        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1">
                          <rect x="2" y="2" width="10" height="10" rx="1.5" fill={p.preview.fg} opacity="0.9"/>
                          <rect x="28" y="2" width="10" height="10" rx="1.5" fill={p.preview.fg} opacity="0.9"/>
                          <rect x="2" y="28" width="10" height="10" rx="1.5" fill={p.preview.fg} opacity="0.9"/>
                          <rect x="5" y="5" width="4" height="4" rx="0.5" fill={p.preview.bg}/>
                          <rect x="31" y="5" width="4" height="4" rx="0.5" fill={p.preview.bg}/>
                          <rect x="5" y="31" width="4" height="4" rx="0.5" fill={p.preview.bg}/>
                          <rect x="15" y="4" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.7"/>
                          <rect x="20" y="4" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.7"/>
                          <rect x="15" y="9" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.5"/>
                          <rect x="4" y="15" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.7"/>
                          <rect x="4" y="20" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.5"/>
                          <rect x="9" y="15" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.7"/>
                          <rect x="15" y="15" width="3" height="3" rx="0.5" fill={p.preview.fg}/>
                          <rect x="20" y="15" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.6"/>
                          <rect x="25" y="15" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.8"/>
                          <rect x="15" y="20" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.7"/>
                          <rect x="20" y="20" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.4"/>
                          <rect x="25" y="25" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.9"/>
                          <rect x="30" y="15" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.6"/>
                          <rect x="30" y="20" width="3" height="3" rx="0.5" fill={p.preview.fg} opacity="0.5"/>
                        </svg>
                      </div>
                    )}
                    {p.preview.accent && (
                      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1 absolute inset-0">
                        <rect x="2" y="2" width="10" height="10" rx="1.5" fill="white" opacity="0.9"/>
                        <rect x="28" y="2" width="10" height="10" rx="1.5" fill="white" opacity="0.9"/>
                        <rect x="2" y="28" width="10" height="10" rx="1.5" fill="white" opacity="0.9"/>
                        <rect x="5" y="5" width="4" height="4" rx="0.5" fill="none" stroke={p.preview.fg} strokeWidth="0.5"/>
                        <rect x="31" y="5" width="4" height="4" rx="0.5" fill="none" stroke={p.preview.fg} strokeWidth="0.5"/>
                        <rect x="5" y="31" width="4" height="4" rx="0.5" fill="none" stroke={p.preview.fg} strokeWidth="0.5"/>
                        <rect x="15" y="4" width="3" height="3" rx="0.5" fill="white" opacity="0.8"/>
                        <rect x="20" y="4" width="3" height="3" rx="0.5" fill="white" opacity="0.6"/>
                        <rect x="15" y="15" width="3" height="3" rx="0.5" fill="white"/>
                        <rect x="20" y="20" width="3" height="3" rx="0.5" fill="white" opacity="0.7"/>
                        <rect x="25" y="15" width="3" height="3" rx="0.5" fill="white" opacity="0.8"/>
                        <rect x="15" y="25" width="3" height="3" rx="0.5" fill="white" opacity="0.6"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-[9px] font-semibold leading-tight text-center ${isActive ? 'text-[#FF6A00]' : 'text-gray-600'}`}>
                    {p.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Couleurs */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Couleur du QR</label>
          <div className="flex items-center gap-2">
            <input type="color" value={design.fgColor} onChange={(e) => update({ fgColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
            <span className="text-sm text-gray-500 font-mono">{design.fgColor}</span>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fond</label>
          <div className="flex items-center gap-2">
            {design.bgTransparent ? (
              <div className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400"
                style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 4px' }}>
              </div>
            ) : (
              <input type="color" value={design.bgColor} onChange={(e) => update({ bgColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
            )}
            <button onClick={() => update({ bgTransparent: !design.bgTransparent })}
              className={`text-xs px-2 py-1 rounded-lg border transition-colors ${design.bgTransparent ? 'bg-[#041B4D] text-white border-[#041B4D]' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              Transparent
            </button>
          </div>
        </div>
      </div>

      {/* Style modules */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Style des modules
          {!isPremium && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">🔒 Starter pour plus</span>}
        </label>
        <div className="flex gap-2">
          {(['squares', 'rounded', 'dots'] as const).map((s) => {
            const locked = s !== 'squares' && !isPremium
            return (
              <button key={s}
                onClick={() => locked ? undefined : update({ moduleStyle: s })}
                title={locked ? 'Plan Starter requis' : undefined}
                className={`relative flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  locked ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                  : design.moduleStyle === s ? 'bg-[#041B4D] text-white border-[#041B4D]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}>
                {s === 'squares' ? 'Carrés' : s === 'rounded' ? 'Arrondis' : 'Ronds'}
                {locked && <span className="absolute -top-1.5 -right-1 text-[8px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded-full font-bold leading-none">🔒</span>}
              </button>
            )
          })}
        </div>
        {!isPremium && (
          <p className="mt-1.5 text-[10px] text-gray-400">
            <Link href="/tarifs" className="text-blue-600 hover:underline font-semibold">Passer au Starter</Link> pour débloquer tous les styles
          </p>
        )}
      </div>

      {/* Eye styles */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Style des coins (yeux)
          {!isPremium && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">🔒 Starter pour plus</span>}
        </label>
        <div className="flex gap-1.5">
          {([
            { id: 'square', label: 'Carré', svg: <svg viewBox="0 0 24 24" className="w-6 h-6"><rect x="2" y="2" width="9" height="9" fill="currentColor"/><rect x="13" y="2" width="9" height="9" fill="currentColor"/><rect x="2" y="13" width="9" height="9" fill="currentColor"/></svg> },
            { id: 'rounded', label: 'Arrondi', svg: <svg viewBox="0 0 24 24" className="w-6 h-6"><rect x="2" y="2" width="9" height="9" rx="3" fill="currentColor"/><rect x="13" y="2" width="9" height="9" rx="3" fill="currentColor"/><rect x="2" y="13" width="9" height="9" rx="3" fill="currentColor"/></svg> },
            { id: 'circle', label: 'Cercle', svg: <svg viewBox="0 0 24 24" className="w-6 h-6"><circle cx="6.5" cy="6.5" r="4.5" fill="currentColor"/><circle cx="17.5" cy="6.5" r="4.5" fill="currentColor"/><circle cx="6.5" cy="17.5" r="4.5" fill="currentColor"/></svg> },
            { id: 'leaf', label: 'Pétale', svg: <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M2 2 Q2 11 11 11 Q11 2 2 2Z" fill="currentColor"/><path d="M13 2 Q13 11 22 11 Q22 2 13 2Z" fill="currentColor"/><path d="M2 13 Q2 22 11 22 Q11 13 2 13Z" fill="currentColor"/></svg> },
            { id: 'classy', label: 'Classy', svg: <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M2 5 Q2 2 5 2 H11 V11 H2Z" fill="currentColor"/><path d="M13 5 Q13 2 16 2 H22 V11 H13Z" fill="currentColor"/><path d="M2 13 H11 V22 H5 Q2 22 2 19Z" fill="currentColor"/></svg> },
          ] as const).map((eye) => {
            const locked = eye.id !== 'square' && !isPremium
            return (
              <button key={eye.id}
                onClick={() => locked ? undefined : update({ eyeStyle: eye.id })}
                title={locked ? 'Plan Starter requis' : eye.label}
                className={`relative flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-colors ${
                  locked ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                  : (design.eyeStyle ?? 'square') === eye.id ? 'bg-[#041B4D] text-white border-[#041B4D]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}>
                {eye.svg}
                <span className="text-[9px] font-medium">{locked ? '🔒' : eye.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Gradient */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Dégradé de couleurs <span className="font-normal text-gray-400 text-xs">(optionnel)</span>
          {!isPremium && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">🔒 Starter</span>}
        </label>
        <div className={`relative flex gap-3 items-center ${!isPremium ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400">Départ</span>
            <input type="color" value={design.fgColor} onChange={(e) => update({ fgColor: e.target.value })}
              className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            {design.fgGradient ? (
              <div className="w-full h-5 rounded-md" style={{ background: design.gradientType === 'radial' ? `radial-gradient(circle, ${design.fgColor}, ${design.fgGradient})` : `linear-gradient(90deg, ${design.fgColor}, ${design.fgGradient})` }} />
            ) : (
              <div className="w-full h-5 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center">
                <span className="text-[10px] text-gray-400">→</span>
              </div>
            )}
            <div className="flex gap-1 mt-0.5">
              {(['linear', 'radial'] as const).map((t) => (
                <button key={t} onClick={() => update({ gradientType: t })}
                  className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${design.gradientType === t && design.fgGradient ? 'bg-[#041B4D] text-white border-[#041B4D]' : 'border-gray-200 text-gray-500'}`}>
                  {t === 'linear' ? '↔ Linéaire' : '◉ Radial'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400">Fin</span>
            <div className="relative">
              <input type="color" value={design.fgGradient || design.fgColor}
                onChange={(e) => update({ fgGradient: e.target.value, gradientType: design.gradientType ?? 'linear' })}
                className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
            </div>
          </div>
          {design.fgGradient && (
            <button onClick={() => update({ fgGradient: undefined, gradientType: undefined })}
              className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50">✕</button>
          )}
        </div>
        {!isPremium && (
          <p className="mt-1.5 text-[10px] text-gray-400">
            <Link href="/tarifs" className="text-blue-600 hover:underline font-semibold">Passer au Starter</Link> pour débloquer les dégradés
          </p>
        )}
      </div>

      {/* Style IA */}
      <div className="border border-purple-100 rounded-2xl p-4 bg-purple-50/40">
        <label className="block text-sm font-semibold text-purple-800 mb-1 flex items-center gap-1.5">
          ✨ QR Code Artistique IA
          <span className="text-[10px] font-normal bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">NOUVEAU</span>
        </label>
        <p className="text-xs text-purple-600 mb-3">Générez un QR code visuellement intégré dans une image IA</p>

        {/* Style presets */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            { id: 'nature', label: '🌿 Nature', emoji: '🌿' },
            { id: 'city', label: '🏙️ Ville', emoji: '🏙️' },
            { id: 'abstract', label: '🎨 Abstrait', emoji: '🎨' },
            { id: 'vintage', label: '📜 Vintage', emoji: '📜' },
            { id: 'watercolor', label: '🖌️ Aquarelle', emoji: '🖌️' },
            { id: 'space', label: '🚀 Espace', emoji: '🚀' },
            { id: 'food', label: '🍽️ Food', emoji: '🍽️' },
            { id: 'fashion', label: '👗 Mode', emoji: '👗' },
          ].map(s => (
            <button key={s.id} onClick={() => update({ aiStyle: design.aiStyle === s.id ? undefined : s.id, aiPrompt: undefined })}
              className={`py-1.5 px-1 rounded-lg text-[10px] font-medium border text-center transition-colors ${
                design.aiStyle === s.id ? 'bg-purple-700 text-white border-purple-700' : 'border-purple-200 text-purple-700 bg-white hover:bg-purple-100'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Custom prompt */}
        <div>
          <label className="text-xs font-semibold text-purple-700 mb-1 block">Ou décrivez votre style (optionnel)</label>
          <input
            type="text"
            value={design.aiPrompt || ''}
            onChange={e => update({ aiPrompt: e.target.value, aiStyle: undefined })}
            placeholder="ex: jungle tropicale, coucher de soleil, art déco…"
            className="w-full border border-purple-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-purple-400"
          />
        </div>
        <p className="text-[10px] text-purple-500 mt-2">
          Cliquez sur <strong>Générer QR artistique IA</strong> dans la prévisualisation pour lancer la génération (~30s).
        </p>
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Logo au centre
          {!isPremium && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">🔒 Starter</span>}
        </label>
        {!isPremium ? (
          <div className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 flex items-center justify-center gap-2 bg-gray-50">
            🔒 <Link href="/tarifs" className="text-blue-600 hover:underline font-semibold">Plan Starter requis</Link> pour ajouter un logo
          </div>
        ) : design.logo ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <img src={design.logo} alt="logo" className="w-12 h-12 object-contain rounded-lg border border-gray-200 bg-white" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 mb-1">Taille du logo</p>
              <div className="flex gap-1">
                {LOGO_SIZES.map((s) => (
                  <button key={s.id} onClick={() => update({ logoSize: s.id })}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      (design.logoSize ?? 'medium') === s.id ? 'bg-[#041B4D] text-white border-[#041B4D]' : 'border-gray-200 text-gray-600'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => update({ logo: undefined, logoUrl: undefined })}
              className="text-red-400 text-xs hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
              ✕ Retirer
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors flex items-center justify-center gap-2">
            ⬆️ Importer votre logo (PNG, JPG, SVG)
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        {design.logo && (
          <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
            ⚠️ Correction d&apos;erreur passée à H automatiquement
          </p>
        )}
      </div>

      {/* Cadres */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cadre <span className="font-normal text-gray-400">({FRAMES.length - 1} styles)</span>
          {!isPremium && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">🔒 Starter</span>}
        </label>
        <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1">
          {FRAMES.map((f) => {
            const locked = f.id !== 'none' && !isPremium
            const selected = (design.frameStyle ?? 'none') === f.id
            return (
              <button
                key={f.id}
                onClick={() => locked ? undefined : update({ frameStyle: f.id })}
                title={locked ? 'Plan Starter requis' : f.label}
                className={`relative flex flex-col items-center rounded-xl p-1 pb-1.5 border-2 transition-all ${
                  locked ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  : selected ? 'border-[#FF6A00] bg-orange-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="w-full aspect-[70/88]">
                  <FrameThumb id={f.id!} color={locked ? '#d1d5db' : frameColor} />
                </div>
                <span className={`text-[9px] leading-tight mt-0.5 font-medium text-center ${selected ? 'text-[#FF6A00]' : 'text-gray-500'}`}>
                  {locked ? '🔒' : f.label}
                </span>
              </button>
            )
          })}
        </div>
        {!isPremium && (
          <p className="mt-1.5 text-[10px] text-gray-400">
            <Link href="/tarifs" className="text-blue-600 hover:underline font-semibold">Passer au Starter</Link> pour débloquer tous les cadres
          </p>
        )}
      </div>

      {/* Texte et couleur du cadre */}
      {design.frameStyle && design.frameStyle !== 'none' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Texte du cadre</label>
            <input type="text" maxLength={30}
              placeholder={ICON_FRAME_IDS.includes(design.frameStyle) ? 'Laisser vide pour l\'icône seule' : 'Ex: Scannez-moi !'}
              value={design.frameLabel ?? ''}
              onChange={(e) => update({ frameLabel: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6A00]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Couleur du cadre</label>
            <div className="flex items-center gap-2">
              <input type="color" value={frameColor}
                onChange={(e) => update({ frameColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
              <span className="text-sm text-gray-500 font-mono">{frameColor}</span>
            </div>
          </div>
        </div>
      )}

      {/* Correction erreur */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Correction d&apos;erreur
          <span className="font-normal text-gray-400 ml-1">(H recommandé avec logo)</span>
        </label>
        <select value={design.errorCorrection}
          onChange={(e) => update({ errorCorrection: e.target.value as QRDesign['errorCorrection'] })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="L">L — Faible (densité max)</option>
          <option value="M">M — Moyen (équilibré)</option>
          <option value="Q">Q — Bon</option>
          <option value="H">H — Maximum (avec logo)</option>
        </select>
      </div>

      {/* Templates de design */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setTemplatesOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700">
          <span className="flex items-center gap-2">
            <BookmarkPlus size={15} className="text-[#FF6A00]" />
            Modèles de design
            {templates.length > 0 && (
              <span className="bg-[#FF6A00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{templates.length}</span>
            )}
          </span>
          <ChevronDown size={15} className={`transition-transform ${templatesOpen ? 'rotate-180' : ''}`} />
        </button>

        {templatesOpen && (
          <div className="p-3 space-y-3">
            {/* Save current design */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom du modèle…"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveTemplate()}
                maxLength={40}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6A00]/40 focus:outline-none"
              />
              <button
                onClick={saveTemplate}
                disabled={!saveName.trim() || savingTemplate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                <Save size={14} />
                {savingTemplate ? '…' : 'Sauver'}
              </button>
            </div>
            {templateError && <p className="text-xs text-red-500">{templateError}</p>}

            {/* Saved templates list */}
            {templates.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Aucun modèle sauvegardé</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 hover:border-[#FF6A00]/40 transition-colors group">
                    <button
                      onClick={() => onChange(t.design)}
                      className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-[#FF6A00] transition-colors truncate">
                      {t.name}
                    </button>
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
