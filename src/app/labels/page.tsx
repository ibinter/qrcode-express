'use client'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePlan, PlanHeaderBanner, LockBadge, tierAtLeast, type PlanTier } from '@/components/ui/PlanGate'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

// Categories
const CATEGORIES = [
  { id: 'all',       label: 'Tous',          icon: '🗂️' },
  { id: 'retail',    label: 'Commerce',       icon: '🏪' },
  { id: 'food',      label: 'Alimentaire',    icon: '🥗' },
  { id: 'pharma',    label: 'Pharmacie',      icon: '💊' },
  { id: 'logistics', label: 'Logistique',     icon: '📦' },
  { id: 'event',     label: 'Événements',     icon: '🎟️' },
  { id: 'luxury',    label: 'Luxe & Bijoux',  icon: '💎' },
  { id: 'fashion',   label: 'Mode',           icon: '👗' },
  { id: 'beauty',    label: 'Beauté',         icon: '💄' },
  { id: 'office',    label: 'Bureau',         icon: '📋' },
  { id: 'qr',        label: 'QR Code',        icon: '📱' },
]

// Avery-compatible templates with precise mm measurements
const TEMPLATES = [
  // ── COMMERCE / RETAIL ──
  { id: 'price_58x40',    name: 'Étiquette prix',         desc: '58×40 mm',               icon: '🏷️', w: 58,   h: 40,   fields: ['name','price','sku','barcode'],              style: 'retail',    category: 'retail',    minPlan: 'free'      as PlanTier },
  { id: 'promo_65x40',    name: 'Promo / Soldes',         desc: '65×40 mm',               icon: '🔴', w: 65,   h: 40,   fields: ['name','price','subtitle','barcode'],         style: 'promo',     category: 'retail',    minPlan: 'starter'   as PlanTier },
  { id: 'shelf_100x30',   name: 'Étagère magasin',        desc: '100×30 mm',              icon: '🏬', w: 100,  h: 30,   fields: ['name','price','sku','barcode'],              style: 'shelf',     category: 'retail',    minPlan: 'starter'   as PlanTier },
  { id: 'multi_70x50',    name: 'Étiquette multi-info',   desc: '70×50 mm',               icon: '📄', w: 70,   h: 50,   fields: ['name','price','sku','subtitle','barcode'],   style: 'retail',    category: 'retail',    minPlan: 'essential' as PlanTier },
  // ── ALIMENTAIRE ──
  { id: 'food_100x70',    name: 'Produit alimentaire',    desc: '100×70 mm',              icon: '🥗', w: 100,  h: 70,   fields: ['name','subtitle','price','sku','barcode','logo'], style: 'food', category: 'food',      minPlan: 'starter'   as PlanTier },
  { id: 'organic_80x60',  name: 'Bio / Organique',        desc: '80×60 mm',               icon: '🌿', w: 80,   h: 60,   fields: ['name','subtitle','price','barcode'],         style: 'food',      category: 'food',      minPlan: 'essential' as PlanTier },
  { id: 'dlc_80x40',      name: 'DLC / Date limite',      desc: '80×40 mm',               icon: '📅', w: 80,   h: 40,   fields: ['name','sku','subtitle','barcode'],           style: 'pharma',    category: 'food',      minPlan: 'essential' as PlanTier },
  // ── PHARMACIE / SANTÉ ──
  { id: 'pharma_70x35',   name: 'Médicament / Labo',      desc: '70×35 mm',               icon: '💊', w: 70,   h: 35,   fields: ['name','sku','barcode'],                      style: 'pharma',    category: 'pharma',    minPlan: 'essential' as PlanTier },
  { id: 'lab_70x30',      name: 'Flacon laboratoire',     desc: '70×30 mm',               icon: '🧪', w: 70,   h: 30,   fields: ['name','sku','barcode'],                      style: 'pharma',    category: 'pharma',    minPlan: 'essential' as PlanTier },
  // ── LOGISTIQUE ──
  { id: 'shipping_100x150', name: 'Expédition colis',     desc: '100×150 mm',             icon: '📮', w: 100,  h: 150,  fields: ['name','subtitle','sku','barcode'],           style: 'logistics', category: 'logistics', minPlan: 'starter'   as PlanTier },
  { id: 'return_100x100', name: 'Retour produit',         desc: '100×100 mm',             icon: '↩️', w: 100,  h: 100,  fields: ['name','sku','subtitle','barcode'],           style: 'logistics', category: 'logistics', minPlan: 'essential' as PlanTier },
  { id: 'palette_105x148',name: 'Palette GS1',            desc: '105×148 mm',             icon: '🏗️', w: 105,  h: 148,  fields: ['name','sku','barcode'],                      style: 'logistics', category: 'logistics', minPlan: 'essential' as PlanTier },
  // ── ÉVÉNEMENTS & BADGES ──
  { id: 'badge_85x55',    name: 'Badge présentiel',       desc: '85×55 mm',               icon: '🪪', w: 85,   h: 55,   fields: ['name','subtitle','logo','barcode'],          style: 'badge',     category: 'event',     minPlan: 'starter'   as PlanTier },
  { id: 'ticket_190x70',  name: 'Ticket événement',       desc: '190×70 mm',              icon: '🎟️', w: 190,  h: 70,   fields: ['name','subtitle','price','sku','barcode'],   style: 'event',     category: 'event',     minPlan: 'essential' as PlanTier },
  { id: 'vip_85x55',      name: 'Badge VIP',              desc: '85×55 mm',               icon: '⭐', w: 85,   h: 55,   fields: ['name','subtitle','logo','barcode'],          style: 'event',     category: 'event',     minPlan: 'pro'       as PlanTier },
  // ── LUXE & BIJOUX ──
  { id: 'luxury_90x50',   name: 'Tag luxe / premium',     desc: '90×50 mm',               icon: '✨', w: 90,   h: 50,   fields: ['name','subtitle','price','logo','barcode'],  style: 'luxury',    category: 'luxury',    minPlan: 'essential' as PlanTier },
  { id: 'jewel_40x25',    name: 'Étiquette bijou',        desc: '40×25 mm',               icon: '💍', w: 40,   h: 25,   fields: ['name','price','barcode'],                    style: 'luxury',    category: 'luxury',    minPlan: 'essential' as PlanTier },
  { id: 'joaillerie_50x30',name: 'Joaillerie fine',       desc: '50×30 mm',               icon: '💎', w: 50,   h: 30,   fields: ['name','price','sku'],                        style: 'luxury',    category: 'luxury',    minPlan: 'pro'       as PlanTier },
  // ── MODE & VÊTEMENTS ──
  { id: 'tag_55x90',      name: 'Tag vêtement',           desc: '55×90 mm',               icon: '👗', w: 55,   h: 90,   fields: ['name','price','sku','barcode'],              style: 'fashion',   category: 'fashion',   minPlan: 'starter'   as PlanTier },
  { id: 'inner_40x15',    name: 'Étiquette intérieure',   desc: '40×15 mm',               icon: '🏷️', w: 40,   h: 15,   fields: ['name','sku'],                                style: 'fashion',   category: 'fashion',   minPlan: 'essential' as PlanTier },
  { id: 'tag_mode_50x80', name: 'Tag prix mode',          desc: '50×80 mm',               icon: '🎀', w: 50,   h: 80,   fields: ['name','price','sku','subtitle','barcode'],   style: 'fashion',   category: 'fashion',   minPlan: 'essential' as PlanTier },
  // ── BEAUTÉ & COSMÉTIQUE ──
  { id: 'flacon_80x40',   name: 'Flacon cosmétique',      desc: '80×40 mm',               icon: '🧴', w: 80,   h: 40,   fields: ['name','subtitle','barcode'],                 style: 'beauty',    category: 'beauty',    minPlan: 'starter'   as PlanTier },
  { id: 'pot_65x30',      name: 'Pot crème / soin',       desc: '65×30 mm',               icon: '🫧', w: 65,   h: 30,   fields: ['name','sku','barcode'],                      style: 'beauty',    category: 'beauty',    minPlan: 'essential' as PlanTier },
  { id: 'parfum_50x80',   name: 'Parfum / Coffret',       desc: '50×80 mm',               icon: '🌸', w: 50,   h: 80,   fields: ['name','subtitle','price','logo'],             style: 'beauty',    category: 'beauty',    minPlan: 'pro'       as PlanTier },
  // ── BUREAU & ADMIN ──
  { id: 'folder_190x38',  name: 'Étiquette dossier',      desc: '190×38 mm',              icon: '📁', w: 190,  h: 38,   fields: ['name','subtitle'],                           style: 'office',    category: 'office',    minPlan: 'free'      as PlanTier },
  { id: 'address_63x38',  name: 'Adresse / Courrier',     desc: '63×38 mm',               icon: '✉️', w: 63,   h: 38,   fields: ['name','subtitle'],                           style: 'office',    category: 'office',    minPlan: 'starter'   as PlanTier },
  { id: 'asset_80x40',    name: 'Inventaire / Actif',     desc: '80×40 mm',               icon: '🖥️', w: 80,   h: 40,   fields: ['name','sku','barcode'],                      style: 'office',    category: 'office',    minPlan: 'essential' as PlanTier },
  // ── QR CODE INTÉGRÉ ──
  { id: 'qr_product_70x70', name: 'QR + Produit',         desc: '70×70 mm',               icon: '📱', w: 70,   h: 70,   fields: ['name','price','barcode'],                    style: 'qr',        category: 'qr',        minPlan: 'starter'   as PlanTier },
  { id: 'qr_full_100x60', name: 'QR + Description',       desc: '100×60 mm',              icon: '🔗', w: 100,  h: 60,   fields: ['name','subtitle','price','barcode'],         style: 'qr',        category: 'qr',        minPlan: 'essential' as PlanTier },
  // ── FEUILLES AVERY ──
  { id: 'a4_avery',       name: 'Avery L7160 (24 étiq.)', desc: '3×8 • 63.5×33.9 mm',    icon: '📄', w: 63.5, h: 33.9, fields: ['name','price','sku','barcode'],              style: 'retail',    category: 'office',    minPlan: 'essential' as PlanTier, isSheet: true, cols: 3, rows: 8, marginX: 7.25, marginY: 15.15, gapX: 2.5, gapY: 0 },
  { id: 'a4_avery_large', name: 'Avery L7168 (8 étiq.)',  desc: '2×4 • 99.1×67.7 mm',    icon: '📋', w: 99.1, h: 67.7, fields: ['name','subtitle','price','sku','barcode','logo'], style: 'retail', category: 'office', minPlan: 'pro'       as PlanTier, isSheet: true, cols: 2, rows: 4, marginX: 5.5, marginY: 21.5, gapX: 3, gapY: 3 },
]

const BARCODE_TYPES = [
  { id: 'code128',         label: 'Code 128'          },
  { id: 'ean13',           label: 'EAN-13'            },
  { id: 'ean8',            label: 'EAN-8'             },
  { id: 'upca',            label: 'UPC-A'             },
  { id: 'upce',            label: 'UPC-E'             },
  { id: 'code39',          label: 'Code 39'           },
  { id: 'code39ext',       label: 'Code 39 Extended'  },
  { id: 'code93',          label: 'Code 93'           },
  { id: 'codabar',         label: 'Codabar'           },
  { id: 'interleaved2of5', label: 'Interleaved 2/5'  },
  { id: 'itf14',           label: 'ITF-14'            },
  { id: 'ean128',          label: 'EAN-128 / GS1-128' },
  { id: 'isbn',            label: 'ISBN'              },
  { id: 'datamatrix',      label: 'Data Matrix'       },
  { id: 'gs1datamatrix',   label: 'GS1 Data Matrix'   },
  { id: 'pdf417',          label: 'PDF 417'           },
  { id: 'qrcode',          label: 'QR Code'           },
]

const STYLE_THEMES: Record<string, { accent: string; bg: string; text: string; nameBold: boolean }> = {
  retail:    { accent: '#FF6A00', bg: '#ffffff', text: '#1a1a1a', nameBold: true  },
  promo:     { accent: '#ef4444', bg: '#fff5f5', text: '#7f1d1d', nameBold: true  },
  badge:     { accent: '#041B4D', bg: '#f0f4ff', text: '#041B4D', nameBold: true  },
  shelf:     { accent: '#10b981', bg: '#ffffff', text: '#111',    nameBold: false },
  pharma:    { accent: '#3b82f6', bg: '#f0f8ff', text: '#1a3a5c', nameBold: false },
  luxury:    { accent: '#b45309', bg: '#fffbeb', text: '#1a0a00', nameBold: true  },
  food:      { accent: '#16a34a', bg: '#f0fdf4', text: '#14532d', nameBold: true  },
  logistics: { accent: '#475569', bg: '#f8fafc', text: '#1e293b', nameBold: false },
  event:     { accent: '#7c3aed', bg: '#f5f3ff', text: '#2e1065', nameBold: true  },
  fashion:   { accent: '#111827', bg: '#fafafa', text: '#111827', nameBold: true  },
  beauty:    { accent: '#db2777', bg: '#fdf2f8', text: '#831843', nameBold: true  },
  office:    { accent: '#2563eb', bg: '#eff6ff', text: '#1e3a8a', nameBold: false },
  qr:        { accent: '#0891b2', bg: '#ecfeff', text: '#164e63', nameBold: true  },
}

function buildBarcodeUrl(type: string, text: string, height = 12, scale = 2) {
  if (!text) return ''
  return `/api/barcode/image?type=${type}&text=${encodeURIComponent(text)}&height=${height}&scale=${scale}&color=000000&bg=ffffff`
}

// SVG preview
function LabelSVGPreview({ tpl, data, barcodeUrl, logoDataUrl, themeOverride }: {
  tpl: typeof TEMPLATES[0]
  data: Record<string, string>
  barcodeUrl: string
  logoDataUrl: string
  themeOverride?: { accent?: string; bg?: string }
}) {
  const SC = 3.3 // px per mm
  const W = tpl.w * SC
  const H = tpl.h * SC
  const baseTheme = STYLE_THEMES[tpl.style] || STYLE_THEMES.retail
  const theme = { ...baseTheme, ...Object.fromEntries(Object.entries(themeOverride || {}).filter(([,v]) => v)) }
  const pad = 5

  return (
    <div className="inline-block rounded-xl overflow-hidden shadow-md"
      style={{ width: W, height: H, background: theme.bg, border: `1.5px solid ${theme.accent}30`, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Accent bar */}
      {tpl.style !== 'shelf' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: H * 0.06, background: theme.accent }} />
      )}

      <div style={{ position: 'absolute', inset: 0, padding: pad, paddingTop: tpl.style !== 'shelf' ? H * 0.06 + pad : pad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Top section */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
          {logoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoDataUrl} alt="logo"
              style={{ width: H * 0.25, height: H * 0.25, objectFit: 'contain', borderRadius: 3, flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {data.name && (
              <p style={{ fontSize: tpl.h > 45 ? 10 : tpl.h > 35 ? 8 : 7, fontWeight: theme.nameBold ? 800 : 600, color: theme.text, margin: 0, lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {data.name}
              </p>
            )}
            {data.subtitle && (
              <p style={{ fontSize: 7, color: theme.accent, margin: 0, lineHeight: 1.3, fontWeight: 600 }}>{data.subtitle}</p>
            )}
            {data.sku && (
              <p style={{ fontSize: 6, color: '#9ca3af', margin: 0 }}>#{data.sku}</p>
            )}
          </div>
        </div>

        {/* Bottom section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 }}>
          {data.price && (
            <div>
              <p style={{ fontSize: tpl.h > 45 ? 16 : tpl.h > 30 ? 13 : 10, fontWeight: 900, color: theme.accent, margin: 0, lineHeight: 1 }}>
                {data.price}
              </p>
            </div>
          )}
          {barcodeUrl && data.barcode && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={barcodeUrl} alt="barcode"
              style={{ maxHeight: tpl.h > 40 ? 26 : tpl.h > 30 ? 20 : 14, imageRendering: 'pixelated', flexShrink: 0 }} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function LabelsPage() {
  const { tier } = usePlan()
  const tl = useTranslations('labels')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [templateId, setTemplateId] = useState('price_58x40')
  const [barcodeType, setBarcodeType] = useState('code128')
  const [copies, setCopies] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [exportingPng, setExportingPng] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [accentColor, setAccentColor] = useState('')
  const [bgColor, setBgColor] = useState('')
  const [logoDataUrl, setLogoDataUrl] = useState('')
  const logoRef = useRef<HTMLInputElement>(null)

  const [data, setData] = useState<Record<string, string>>({
    name: 'Produit Example',
    price: '4 900 FCFA',
    barcode: 'QRX-2025-001',
    subtitle: 'Sous-titre / Description',
    sku: 'REF-001',
    logo: '',
  })

  const tpl = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0]
  const baseTheme = STYLE_THEMES[tpl.style] || STYLE_THEMES.retail
  const effectiveTheme = { ...baseTheme, accent: accentColor || baseTheme.accent, bg: bgColor || baseTheme.bg }
  const barcodeH = tpl.h > 40 ? 14 : tpl.h > 30 ? 10 : 8
  const barcodeUrl = buildBarcodeUrl(barcodeType, data.barcode, barcodeH, 2)

  function updateField(key: string, val: string) {
    setData(prev => ({ ...prev, [key]: val }))
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setLogoDataUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function generatePDF() {
    setGenerating(true)
    try {
      // Server-side credit check for premium templates
      if (tpl.minPlan !== 'free') {
        const res = await fetch('/api/label/check-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateMinPlan: tpl.minPlan }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          alert(data.error || 'Crédits insuffisants ou abonnement requis')
          return
        }
      }

      const { jsPDF } = await import('jspdf')

      const isSheet = !!tpl.isSheet
      const doc = isSheet
        ? new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
        : new jsPDF({ orientation: tpl.w > tpl.h ? 'landscape' : 'portrait', unit: 'mm', format: [tpl.w + 20, tpl.h * copies + (copies - 1) * 3 + 20], compress: true })

      const sheet = tpl as typeof tpl & { cols?: number; rows?: number; marginX?: number; marginY?: number; gapX?: number; gapY?: number }
      const totalLabels = isSheet ? (sheet.cols! * sheet.rows!) : copies
      const cols = isSheet ? sheet.cols! : 1
      const mX = isSheet ? sheet.marginX! : 8
      const mY = isSheet ? sheet.marginY! : 8
      const gX = isSheet ? sheet.gapX! : 0
      const gY = isSheet ? sheet.gapY! : 2

      // Fetch barcode PNG
      let barPng = ''
      if (data.barcode && barcodeUrl) {
        try {
          const res = await fetch(barcodeUrl)
          const blob = await res.blob()
          barPng = await blobToDataUrl(blob)
        } catch { /* skip */ }
      }

      for (let i = 0; i < totalLabels; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = mX + col * (tpl.w + gX)
        const y = mY + row * (tpl.h + gY)

        drawLabel(doc, { x, y, tpl, data, theme: effectiveTheme, logoDataUrl, barPng, barcodeH })
      }

      // Crop marks for individual labels (non-sheet)
      if (!isSheet && copies > 1) {
        const totalPages = doc.getNumberOfPages()
        for (let p = 1; p <= totalPages; p++) {
          doc.setPage(p)
          doc.setDrawColor(180, 180, 180)
          doc.setLineWidth(0.1)
          for (let i = 0; i < copies; i++) {
            const lY = 10 + i * (tpl.h + 3)
            // top crop line
            doc.line(8, lY, 8 + tpl.w + 4, lY)
            // bottom crop line
            doc.line(8, lY + tpl.h, 8 + tpl.w + 4, lY + tpl.h)
          }
        }
      }

      // Watermark for free users
      if (!tierAtLeast(tier, 'starter')) {
        const pageCount = doc.getNumberOfPages()
        for (let p = 1; p <= pageCount; p++) {
          doc.setPage(p)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(8)
          doc.setTextColor(200, 200, 200)
          doc.text('QR CODE EXPRESS — qrcode-express.com', 10, isSheet ? 293 : tpl.h * copies + 16 - 3)
        }
      }

      doc.save(`etiquettes-${templateId}-${Date.now()}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  async function exportPNG() {
    if (tpl.minPlan !== 'free') {
      const res = await fetch('/api/label/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateMinPlan: tpl.minPlan }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert(d.error || 'Credits insuffisants ou abonnement requis')
        return
      }
    }
    setExportingPng(true)
    try {
      const SC = 4
      const canvas = document.createElement('canvas')
      canvas.width = tpl.w * SC
      canvas.height = tpl.h * SC
      const ctx = canvas.getContext('2d')!
      const th = effectiveTheme
      const pad = 6 * SC

      ctx.fillStyle = th.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (tpl.style !== 'shelf') {
        ctx.fillStyle = th.accent
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.06)
      }

      ctx.strokeStyle = th.accent + '40'
      ctx.lineWidth = 1.5
      ctx.strokeRect(0.75, 0.75, canvas.width - 1.5, canvas.height - 1.5)

      const topOffset = tpl.style !== 'shelf' ? canvas.height * 0.06 : 0
      let curY = topOffset + pad + 10

      if (logoDataUrl) {
        const img = new Image()
        await new Promise<void>(r => { img.onload = () => r(); img.src = logoDataUrl })
        const ls = canvas.height * 0.22
        ctx.drawImage(img, pad, topOffset + pad, ls, ls)
      }

      const logoSize = logoDataUrl ? canvas.height * 0.22 : 0
      const textX = pad + (logoSize ? logoSize + 5 : 0)

      if (data.name) {
        ctx.fillStyle = th.text
        ctx.font = `${th.nameBold ? '800' : '600'} ${(tpl.h > 45 ? 10 : tpl.h > 35 ? 8 : 7) * SC / 3.3}px system-ui,sans-serif`
        ctx.fillText(data.name.slice(0, 32), textX, curY)
        curY += tpl.h > 40 ? 14 : 11
      }

      if (data.subtitle) {
        ctx.fillStyle = th.accent
        ctx.font = `600 ${7 * SC / 3.3}px system-ui,sans-serif`
        ctx.fillText(data.subtitle.slice(0, 40), textX, curY)
        curY += 10
      }

      if (data.sku) {
        ctx.fillStyle = '#9ca3af'
        ctx.font = `normal ${6 * SC / 3.3}px system-ui,sans-serif`
        ctx.fillText(`#${data.sku}`, textX, curY)
      }

      if (data.price) {
        ctx.fillStyle = th.accent
        ctx.font = `900 ${(tpl.h > 45 ? 16 : tpl.h > 30 ? 13 : 10) * SC / 3.3}px system-ui,sans-serif`
        ctx.fillText(data.price, pad, canvas.height - pad - 4)
      }

      if (data.barcode && barcodeUrl) {
        try {
          const img = new Image()
          await new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r(); img.src = barcodeUrl })
          const bcH = barcodeH * SC * 0.9
          const bcW = bcH * 2.2
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(img, canvas.width - bcW - pad, canvas.height - bcH - pad, bcW, bcH)
        } catch { /* skip */ }
      }

      await new Promise<void>(r => canvas.toBlob(blob => {
        if (!blob) { r(); return }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `etiquette-${templateId}-${Date.now()}.png`
        a.click(); URL.revokeObjectURL(url); r()
      }, 'image/png'))
    } finally {
      setExportingPng(false)
    }
  }

  async function saveLabel() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { alert('Connectez-vous pour sauvegarder'); return }
      await supabase.from('qr_codes').insert({
        user_id: user.id,
        type: 'label',
        mode: 'static',
        content: JSON.stringify({ templateId, data, barcodeType, copies, accentColor, bgColor }),
        name: (data.name || 'Etiquette').slice(0, 100),
        status: 'active',
      })
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#041B4D]">{tl('page_title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{tl('page_sub')}</p>
        </div>

        <PlanHeaderBanner
          currentTier={tier}
          toolName="Étiquettes"
          freeLimit="2 gabarits + watermark · 5 étiquettes/PDF · sans upload logo"
          starterLimit="10 gabarits · sans watermark · 24 étiquettes/PDF · upload logo"
          essentialLimit="20 gabarits · 10 catégories · Avery A4 · illimité"
        />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-5">

            {/* Templates */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tl('sec_template')}</p>
                <span className="text-[10px] text-gray-400">{TEMPLATES.filter(t => selectedCategory === 'all' || t.category === selectedCategory).length} {tl('models_count')}</span>
              </div>

              {/* Category filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-[#041B4D] text-white border-[#041B4D]'
                        : 'border-gray-200 text-gray-500 hover:border-[#FF6A00] hover:text-[#FF6A00]'
                    }`}>
                    <span>{cat.icon}</span>
                    <span>{tl(`cat_${cat.id}` as 'cat_all')}</span>
                  </button>
                ))}
              </div>

              {/* Template grid */}
              <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {TEMPLATES
                  .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
                  .map(t => {
                    const locked = !tierAtLeast(tier, t.minPlan)
                    const PLAN_COLOR: Record<string, string> = { free: '#64748b', starter: '#3b82f6', essential: '#0ea5e9', pro: '#FF6A00', business: '#041B4D' }
                    const PLAN_LABEL: Record<string, string> = { free: tl('plan_free'), starter: tl('plan_starter'), essential: tl('plan_essential'), pro: tl('plan_pro'), business: tl('plan_biz') }
                    const theme = STYLE_THEMES[t.style] || STYLE_THEMES.retail
                    return (
                      <button key={t.id}
                        onClick={() => setTemplateId(t.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all relative ${templateId === t.id ? 'border-[#FF6A00] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        {/* Color swatch */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded flex items-center justify-center text-sm flex-shrink-0"
                            style={{ background: theme.bg, border: `1.5px solid ${theme.accent}40` }}>
                            <span className="text-[10px]">{t.icon}</span>
                          </div>
                          <p className={`text-[11px] font-bold leading-tight ${templateId === t.id ? 'text-[#FF6A00]' : 'text-gray-700'}`}>
                            {tl(`tpl_${t.id}` as 'tpl_price_58x40')}
                          </p>
                        </div>
                        <p className="text-[9px] text-gray-400">{t.desc}</p>
                        {/* Plan badge */}
                        {t.minPlan !== 'free' && (
                          <span className="absolute top-1.5 right-1.5 text-[8px] font-bold px-1 py-0.5 rounded"
                            style={{ background: PLAN_COLOR[t.minPlan] + '20', color: PLAN_COLOR[t.minPlan] }}>
                            {locked ? '🔒 ' : ''}{PLAN_LABEL[t.minPlan]}
                          </span>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>

            {/* Fields */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tl('sec_content')}</p>

              {tpl.fields.includes('name') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{tl('lbl_name')}</label>
                  <input value={data.name} onChange={e => updateField('name', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
                </div>
              )}
              {tpl.fields.includes('subtitle') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{tl('lbl_subtitle')}</label>
                  <input value={data.subtitle} onChange={e => updateField('subtitle', e.target.value)}
                    placeholder={tl('lbl_subtitle_ph')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
                </div>
              )}
              {tpl.fields.includes('price') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{tl('lbl_price')}</label>
                  <input value={data.price} onChange={e => updateField('price', e.target.value)}
                    placeholder="4 900 FCFA"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
                </div>
              )}
              {tpl.fields.includes('sku') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{tl('lbl_sku')}</label>
                  <input value={data.sku} onChange={e => updateField('sku', e.target.value)}
                    placeholder="REF-001"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
                </div>
              )}
              {tpl.fields.includes('barcode') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{tl('lbl_barcode')}</label>
                    <input value={data.barcode} onChange={e => updateField('barcode', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{tl('lbl_type')}</label>
                    <select value={barcodeType} onChange={e => setBarcodeType(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40">
                      {BARCODE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {tpl.fields.includes('logo') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {tl('lbl_logo')}
                    <LockBadge requiredTier="starter" currentTier={tier} />
                  </label>
                  {tierAtLeast(tier, 'starter') ? (
                    <div className="flex items-center gap-3">
                      <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                      <button onClick={() => logoRef.current?.click()}
                        className="flex-1 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-xs text-gray-500 font-semibold hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all">
                        {logoDataUrl ? tl('btn_change') : tl('btn_upload')}
                      </button>
                      {logoDataUrl && (
                        <button onClick={() => setLogoDataUrl('')}
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm">✕</button>
                      )}
                    </div>
                  ) : (
                    <Link href="/tarifs"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-orange-200 text-xs text-[#b84d00] font-semibold bg-orange-50 hover:bg-orange-100 transition-all">
                      {tl('btn_upload_locked')}
                    </Link>
                  )}
                </div>
              )}

              {/* Color overrides */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500">Couleurs personnalisées</p>
                  {(accentColor || bgColor) && (
                    <button onClick={() => { setAccentColor(''); setBgColor('') }}
                      className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">
                      ↺ Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input type="color" value={accentColor || baseTheme.accent}
                      onChange={e => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer p-0 border border-gray-200" />
                    <span className="text-[10px] text-gray-400">Accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor || baseTheme.bg}
                      onChange={e => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer p-0 border border-gray-200" />
                    <span className="text-[10px] text-gray-400">Fond</span>
                  </div>
                </div>
              </div>

              {!tpl.isSheet && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {tl('lbl_copies')} ({copies})
                    {!tierAtLeast(tier, 'starter') && <span className="ml-1 text-[#b84d00]">· {tl('lbl_copies_free')}</span>}
                  </label>
                  <input type="range" min={1} max={tierAtLeast(tier, 'starter') ? 20 : 5} value={copies}
                    onChange={e => setCopies(Number(e.target.value))}
                    className="w-full accent-[#FF6A00]" />
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{tl('sec_preview')}</p>
              <div className="flex justify-center">
                <div className="relative inline-block">
                  <LabelSVGPreview tpl={tpl} data={data} barcodeUrl={barcodeUrl} logoDataUrl={logoDataUrl} themeOverride={{ accent: accentColor || undefined, bg: bgColor || undefined }} />
                  {tpl.minPlan !== 'free' && !tierAtLeast(tier, tpl.minPlan) && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl pointer-events-none"
                      style={{ background: 'rgba(255,255,255,0.55)' }}>
                      <p className="text-[9px] font-bold text-gray-500 tracking-widest uppercase select-none"
                        style={{ transform: 'rotate(-15deg)', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                        APERÇU — qrcode-express.com
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">
                {tpl.isSheet ? tl('sheet_info') : `${copies} × ${tpl.w}×${tpl.h} mm`}
              </p>
            </div>

            <button onClick={generatePDF} disabled={generating}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-[#FF6A00] to-[#ee0979] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
              {generating ? tl('btn_generating') : tl('btn_pdf')}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={exportPNG} disabled={exportingPng}
                className="py-2.5 rounded-xl font-bold text-xs border border-gray-200 text-gray-600 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                {exportingPng ? '...' : '🖼️ Export PNG'}
              </button>
              <button onClick={saveLabel} disabled={saving}
                className={`py-2.5 rounded-xl font-bold text-xs border transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 ${savedOk ? 'border-green-400 text-green-600 bg-green-50' : 'border-gray-200 text-gray-600 hover:border-[#041B4D] hover:text-[#041B4D]'}`}>
                {saving ? '...' : savedOk ? '✓ Sauvegarde' : '💾 Sauvegarder'}
              </button>
            </div>

            <a href="/labels/batch"
              className="w-full py-2.5 rounded-xl font-bold text-xs border border-gray-200 text-gray-600 hover:border-[#041B4D] hover:text-[#041B4D] transition-colors flex items-center justify-center gap-2 block text-center">
              📂 Import CSV — plusieurs etiquettes
            </a>

            <a href="/barcode"
              className="w-full py-2.5 rounded-xl font-bold text-xs border border-gray-200 text-gray-600 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors flex items-center justify-center gap-2 block text-center">
              {tl('btn_barcode_gen')}
            </a>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 space-y-1">
              <p className="font-bold">{tl('tips_title')}</p>
              <p>• {tl('tips_1')}</p>
              <p>• {tl('tips_2')}</p>
              <p>• {tl('tips_3')}</p>
              <p>• {tl('tips_4')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function drawLabel(doc: import('jspdf').jsPDF, opts: {
  x: number; y: number
  tpl: typeof TEMPLATES[0]
  data: Record<string, string>
  theme: typeof STYLE_THEMES[string]
  logoDataUrl: string
  barPng: string
  barcodeH: number
}) {
  const { x, y, tpl, data, theme, logoDataUrl, barPng, barcodeH } = opts
  const pad = 2

  // Background
  doc.setFillColor(theme.bg)
  doc.rect(x, y, tpl.w, tpl.h, 'F')

  // Border
  doc.setDrawColor(theme.accent)
  doc.setLineWidth(0.3)
  doc.rect(x, y, tpl.w, tpl.h)

  // Accent top bar
  if (tpl.style !== 'shelf') {
    const barH = tpl.h * 0.055
    const rgb = hexToRgb(theme.accent)
    if (rgb) doc.setFillColor(rgb.r, rgb.g, rgb.b)
    doc.rect(x, y, tpl.w, barH, 'F')
  }

  const topOffset = tpl.style !== 'shelf' ? tpl.h * 0.055 : 0
  let curY = y + topOffset + pad + 3

  // Logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, x + pad, y + topOffset + pad, tpl.h * 0.18, tpl.h * 0.18)
    } catch { /* skip */ }
  }
  const textX = logoDataUrl ? x + pad + tpl.h * 0.18 + 1.5 : x + pad

  // Name
  if (data.name) {
    const rgb = hexToRgb(theme.text)
    if (rgb) doc.setTextColor(rgb.r, rgb.g, rgb.b)
    doc.setFont('helvetica', theme.nameBold ? 'bold' : 'normal')
    doc.setFontSize(tpl.h > 45 ? 7 : tpl.h > 30 ? 6 : 5.5)
    const nameStr = doc.splitTextToSize(data.name, tpl.w - pad * 2 - (logoDataUrl ? tpl.h * 0.18 + 2 : 0))[0]
    doc.text(nameStr, textX, curY)
    curY += tpl.h > 40 ? 3.5 : 2.8
  }

  // Subtitle
  if (data.subtitle) {
    const rgb = hexToRgb(theme.accent)
    if (rgb) doc.setTextColor(rgb.r, rgb.g, rgb.b)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5)
    doc.text(data.subtitle.slice(0, 35), textX, curY)
    curY += 2.8
  }

  // SKU
  if (data.sku) {
    doc.setTextColor(180, 180, 180)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(4.5)
    doc.text(`#${data.sku}`, textX, curY)
  }

  // Price (bottom-left)
  if (data.price) {
    const rgb = hexToRgb(theme.accent)
    if (rgb) doc.setTextColor(rgb.r, rgb.g, rgb.b)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(tpl.h > 45 ? 9 : tpl.h > 30 ? 7.5 : 6)
    doc.text(data.price, x + pad, y + tpl.h - pad - 1)
  }

  // Barcode (bottom-right)
  if (barPng) {
    const bcW = barcodeH * 2.2
    const bcX = x + tpl.w - bcW - pad
    const bcY = y + tpl.h - barcodeH - pad - 0.5
    try {
      doc.addImage(barPng, 'PNG', bcX, bcY, bcW, barcodeH)
    } catch { /* skip */ }
  }
}

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null
}
