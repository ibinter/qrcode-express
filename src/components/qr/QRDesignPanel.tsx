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

      <p className="text-xs text-gray-400 bg-orange-50 rounded-lg p-3">
        🎨 Logo, cadre personnalisé et styles avancés sont disponibles à partir de 500 FCFA.
      </p>
    </div>
  )
}
