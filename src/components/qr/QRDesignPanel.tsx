'use client'
import { QRDesign } from '@/lib/types'

interface Props {
  design: QRDesign
  onChange: (d: QRDesign) => void
}

export default function QRDesignPanel({ design, onChange }: Props) {
  const update = (patch: Partial<QRDesign>) => onChange({ ...design, ...patch })

  return (
    <div className="space-y-5">
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

      {/* Correction d'erreur */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Correction d&apos;erreur
          <span className="font-normal text-gray-400 ml-1">(H = nécessaire avec un logo)</span>
        </label>
        <select value={design.errorCorrection} onChange={(e) => update({ errorCorrection: e.target.value as QRDesign['errorCorrection'] })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="L">L — Faible (densité max)</option>
          <option value="M">M — Moyen (équilibré)</option>
          <option value="Q">Q — Bon</option>
          <option value="H">H — Maximum (avec logo)</option>
        </select>
      </div>

      {/* Cadres */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Cadre</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'none',          label: 'Aucun',        icon: '⬜' },
            { id: 'simple',        label: 'Simple',       icon: '▢' },
            { id: 'rounded',       label: 'Arrondi',      icon: '◯' },
            { id: 'banner_bottom', label: 'Bandeau bas',  icon: '⬇' },
            { id: 'banner_top',    label: 'Bandeau haut', icon: '⬆' },
            { id: 'bubble',        label: 'Bulle',        icon: '💬' },
          ] as const).map((f) => (
            <button key={f.id} onClick={() => update({ frameStyle: f.id })}
              className={`py-2 px-1 rounded-lg text-xs font-medium border transition-colors text-center ${
                (design.frameStyle ?? 'none') === f.id
                  ? 'bg-[#041B4D] text-white border-[#041B4D]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}>
              <div className="text-base mb-0.5">{f.icon}</div>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Texte et couleur du cadre */}
      {design.frameStyle && design.frameStyle !== 'none' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Texte du cadre</label>
            <input
              type="text"
              maxLength={30}
              placeholder="Ex: Scannez-moi !"
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

      <p className="text-xs text-gray-400 bg-orange-50 rounded-lg p-3">
        🎨 Logo et styles avancés disponibles à partir de 500 FCFA.
      </p>
    </div>
  )
}
