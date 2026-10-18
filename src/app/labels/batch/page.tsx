'use client'
import { useState, useRef } from 'react'
import { usePlan, tierAtLeast, type PlanTier } from '@/components/ui/PlanGate'
import Link from 'next/link'

// Simplified template list for batch (only non-sheet templates)
const BATCH_TEMPLATES = [
  { id: 'price_58x40',   label: 'Prix 58x40',        w: 58,  h: 40,  minPlan: 'free'      as PlanTier },
  { id: 'promo_65x40',   label: 'Promo 65x40',        w: 65,  h: 40,  minPlan: 'starter'   as PlanTier },
  { id: 'shelf_100x30',  label: 'Etagere 100x30',     w: 100, h: 30,  minPlan: 'starter'   as PlanTier },
  { id: 'multi_70x50',   label: 'Multi-info 70x50',   w: 70,  h: 50,  minPlan: 'essential' as PlanTier },
  { id: 'food_100x70',   label: 'Alimentaire 100x70', w: 100, h: 70,  minPlan: 'starter'   as PlanTier },
  { id: 'pharma_70x40',  label: 'Pharmacie 70x40',    w: 70,  h: 40,  minPlan: 'essential' as PlanTier },
  { id: 'badge_90x55',   label: 'Badge 90x55',        w: 90,  h: 55,  minPlan: 'starter'   as PlanTier },
  { id: 'logistic_100x50', label: 'Logistique 100x50', w: 100, h: 50, minPlan: 'essential' as PlanTier },
]

const BARCODE_TYPES = [
  { id: 'code128', label: 'Code 128' },
  { id: 'ean13',   label: 'EAN-13'   },
  { id: 'ean8',    label: 'EAN-8'    },
  { id: 'upca',    label: 'UPC-A'    },
  { id: 'qrcode',  label: 'QR Code'  },
]

const EXAMPLE_CSV = `name,price,sku,subtitle,barcode
Cafe Arabica 250g,2 500 FCFA,CAF-001,Origine Ethiopie,EAN-001
The Vert Bio,1 800 FCFA,THE-002,Certifie Bio,EAN-002
Sucre Roux 1kg,1 200 FCFA,SUC-003,,EAN-003
`

interface LabelRow {
  name: string; price: string; sku: string; subtitle: string; barcode: string
  status: 'pending' | 'ok' | 'error'; error?: string
}

function parseCSV(text: string): LabelRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const header = lines[0].toLowerCase().split(',').map(s => s.trim())
  const idx = (col: string) => header.indexOf(col)
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cols = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
    return {
      name:     idx('name')     >= 0 ? cols[idx('name')]     || '' : '',
      price:    idx('price')    >= 0 ? cols[idx('price')]    || '' : '',
      sku:      idx('sku')      >= 0 ? cols[idx('sku')]      || '' : '',
      subtitle: idx('subtitle') >= 0 ? cols[idx('subtitle')] || '' : '',
      barcode:  idx('barcode')  >= 0 ? cols[idx('barcode')]  || '' : '',
      status: 'pending' as const,
    }
  }).filter(r => r.name || r.barcode)
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null
}

const STYLE_THEMES: Record<string, { bg: string; accent: string; text: string; nameBold: boolean }> = {
  retail:    { bg: '#ffffff', accent: '#1e3a5f', text: '#111827', nameBold: true  },
  promo:     { bg: '#fff5f5', accent: '#dc2626', text: '#111827', nameBold: true  },
  shelf:     { bg: '#f8fafc', accent: '#0ea5e9', text: '#1e293b', nameBold: false },
  food:      { bg: '#f0fdf4', accent: '#16a34a', text: '#14532d', nameBold: true  },
  pharma:    { bg: '#eff6ff', accent: '#2563eb', text: '#1e3a8a', nameBold: false },
  badge:     { bg: '#fafafa', accent: '#7c3aed', text: '#111827', nameBold: true  },
  logistics: { bg: '#fefce8', accent: '#ca8a04', text: '#111827', nameBold: false },
}

const TEMPLATE_STYLES: Record<string, string> = {
  price_58x40:     'retail',
  promo_65x40:     'promo',
  shelf_100x30:    'shelf',
  multi_70x50:     'retail',
  food_100x70:     'food',
  pharma_70x40:    'pharma',
  badge_90x55:     'badge',
  logistic_100x50: 'logistics',
}

export default function LabelsBatchPage() {
  const { tier } = usePlan()
  const [templateId, setTemplateId] = useState('price_58x40')
  const [barcodeType, setBarcodeType] = useState('code128')
  const [rows, setRows] = useState<LabelRow[]>([])
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const tpl = BATCH_TEMPLATES.find(t => t.id === templateId) || BATCH_TEMPLATES[0]
  const styleName = TEMPLATE_STYLES[templateId] || 'retail'
  const theme = STYLE_THEMES[styleName] || STYLE_THEMES.retail

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setRows(parseCSV(ev.target?.result as string))
    reader.readAsText(file, 'UTF-8')
  }

  function handlePaste(text: string) {
    setRows(parseCSV(text))
  }

  async function generatePDF() {
    if (!rows.length) return

    // Access gate for premium templates
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

    setGenerating(true)
    setProgress(0)

    const barcodeH = tpl.h > 40 ? 14 : tpl.h > 30 ? 10 : 8
    const { jsPDF } = await import('jspdf')
    const labelsPerPage = tierAtLeast(tier, 'starter') ? rows.length : Math.min(rows.length, 5)

    // Layout: 2 labels per row, with margins
    const cols = 2
    const mX = 10
    const mY = 10
    const gX = 4
    const gY = 3
    const labelsPerRow = cols
    const labelsPerPdf = Math.ceil(labelsPerPage / labelsPerRow)

    const pageW = mX * 2 + cols * tpl.w + (cols - 1) * gX
    const pageH = mY * 2 + Math.ceil(labelsPerPage / cols) * tpl.h + (Math.ceil(labelsPerPage / cols) - 1) * gY
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pageW, Math.min(pageH, 297)], compress: true })

    const updatedRows = [...rows]

    for (let i = 0; i < labelsPerPage; i++) {
      const row = rows[i]
      const col = i % cols
      const rowIdx = Math.floor(i / cols)
      const x = mX + col * (tpl.w + gX)
      const y = mY + rowIdx * (tpl.h + gY)

      // Fetch barcode PNG if barcode value present
      let barPng = ''
      if (row.barcode) {
        try {
          const barUrl = `/api/barcode/image?${new URLSearchParams({ type: barcodeType, text: row.barcode, height: String(barcodeH), scale: '2' })}`
          const res = await fetch(barUrl)
          if (res.ok) barPng = await blobToDataUrl(await res.blob())
        } catch { /* skip */ }
      }

      // Draw label background
      doc.setFillColor(theme.bg)
      doc.rect(x, y, tpl.w, tpl.h, 'F')
      doc.setDrawColor(theme.accent)
      doc.setLineWidth(0.3)
      doc.rect(x, y, tpl.w, tpl.h)

      // Accent bar
      if (styleName !== 'shelf') {
        const barH = tpl.h * 0.055
        const rgb = hexToRgb(theme.accent)
        if (rgb) doc.setFillColor(rgb.r, rgb.g, rgb.b)
        doc.rect(x, y, tpl.w, barH, 'F')
      }

      const topOffset = styleName !== 'shelf' ? tpl.h * 0.055 : 0
      const pad = 2
      let curY = y + topOffset + pad + 3

      if (row.name) {
        const rgb = hexToRgb(theme.text)
        if (rgb) doc.setTextColor(rgb.r, rgb.g, rgb.b)
        doc.setFont('helvetica', theme.nameBold ? 'bold' : 'normal')
        doc.setFontSize(tpl.h > 45 ? 7 : tpl.h > 30 ? 6 : 5.5)
        doc.text(doc.splitTextToSize(row.name, tpl.w - pad * 2)[0], x + pad, curY)
        curY += tpl.h > 40 ? 3.5 : 2.8
      }

      if (row.subtitle) {
        const rgb = hexToRgb(theme.accent)
        if (rgb) doc.setTextColor(rgb.r, rgb.g, rgb.b)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(5)
        doc.text(row.subtitle.slice(0, 35), x + pad, curY)
        curY += 2.8
      }

      if (row.sku) {
        doc.setTextColor(180, 180, 180)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(4.5)
        doc.text(`#${row.sku}`, x + pad, curY)
      }

      if (row.price) {
        const rgb = hexToRgb(theme.accent)
        if (rgb) doc.setTextColor(rgb.r, rgb.g, rgb.b)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(tpl.h > 45 ? 9 : tpl.h > 30 ? 7.5 : 6)
        doc.text(row.price, x + pad, y + tpl.h - pad - 1)
      }

      if (barPng) {
        const bcW = barcodeH * 2.2
        const bcX = x + tpl.w - bcW - pad
        const bcY = y + tpl.h - barcodeH - pad - 0.5
        try { doc.addImage(barPng, 'PNG', bcX, bcY, bcW, barcodeH) } catch { /* skip */ }
      }

      updatedRows[i] = { ...row, status: 'ok' }
      setRows([...updatedRows])
      setProgress(Math.round(((i + 1) / labelsPerPage) * 100))
    }

    // Watermark for free users
    if (!tierAtLeast(tier, 'starter')) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(200, 200, 200)
      doc.text('QR CODE EXPRESS — qrcode-express.com', mX, pageH - 3)
    }

    doc.save(`etiquettes-batch-${templateId}-${Date.now()}.pdf`)
    setGenerating(false)
  }

  const canGenerate = rows.length > 0 && !generating

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#041B4D]">Etiquettes en lot (CSV)</h1>
            <p className="text-sm text-gray-500 mt-1">Importez un CSV pour generer plusieurs etiquettes en un seul PDF</p>
          </div>
          <Link href="/labels" className="text-xs font-semibold text-gray-500 hover:text-[#FF6A00] border border-gray-200 rounded-xl px-3 py-2">
            ← Retour
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: config */}
          <div className="space-y-4">
            {/* Template */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Gabarit</p>
              <div className="grid grid-cols-2 gap-2">
                {BATCH_TEMPLATES.map(t => {
                  const locked = !tierAtLeast(tier, t.minPlan)
                  return (
                    <button key={t.id} onClick={() => setTemplateId(t.id)}
                      className={`text-left p-2.5 rounded-xl border text-[11px] font-semibold transition-all relative ${templateId === t.id ? 'border-[#FF6A00] bg-orange-50 text-[#FF6A00]' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                      {t.label}
                      {locked && <span className="absolute top-1 right-1 text-[8px]">🔒</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Barcode type */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Type de code-barres</p>
              <select value={barcodeType} onChange={e => setBarcodeType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40">
                {BARCODE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* CSV Import */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Donnees CSV</p>
              <div className="flex gap-2 mb-3">
                <button onClick={() => fileRef.current?.click()}
                  className="flex-1 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-xs text-gray-500 font-semibold hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all">
                  📂 Importer un fichier CSV
                </button>
                <button onClick={() => { setRows(parseCSV(EXAMPLE_CSV)) }}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-500 hover:border-gray-300 transition-colors">
                  Exemple
                </button>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
              <textarea
                placeholder={`Collez votre CSV ici:\n${EXAMPLE_CSV.trim()}`}
                className="w-full h-28 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none"
                onBlur={e => { if (e.target.value.includes(',')) handlePaste(e.target.value) }}
              />
              <p className="text-[10px] text-gray-400 mt-1">Colonnes: name, price, sku, subtitle, barcode</p>
            </div>
          </div>

          {/* Right: preview + actions */}
          <div className="space-y-4">
            {/* Rows preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {rows.length} etiquette{rows.length !== 1 ? 's' : ''}
                </p>
                {!tierAtLeast(tier, 'starter') && rows.length > 5 && (
                  <span className="text-[10px] text-amber-600 font-semibold">Max 5 (plan gratuit)</span>
                )}
              </div>
              {rows.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Importez un CSV pour voir un apercu</p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {rows.slice(0, tierAtLeast(tier, 'starter') ? rows.length : 5).map((row, i) => (
                    <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${row.status === 'ok' ? 'bg-green-50' : row.status === 'error' ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <span className="text-[10px] w-4 text-gray-400">{i+1}</span>
                      <span className="font-semibold text-gray-700 truncate flex-1">{row.name || '—'}</span>
                      <span className="text-gray-400 truncate max-w-[80px]">{row.price}</span>
                      {row.status === 'ok' && <span className="text-green-500">✓</span>}
                      {row.status === 'error' && <span className="text-red-500" title={row.error}>✕</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress */}
            {generating && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Generation en cours…</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#FF6A00] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button onClick={generatePDF} disabled={!canGenerate}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-[#FF6A00] to-[#ee0979] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
              {generating ? 'Generation en cours...' : `📄 Generer le PDF (${Math.min(rows.length, tierAtLeast(tier, 'starter') ? rows.length : 5)} etiquettes)`}
            </button>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 space-y-1">
              <p className="font-bold">Format CSV attendu</p>
              <p>• Colonnes: <code className="bg-amber-100 px-1 rounded">name, price, sku, subtitle, barcode</code></p>
              <p>• Premiere ligne = en-tetes (ignoree)</p>
              <p>• Separateur: virgule</p>
              <p>• Encodage: UTF-8 recommande</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
