'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlan, UpgradeBanner, PlanHeaderBanner, LockBadge, tierAtLeast, type PlanTier } from '@/components/ui/PlanGate'
import { useTranslations } from 'next-intl'

const BARCODE_TYPES = [
  // --- GRATUIT ---
  { id: 'ean13',          label: 'EAN-13',             desc: 'Produits supermarchés',      example: '5901234123457',              maxLen: 13,  fixed: true,  minPlan: 'free'      as PlanTier },
  { id: 'code128',        label: 'Code 128',           desc: 'Logistique / colis',         example: 'QRX-2025-001',               maxLen: 48,  fixed: false, minPlan: 'free'      as PlanTier },
  // --- STARTER ---
  { id: 'ean8',           label: 'EAN-8',              desc: 'Petits produits',            example: '12345670',                   maxLen: 8,   fixed: true,  minPlan: 'starter'   as PlanTier },
  { id: 'upca',           label: 'UPC-A',              desc: 'Marché américain',           example: '012345678905',               maxLen: 12,  fixed: true,  minPlan: 'starter'   as PlanTier },
  { id: 'upce',           label: 'UPC-E',              desc: 'Petit format USA',           example: '01234565',                   maxLen: 8,   fixed: true,  minPlan: 'starter'   as PlanTier },
  { id: 'code39',         label: 'Code 39',            desc: 'Industrie / inventaire',     example: 'PRODUIT-A1',                 maxLen: 39,  fixed: false, minPlan: 'starter'   as PlanTier },
  { id: 'code39ext',      label: 'Code 39 Extended',   desc: 'Caractères ASCII complets',  example: 'Hello World 123',            maxLen: 39,  fixed: false, minPlan: 'starter'   as PlanTier },
  { id: 'code93',         label: 'Code 93',            desc: 'Haute densité alphanum.',    example: 'CODE93TEST',                 maxLen: 48,  fixed: false, minPlan: 'starter'   as PlanTier },
  { id: 'codabar',        label: 'Codabar',            desc: 'Librairies / sang / FedEx',  example: 'A12345B',                    maxLen: 32,  fixed: false, minPlan: 'starter'   as PlanTier },
  { id: 'interleaved2of5',label: 'Interleaved 2 of 5', desc: 'Cartons / entrepôts',        example: '1234567890',                 maxLen: 30,  fixed: false, minPlan: 'starter'   as PlanTier },
  // --- ESSENTIEL ---
  { id: 'itf14',          label: 'ITF-14',             desc: 'Cartons / palettes GS1',     example: '12345678901231',             maxLen: 14,  fixed: true,  minPlan: 'essential' as PlanTier },
  { id: 'code93ext',      label: 'Code 93 Extended',   desc: 'ASCII étendu haute densité', example: 'Code 93 Ext!',               maxLen: 48,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'code11',         label: 'Code 11',            desc: 'Télécoms / équipements',     example: '12345678',                   maxLen: 16,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'industrial2of5', label: 'Industrial 2 of 5',  desc: 'Industrie lourde',           example: '1234567890',                 maxLen: 30,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'code32',         label: 'Code 32',            desc: 'Pharmacie italienne',        example: '12345678',                   maxLen: 8,   fixed: true,  minPlan: 'essential' as PlanTier },
  { id: 'ean128',         label: 'EAN-128 / GS1-128',  desc: 'Logistique GS1 standard',    example: '(01)12345678901231',         maxLen: 48,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'sscc18',         label: 'SSCC-18',            desc: 'Numéro série expédition',    example: '(00)123456789012345678',     maxLen: 20,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'isbn',           label: 'ISBN',               desc: 'Livres & publications',      example: '9780306406157',              maxLen: 13,  fixed: true,  minPlan: 'essential' as PlanTier },
  { id: 'msimodified',    label: 'MSI Plessey',        desc: 'Rayons grande distribution', example: '12345678',                   maxLen: 16,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'datamatrix',     label: 'Data Matrix',        desc: 'Pharma / médical / mini',    example: 'LOT-2025-XYZ',               maxLen: 48,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'gs1datamatrix',  label: 'GS1 Data Matrix',    desc: 'Pharma GS1 international',   example: '(01)12345678901231',         maxLen: 48,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'pdf417',         label: 'PDF 417',            desc: 'Tickets / documents',        example: 'TICKET-VIP-001',             maxLen: 48,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'postnet',        label: 'POSTNET',            desc: 'Codes postaux US',           example: '90210',                      maxLen: 11,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'planet',         label: 'PLANET',             desc: 'Tri postal US (PLANET)',     example: '900100000003',               maxLen: 12,  fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'qrcode',         label: 'QR Code',            desc: 'Universel',                  example: 'https://qrcode-express.com', maxLen: 200, fixed: false, minPlan: 'essential' as PlanTier },
  { id: 'azteccode',      label: 'Aztec',              desc: 'Transport / billet',         example: 'BILLET-2025',                maxLen: 48,  fixed: false, minPlan: 'essential' as PlanTier },
]

const PRESETS = [
  { key: 'preset_black',  color: '#000000', bg: '#ffffff' },
  { key: 'preset_navy',   color: '#041B4D', bg: '#ffffff' },
  { key: 'preset_orange', color: '#FF6A00', bg: '#ffffff' },
  { key: 'preset_green',  color: '#10b981', bg: '#ffffff' },
  { key: 'preset_dark',   color: '#ffffff', bg: '#1e293b' },
  { key: 'preset_gold',   color: '#b45309', bg: '#fffbeb' },
]

function buildPngUrl(type: string, text: string, color: string, bg: string, height: number, scale: number) {
  if (!text) return ''
  return `/api/barcode/image?${new URLSearchParams({ type, text, color: color.replace('#',''), bg: bg.replace('#',''), height: String(height), scale: String(scale) })}`
}
function buildSvgUrl(type: string, text: string, color: string, bg: string, height: number, scale: number) {
  if (!text) return ''
  return `/api/barcode/svg?${new URLSearchParams({ type, text, color: color.replace('#',''), bg: bg.replace('#',''), height: String(height), scale: String(scale) })}`
}

type SavedBarcode = { id: string; name: string; content: string; created_at: string }

export default function BarcodePage() {
  const { tier } = usePlan()
  const tb = useTranslations('barcode')
  const [type, setType]     = useState('ean13')
  const [text, setText]     = useState('5901234123457')
  const [color, setColor]   = useState('#000000')
  const [bg, setBg]         = useState('#ffffff')
  const [height, setHeight] = useState(15)
  const [scale, setScale]   = useState(3)
  const [imgUrl, setImgUrl] = useState('')
  const [imgError, setImgError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [name, setName]     = useState('')
  const [tab, setTab]       = useState<'generator'|'history'>('generator')
  const [history, setHistory] = useState<SavedBarcode[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const currentType = BARCODE_TYPES.find(t => t.id === type) || BARCODE_TYPES[0]
  const pngUrl = buildPngUrl(type, text, color, bg, height, scale)
  const svgUrl = buildSvgUrl(type, text, color, bg, height, scale)

  useEffect(() => {
    if (!text.trim()) { setImgUrl(''); return }
    setImgError('')
    setImgUrl(pngUrl)
  }, [pngUrl])

  useEffect(() => {
    if (tab === 'history') loadHistory()
  }, [tab])

  async function loadHistory() {
    setLoadingHistory(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('qr_codes')
        .select('id, name, content, created_at')
        .eq('user_id', user.id)
        .eq('type', 'barcode')
        .order('created_at', { ascending: false })
        .limit(50)
      setHistory(data || [])
    } finally {
      setLoadingHistory(false)
    }
  }

  function handleTypeChange(newType: string) {
    setType(newType)
    const t = BARCODE_TYPES.find(x => x.id === newType)
    if (t) setText(t.example)
    setSaved(false)
  }

  function loadFromHistory(item: SavedBarcode) {
    try {
      const c = JSON.parse(item.content)
      setType(c.bctype || 'code128')
      setText(c.text || '')
      setColor(c.color || '#000000')
      setBg(c.bg || '#ffffff')
      setHeight(c.height || 15)
      setScale(c.scale || 3)
      setName(item.name)
      setSaved(false)
      setTab('generator')
    } catch { /* ignore */ }
  }

  async function deleteFromHistory(id: string) {
    setDeleting(id)
    try {
      const supabase = createClient()
      await supabase.from('qr_codes').delete().eq('id', id)
      setHistory(h => h.filter(x => x.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  async function downloadFile(url: string, ext: string) {
    const res = await fetch(url)
    const blob = await res.blob()
    const u = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = u
    a.download = `barcode-${type}-${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(u)
  }

  async function saveToAccount() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { alert(tb('login_alert')); return }
      const label = name.trim() || `${currentType.label} — ${text}`
      await supabase.from('qr_codes').insert({
        user_id: user.id,
        type: 'barcode',
        name: label,
        content: JSON.stringify({ bctype: type, text, color, bg, height, scale }),
        mode: 'static',
        status: 'active',
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#041B4D]">{tb('page_title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{tb('page_sub')}</p>
          </div>
          <a href="/barcode/batch"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#041B4D] text-white text-xs font-bold hover:bg-[#0a2a6a] transition-colors">
            {tb('csv_btn')}
            <LockBadge requiredTier="essential" currentTier={tier} />
          </a>
        </div>

        <PlanHeaderBanner
          currentTier={tier}
          toolName="codes-barres"
          freeLimit="10 codes/mois · 2 formats (EAN-13, Code 128) · PNG uniquement"
          starterLimit="100 codes/mois · 10 formats · PNG + SVG"
          essentialLimit="illimité · 26 formats · PNG + SVG + batch CSV"
        />

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm mb-6 w-fit">
          {(['generator', 'history'] as const).map(tabKey => (
            <button key={tabKey} onClick={() => setTab(tabKey)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${tab === tabKey ? 'bg-[#FF6A00] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              {tabKey === 'generator' ? `⚡ ${tb('tab_gen')}` : `📂 ${tb('tab_history')}`}
            </button>
          ))}
        </div>

        {tab === 'generator' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left */}
            <div className="space-y-5">

              {/* Type selector */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{tb('sec_type')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {BARCODE_TYPES.map(t => {
                    const locked = !tierAtLeast(tier, t.minPlan)
                    return (
                      <button key={t.id}
                        onClick={() => !locked && handleTypeChange(t.id)}
                        title={locked ? `Disponible à partir du plan ${t.minPlan === 'starter' ? 'Starter' : 'Essentiel'}` : undefined}
                        className={`text-left p-2.5 rounded-xl border transition-all ${locked ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' : type === t.id ? 'border-[#FF6A00] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-1">
                          <p className={`text-xs font-bold ${locked ? 'text-gray-400' : type === t.id ? 'text-[#FF6A00]' : 'text-gray-700'}`}>{t.label}</p>
                          {locked && <span className="text-[9px] font-bold text-orange-500">🔒</span>}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">{tb(`type_${t.id}` as 'type_ean13')}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tb('sec_content')}</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {tb('lbl_data')} {currentType.fixed ? `(${currentType.maxLen} ${tb('lbl_data_fixed')})` : `(${tb('lbl_data_max')} ${currentType.maxLen} ${tb('lbl_data_chars')})`}
                  </label>
                  <input value={text}
                    onChange={e => { setText(e.target.value); setSaved(false) }}
                    maxLength={currentType.maxLen}
                    placeholder={currentType.example}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
                  <p className="text-[10px] text-gray-400 mt-1">ex : {currentType.example}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{tb('lbl_name')}</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder={`${currentType.label} — ${text.slice(0,12)}`}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
                </div>
              </div>

              {/* Apparence */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tb('sec_appearance')}</p>

                {/* Color presets */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">{tb('lbl_presets')}</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                      <button key={p.key} onClick={() => { setColor(p.color); setBg(p.bg) }}
                        title={tb(p.key as 'preset_black')}
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-[#FF6A00] transition-all overflow-hidden"
                        style={{ background: p.bg }}>
                        <div className="h-full w-3/5 mx-auto" style={{ background: p.color }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{tb('label_color')}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{color}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="color" value={bg} onChange={e => setBg(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{tb('label_bg')}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{bg}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{tb('label_height')} ({height}mm)</label>
                    <input type="range" min={8} max={40} value={height} onChange={e => setHeight(Number(e.target.value))}
                      className="w-full accent-[#FF6A00]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{tb('label_scale')} ×{scale} {scale >= 5 ? '(HD 300dpi)' : scale >= 4 ? '(HD)' : ''}</label>
                    <input type="range" min={1} max={8} value={scale} onChange={e => setScale(Number(e.target.value))}
                      className="w-full accent-[#FF6A00]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview + actions */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4 min-h-[280px] justify-center">
                {imgUrl && !imgError ? (
                  <>
                    <div className="p-4 rounded-xl border border-gray-100" style={{ background: bg }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt="Code-barres"
                        onError={() => setImgError('Données invalides pour ce type de code.')}
                        className="max-w-full" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <p className="text-xs text-gray-400 font-mono">{text}</p>
                  </>
                ) : imgError ? (
                  <div className="text-center space-y-2">
                    <p className="text-3xl">⚠️</p>
                    <p className="text-sm text-red-600">{imgError}</p>
                    <p className="text-xs text-gray-400">{tb('err_check')}</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-4xl">📊</p>
                    <p className="text-sm text-gray-400">{tb('empty_msg')}</p>
                  </div>
                )}
              </div>

              {imgUrl && !imgError && (
                <div className="space-y-2">
                  {/* Downloads */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => downloadFile(pngUrl, 'png')}
                      className="py-3 rounded-xl font-bold text-white text-xs bg-[#041B4D] hover:bg-[#0a2a6a] transition-colors flex items-center justify-center gap-1.5">
                      ⬇️ PNG
                      <span className="opacity-60 text-[10px]">{tb('png_screen')}</span>
                    </button>
                    {tierAtLeast(tier, 'starter') ? (
                      <button onClick={() => downloadFile(svgUrl, 'svg')}
                        className="py-3 rounded-xl font-bold text-xs border-2 border-[#041B4D] text-[#041B4D] hover:bg-[#041B4D] hover:text-white transition-colors flex items-center justify-center gap-1.5">
                        ⬇️ SVG
                        <span className="opacity-60 text-[10px]">{tb('svg_print')}</span>
                      </button>
                    ) : (
                      <a href="/tarifs"
                        className="py-3 rounded-xl font-bold text-xs border-2 border-orange-200 text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors flex items-center justify-center gap-1.5">
                        🔒 SVG
                        <span className="text-[10px]">Starter+</span>
                      </a>
                    )}
                  </div>

                  {/* HD Print button */}
                  <button onClick={() => {
                    const hdUrl = `/api/barcode/image?${new URLSearchParams({ type: currentType.id, text, color: color.replace('#',''), bg: bg.replace('#',''), height: String(height), scale: '8', includetext: 'true' })}`
                    const win = window.open('', '_blank')
                    if (win) {
                      win.document.write(`<!doctype html><html><head><title>Impression code-barres</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}img{max-width:90vw;max-height:90vh}@media print{body{margin:0}}</style></head><body><img src="${hdUrl}" onload="window.print()"/></body></html>`)
                      win.document.close()
                    }
                  }}
                    className="w-full py-3 rounded-xl font-bold text-sm border-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    {tb('btn_print')}
                  </button>

                  <button onClick={saveToAccount} disabled={saving || saved}
                    className="w-full py-3 rounded-xl font-bold text-sm border-2 border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {saved ? tb('btn_saved') : saving ? tb('btn_saving') : tb('btn_save')}
                  </button>

                  <a href="/labels"
                    className="w-full py-2.5 rounded-xl font-bold text-xs border border-gray-200 text-gray-600 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors flex items-center justify-center gap-2 block text-center">
                    {tb('btn_label')}
                  </a>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
                <p className="font-bold">{tb('info_title')}</p>
                <p><strong>PNG ×3–6</strong> : {tb('info_png')}</p>
                <p><strong>SVG vectoriel</strong> : {tb('info_svg')}</p>
                <p className="text-blue-500 mt-1">{tb('info_tip')}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 font-semibold">{tb('history_saved')}</p>
              <a href="/barcode/batch"
                className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1">
                {tb('history_csv')}
              </a>
            </div>

            {loadingHistory ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-32 animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-gray-600 font-semibold mb-1">{tb('history_empty_title')}</p>
                <p className="text-sm text-gray-400 mb-4">{tb('history_empty_sub')}</p>
                <button onClick={() => setTab('generator')}
                  className="px-5 py-2.5 bg-[#FF6A00] text-white text-sm font-bold rounded-xl hover:bg-[#e05a00] transition-colors">
                  {tb('history_create_btn')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map(item => {
                  let parsed: Record<string, string> = {}
                  try { parsed = JSON.parse(item.content) } catch { /* ignore */ }
                  const previewUrl = parsed.bctype ? buildPngUrl(parsed.bctype, parsed.text, parsed.color || '#000000', parsed.bg || '#ffffff', 10, 2) : ''
                  const typeMeta = BARCODE_TYPES.find(t => t.id === parsed.bctype)
                  return (
                    <div key={item.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:border-[#FF6A00]/30 transition-all">
                      <div className="w-20 h-14 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden shrink-0">
                        {previewUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={previewUrl} alt="preview" className="max-h-12 max-w-full" style={{ imageRendering: 'pixelated' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">{parsed.text}</p>
                        <p className="text-[10px] text-[#FF6A00] font-bold mt-0.5">{typeMeta?.label || parsed.bctype}</p>
                        <p className="text-[9px] text-gray-300">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => loadFromHistory(item)}
                          className="px-3 py-1.5 bg-[#FF6A00] text-white text-[10px] font-bold rounded-lg hover:bg-[#e05a00] transition-colors">
                          {tb('btn_edit')}
                        </button>
                        <button onClick={() => deleteFromHistory(item.id)} disabled={deleting === item.id}
                          className="px-3 py-1.5 border border-red-200 text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                          {deleting === item.id ? '…' : tb('btn_delete')}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
