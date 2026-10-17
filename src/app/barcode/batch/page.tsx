'use client'
import { useState, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const BARCODE_TYPES = [
  { id: 'ean13',      label: 'EAN-13'      },
  { id: 'ean8',       label: 'EAN-8'       },
  { id: 'upca',       label: 'UPC-A'       },
  { id: 'code128',    label: 'Code 128'    },
  { id: 'code39',     label: 'Code 39'     },
  { id: 'itf14',      label: 'ITF-14'      },
  { id: 'datamatrix', label: 'Data Matrix' },
  { id: 'pdf417',     label: 'PDF 417'     },
  { id: 'qrcode',     label: 'QR Code'     },
]

interface Row { text: string; name?: string; status: 'pending'|'ok'|'error'; error?: string }

const EXAMPLE_CSV = `text,name
5901234123457,Produit A
5901234123464,Produit B
QRX-2025-001,Colis Express
`

export default function BarcodeBatchPage() {
  const [barcodeType, setBarcodeType] = useState('code128')
  const [color, setColor] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [height, setHeight] = useState(15)
  const [scale, setScale] = useState(3)
  const [rows, setRows] = useState<Row[]>([])
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function parseCSV(text: string): Row[] {
    const lines = text.trim().split(/\r?\n/)
    const header = lines[0].toLowerCase().split(',').map(s => s.trim())
    const textIdx = header.indexOf('text')
    const nameIdx = header.indexOf('name')
    if (textIdx === -1) return []
    return lines.slice(1).filter(l => l.trim()).map(line => {
      const cols = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      return {
        text: cols[textIdx] || '',
        name: nameIdx >= 0 ? cols[nameIdx] : undefined,
        status: 'pending' as const,
      }
    }).filter(r => r.text)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      setRows(parseCSV(text))
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData('text')
    setRows(parseCSV(text))
  }

  async function generateAll() {
    if (!rows.length) return
    setGenerating(true)
    setProgress(0)

    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        const url = `/api/barcode/image?${new URLSearchParams({
          type: barcodeType, text: row.text,
          color: color.replace('#',''), bg: bg.replace('#',''),
          height: String(height), scale: String(scale),
        })}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(await res.text())
        const blob = await res.blob()
        const filename = (row.name || row.text).replace(/[^a-z0-9-_]/gi, '_').slice(0, 40)
        zip.file(`${String(i+1).padStart(3,'0')}_${filename}.png`, blob)
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'ok' } : r))
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erreur'
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', error: msg } : r))
      }
      setProgress(Math.round(((i+1)/rows.length)*100))
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `codes-barres-${Date.now()}.zip`
    a.click()
    URL.revokeObjectURL(url)
    setGenerating(false)
  }

  const okCount = rows.filter(r => r.status === 'ok').length
  const errCount = rows.filter(r => r.status === 'error').length

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <a href="/barcode" className="text-gray-400 hover:text-gray-700 text-sm">← Générateur</a>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-extrabold text-[#041B4D]">📋 Import CSV — Génération en masse</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: config */}
          <div className="space-y-5">

            {/* CSV upload */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fichier CSV</p>
              <div>
                <p className="text-xs text-gray-500 mb-2">Format attendu : colonnes <code className="bg-gray-100 px-1 rounded text-[11px]">text</code> (requis) et <code className="bg-gray-100 px-1 rounded text-[11px]">name</code> (optionnel)</p>
                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FF6A00] file:text-white hover:file:bg-[#e05a00] cursor-pointer" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ou collez votre CSV directement :</p>
                <textarea rows={4} placeholder={EXAMPLE_CSV}
                  onPaste={handlePaste}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
              </div>
              <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(EXAMPLE_CSV)}`} download="exemple.csv"
                className="text-[11px] text-[#FF6A00] hover:underline font-semibold">
                ⬇️ Télécharger modèle CSV
              </a>
            </div>

            {/* Options */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Options</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type de code-barres</label>
                <select value={barcodeType} onChange={e => setBarcodeType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40">
                  {BARCODE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700">Barres</p>
                    <p className="text-[9px] text-gray-400 font-mono">{color}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={bg} onChange={e => setBg(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700">Fond</p>
                    <p className="text-[9px] text-gray-400 font-mono">{bg}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Hauteur ({height}mm)</label>
                  <input type="range" min={8} max={40} value={height} onChange={e => setHeight(Number(e.target.value))}
                    className="w-full accent-[#FF6A00]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Résolution ×{scale}</label>
                  <input type="range" min={1} max={6} value={scale} onChange={e => setScale(Number(e.target.value))}
                    className="w-full accent-[#FF6A00]" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: preview list + generate */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {rows.length} code{rows.length > 1 ? 's' : ''} détecté{rows.length > 1 ? 's' : ''}
                </p>
                {rows.length > 0 && !generating && (
                  <button onClick={() => setRows([])} className="text-[10px] text-red-400 hover:text-red-600 font-semibold">
                    Vider
                  </button>
                )}
              </div>

              {rows.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Importez un fichier CSV pour voir la liste</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {rows.map((row, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      row.status === 'ok' ? 'bg-green-50' : row.status === 'error' ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <span className="shrink-0 text-sm">
                        {row.status === 'ok' ? '✅' : row.status === 'error' ? '❌' : '⏳'}
                      </span>
                      <span className="font-mono text-gray-700 truncate">{row.text}</span>
                      {row.name && <span className="text-gray-400 shrink-0">— {row.name}</span>}
                      {row.error && <span className="text-red-500 truncate">{row.error}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress */}
            {generating && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Génération en cours…</span>
                  <span className="font-bold text-[#FF6A00]">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FF6A00] to-[#ee0979] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] text-gray-400">{okCount} réussis · {errCount} erreurs</p>
              </div>
            )}

            <button onClick={generateAll} disabled={rows.length === 0 || generating}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-[#FF6A00] to-[#ee0979] hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-md">
              {generating ? `⏳ Génération… ${progress}%` : `⬇️ Générer ${rows.length} codes-barres (ZIP)`}
            </button>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 space-y-1">
              <p className="font-bold">📦 Résultat</p>
              <p>Un fichier ZIP sera téléchargé automatiquement avec tous vos codes-barres en PNG, numérotés et nommés.</p>
              <p className="text-amber-600">Limite recommandée : 500 codes par batch pour des performances optimales.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
