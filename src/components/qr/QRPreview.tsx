'use client'
import { useEffect, useRef, useState } from 'react'
import { QRDesign } from '@/lib/types'
import { Download, RefreshCw } from 'lucide-react'

interface Props {
  content: string
  design: QRDesign
}

export default function QRPreview({ content, design }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [qrInstance, setQrInstance] = useState<any>(null)

  useEffect(() => {
    if (!content) return
    setLoading(true)

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      const qr = new QRCodeStyling({
        width: 280,
        height: 280,
        type: 'canvas',
        data: content,
        dotsOptions: {
          color: design.fgColor,
          type: design.moduleStyle === 'dots' ? 'dots' : design.moduleStyle === 'rounded' ? 'rounded' : 'square',
        },
        cornersSquareOptions: {
          type: design.eyeStyle === 'rounded' ? 'extra-rounded' : 'square',
          color: design.fgColor,
        },
        backgroundOptions: { color: design.bgColor },
        qrOptions: { errorCorrectionLevel: design.errorCorrection },
        ...(design.logoUrl ? {
          image: design.logoUrl,
          imageOptions: { crossOrigin: 'anonymous', margin: 4 },
        } : {}),
      })
      if (canvasRef.current) {
        canvasRef.current.innerHTML = ''
        qr.append(canvasRef.current)
      }
      setQrInstance(qr)
      setLoading(false)
    })
  }, [content, design])

  const download = () => {
    if (!qrInstance) return
    qrInstance.download({ name: 'qrcode-express', extension: 'png' })
  }

  if (!content) {
    return (
      <div className="w-[280px] h-[280px] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm text-center px-6">
        Remplissez le contenu pour voir votre QR code
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
            <RefreshCw className="animate-spin text-[#FF6A00]" size={24} />
          </div>
        )}
        <div
          ref={canvasRef}
          className="rounded-xl overflow-hidden border border-gray-100 shadow"
          style={{ background: design.bgColor }}
        />
      </div>

      <button
        onClick={download}
        disabled={!content || loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
      >
        <Download size={16} />
        Télécharger PNG (gratuit)
      </button>

      <p className="text-xs text-gray-400 text-center">
        PNG HD, SVG, PDF et logo disponibles dès 500 FCFA
      </p>
    </div>
  )
}
