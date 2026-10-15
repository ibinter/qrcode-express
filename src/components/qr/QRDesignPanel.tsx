'use client'
import { useRef } from 'react'
import { QRDesign } from '@/lib/types'

interface Props {
  design: QRDesign
  onChange: (d: QRDesign) => void
}

const FRAMES: { id: QRDesign['frameStyle']; label: string; icon: string }[] = [
  { id: 'none',          label: 'Aucun',      icon: '🚫' },
  { id: 'simple',        label: 'Simple',     icon: '▢' },
  { id: 'rounded',       label: 'Arrondi',    icon: '◯' },
  { id: 'scan_me',       label: 'Scan Me',    icon: '📲' },
  { id: 'scan_me_dark',  label: 'Dark',       icon: '🖤' },
  { id: 'banner_bottom', label: 'Bas',        icon: '⬇️' },
  { id: 'banner_top',    label: 'Haut',       icon: '⬆️' },
  { id: 'bubble',        label: 'Bulle',      icon: '💬' },
  { id: 'restaurant',    label: 'Restaurant', icon: '🍽️' },
  { id: 'shopping',      label: 'Shopping',   icon: '🛍️' },
  { id: 'coffee',        label: 'Café',       icon: '☕' },
  { id: 'wifi',          label: 'Wi-Fi',      icon: '📶' },
  { id: 'phone',         label: 'Téléphone',  icon: '📱' },
  { id: 'gift',          label: 'Cadeau',     icon: '🎁' },
]

const LOGO_SIZES = [
  { id: 'small',  label: 'Petit',  pct: '20%' },
  { id: 'medium', label: 'Moyen',  pct: '30%' },
  { id: 'large',  label: 'Grand',  pct: '40%' },
] as const

export default function QRDesignPanel({ design, onChange }: Props) {
  const update = (patch: Partial<QRDesign>) => onChange({ ...design, ...patch })
  const fileRef = useRef<HTMLInputElement>(null)

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
            <input type="color" value={design.bgColor} onChange={(e) => update({ bgColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
            <span className="text-sm text-gray-500 font-mono">{design.bgColor}</span>
          </div>
        </div>
      </div>

      {/* Style modules */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Style des modules</label>
        <div className="flex gap-2">
          {(['squares', 'rounded', 'dots'] as const).map((s) => (
            <button key={s} onClick={() => update({ moduleStyle: s })}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                design.moduleStyle === s ? 'bg-[#041B4D] text-white border-[#041B4D]' : 'border-gray-200 text-gray-600'
              }`}>
              {s === 'squares' ? 'Carrés' : s === 'rounded' ? 'Arrondis' : 'Ronds'}
            </button>
          ))}
        </div>
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Logo au centre</label>
        {design.logo ? (
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">Cadre</label>
        <div className="grid grid-cols-4 gap-2">
          {FRAMES.map((f) => (
            <button key={f.id} onClick={() => update({ frameStyle: f.id })}
              className={`py-2.5 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                (design.frameStyle ?? 'none') === f.id
                  ? 'bg-[#041B4D] text-white border-[#041B4D] shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
              }`}>
              <div className="text-lg mb-0.5">{f.icon}</div>
              <div className="text-[10px] leading-tight">{f.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Texte et couleur du cadre */}
      {design.frameStyle && design.frameStyle !== 'none' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Texte du cadre</label>
            <input type="text" maxLength={30}
              placeholder={['restaurant','shopping','coffee','wifi','phone','gift'].includes(design.frameStyle) ? 'Laisser vide pour l\'icône seule' : 'Ex: Scannez-moi !'}
              value={design.frameLabel ?? ''}
              onChange={(e) => update({ frameLabel: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6A00]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Couleur du cadre</label>
            <div className="flex items-center gap-2">
              <input type="color" value={design.frameColor ?? '#041B4D'}
                onChange={(e) => update({ frameColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
              <span className="text-sm text-gray-500 font-mono">{design.frameColor ?? '#041B4D'}</span>
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
    </div>
  )
}
