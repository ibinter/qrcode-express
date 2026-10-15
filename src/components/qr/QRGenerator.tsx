'use client'
import { useState, useRef, useCallback } from 'react'
import QRTypeSelector from './QRTypeSelector'
import QRContentForm from './QRContentForm'
import QRPreview from './QRPreview'
import QRDesignPanel from './QRDesignPanel'
import QRReadinessScore from './QRReadinessScore'
import { QRType, QRDesign } from '@/lib/types'
import { buildQRContent } from '@/lib/qr-content'

const DEFAULT_DESIGN: QRDesign = {
  fgColor: '#041B4D',
  bgColor: '#FFFFFF',
  moduleStyle: 'squares',
  eyeStyle: 'square',
  errorCorrection: 'M',
}

export default function QRGenerator() {
  const [type, setType] = useState<QRType>('url')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [design, setDesign] = useState<QRDesign>(DEFAULT_DESIGN)
  const [tab, setTab] = useState<'content' | 'design'>('content')

  const content = buildQRContent(type, formData)

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold text-[#041B4D] mb-1">Créer un QR code</h2>
        <p className="text-sm text-gray-500 mb-5">Gratuit · Sans inscription · Téléchargement PNG immédiat</p>

        {/* Type selector */}
        <QRTypeSelector selected={type} onChange={setType} />

        {/* Tabs */}
        <div className="flex gap-1 mt-5 border-b border-gray-200">
          {(['content', 'design'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                tab === t
                  ? 'bg-white border border-b-white border-gray-200 text-[#FF6A00] -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'content' ? 'Contenu' : 'Design'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: form */}
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
          {tab === 'content' ? (
            <QRContentForm type={type} data={formData} onChange={setFormData} />
          ) : (
            <QRDesignPanel design={design} onChange={setDesign} />
          )}
        </div>

        {/* Right: preview */}
        <div className="p-6 flex flex-col items-center gap-4">
          <QRPreview content={content} design={design} />
          <QRReadinessScore design={design} content={content} />
        </div>
      </div>
    </div>
  )
}
