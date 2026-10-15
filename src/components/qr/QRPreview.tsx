'use client'
import { useEffect, useRef, useState } from 'react'
import { QRDesign } from '@/lib/types'
import { Download, RefreshCw } from 'lucide-react'

interface Props {
  content: string
  design: QRDesign
}

const QR_SIZE = 256
const FRAME_PADDING = 16
const LABEL_HEIGHT = 40

function getFrameDimensions(frameStyle: string | undefined) {
  if (!frameStyle || frameStyle === 'none') return { w: QR_SIZE, h: QR_SIZE, qrX: 0, qrY: 0 }
  if (frameStyle === 'banner_bottom') return { w: QR_SIZE + FRAME_PADDING * 2, h: QR_SIZE + FRAME_PADDING * 2 + LABEL_HEIGHT, qrX: FRAME_PADDING, qrY: FRAME_PADDING }
  if (frameStyle === 'banner_top') return { w: QR_SIZE + FRAME_PADDING * 2, h: QR_SIZE + FRAME_PADDING * 2 + LABEL_HEIGHT, qrX: FRAME_PADDING, qrY: FRAME_PADDING + LABEL_HEIGHT }
  return { w: QR_SIZE + FRAME_PADDING * 2, h: QR_SIZE + FRAME_PADDING * 2, qrX: FRAME_PADDING, qrY: FRAME_PADDING }
}

export default function QRPreview({ content, design }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const qrNodeRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [qrInstance, setQrInstance] = useState<any>(null)

  const frameStyle = design.frameStyle ?? 'none'
  const frameColor = design.frameColor ?? '#041B4D'
  const frameLabel = design.frameLabel ?? 'SCANNEZ-MOI'
  const hasFrame = frameStyle !== 'none'
  const { w, h, qrX, qrY } = getFrameDimensions(frameStyle)

  useEffect(() => {
    if (!content) return
    setLoading(true)

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      const qr = new QRCodeStyling({
        width: QR_SIZE,
        height: QR_SIZE,
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

      if (qrNodeRef.current) {
        qrNodeRef.current.innerHTML = ''
        qr.append(qrNodeRef.current)
      }
      setQrInstance(qr)
      setLoading(false)
    })
  }, [content, design])

  // Render frame onto canvas after QR is ready
  useEffect(() => {
    if (!hasFrame || !canvasRef.current || !qrNodeRef.current) return

    const timer = setTimeout(() => {
      const qrCanvas = qrNodeRef.current?.querySelector('canvas')
      if (!qrCanvas) return

      const ctx = canvasRef.current!.getContext('2d')
      if (!ctx) return

      canvasRef.current!.width = w
      canvasRef.current!.height = h

      // Background
      ctx.fillStyle = frameColor
      if (frameStyle === 'rounded' || frameStyle === 'bubble') {
        const r = 20
        ctx.beginPath()
        ctx.moveTo(r, 0)
        ctx.lineTo(w - r, 0)
        ctx.quadraticCurveTo(w, 0, w, r)
        ctx.lineTo(w, h - r)
        ctx.quadraticCurveTo(w, h, w - r, h)
        ctx.lineTo(r, h)
        ctx.quadraticCurveTo(0, h, 0, h - r)
        ctx.lineTo(0, r)
        ctx.quadraticCurveTo(0, 0, r, 0)
        ctx.closePath()
        ctx.fill()
      } else {
        ctx.fillRect(0, 0, w, h)
      }

      // QR white background inset
      ctx.fillStyle = design.bgColor
      ctx.fillRect(qrX - 4, qrY - 4, QR_SIZE + 8, QR_SIZE + 8)

      // Draw QR
      ctx.drawImage(qrCanvas, qrX, qrY, QR_SIZE, QR_SIZE)

      // Label text
      if (frameLabel) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        if (frameStyle === 'banner_bottom') {
          ctx.fillText(frameLabel, w / 2, QR_SIZE + FRAME_PADDING + LABEL_HEIGHT / 2 + FRAME_PADDING / 2)
        } else if (frameStyle === 'banner_top') {
          ctx.fillText(frameLabel, w / 2, LABEL_HEIGHT / 2 + FRAME_PADDING / 2)
        } else {
          ctx.fillText(frameLabel, w / 2, h - FRAME_PADDING / 2 - 6)
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [hasFrame, design, content, w, h, qrX, qrY, frameStyle, frameColor, frameLabel])

  const download = async () => {
    if (hasFrame && canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'qrcode-express.png'
      a.click()
    } else if (qrInstance) {
      qrInstance.download({ name: 'qrcode-express', extension: 'png' })
    }
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
      <div className="relative flex items-center justify-center" ref={containerRef}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
            <RefreshCw className="animate-spin text-[#FF6A00]" size={24} />
          </div>
        )}
        {/* Hidden QR node used as source */}
        <div ref={qrNodeRef} className={hasFrame ? 'hidden' : 'rounded-xl overflow-hidden border border-gray-100 shadow'} />
        {/* Frame canvas (visible when frame active) */}
        {hasFrame && (
          <canvas
            ref={canvasRef}
            className="rounded-xl shadow"
            style={{ maxWidth: 288, maxHeight: 360 }}
          />
        )}
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
