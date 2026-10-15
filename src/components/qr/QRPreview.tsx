'use client'
import { useEffect, useRef, useState } from 'react'
import { QRDesign } from '@/lib/types'
import { Download, RefreshCw } from 'lucide-react'

interface Props {
  content: string
  design: QRDesign
}

const QR_SIZE = 256
const PAD = 16
const LABEL_H = 44
const ICON_FRAMES = ['restaurant', 'shopping', 'coffee', 'wifi', 'phone', 'gift']

const FRAME_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  shopping: '🛍️',
  coffee: '☕',
  wifi: '📶',
  phone: '📱',
  gift: '🎁',
}

function getFrameDimensions(frameStyle: string | undefined) {
  if (!frameStyle || frameStyle === 'none') return { w: QR_SIZE, h: QR_SIZE, qrX: 0, qrY: 0 }
  if (frameStyle === 'banner_bottom' || frameStyle === 'scan_me' || frameStyle === 'scan_me_dark' || ICON_FRAMES.includes(frameStyle)) {
    return { w: QR_SIZE + PAD * 2, h: QR_SIZE + PAD * 2 + LABEL_H, qrX: PAD, qrY: PAD }
  }
  if (frameStyle === 'banner_top') {
    return { w: QR_SIZE + PAD * 2, h: QR_SIZE + PAD * 2 + LABEL_H, qrX: PAD, qrY: PAD + LABEL_H }
  }
  return { w: QR_SIZE + PAD * 2, h: QR_SIZE + PAD * 2, qrX: PAD, qrY: PAD }
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  frameStyle: string,
  w: number, h: number, qrX: number, qrY: number,
  frameColor: string, bgColor: string,
  label: string, qrCanvas: HTMLCanvasElement
) {
  ctx.clearRect(0, 0, w, h)

  const isIcon = ICON_FRAMES.includes(frameStyle)
  const isScanMeDark = frameStyle === 'scan_me_dark'
  const isScanMe = frameStyle === 'scan_me'
  const isRounded = frameStyle === 'rounded' || frameStyle === 'bubble'
  const isBannerTop = frameStyle === 'banner_top'

  // --- Background ---
  if (isRounded) {
    ctx.fillStyle = frameColor
    drawRoundRect(ctx, 0, 0, w, h, 24)
    ctx.fill()
  } else if (isScanMeDark) {
    ctx.fillStyle = frameColor
    ctx.fillRect(0, 0, w, h)
  } else if (isScanMe) {
    // White card with colored bottom banner
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)
    // Rounded border
    ctx.strokeStyle = frameColor
    ctx.lineWidth = 3
    drawRoundRect(ctx, 2, 2, w - 4, h - 4, 16)
    ctx.stroke()
    // Bottom banner
    ctx.fillStyle = frameColor
    drawRoundRect(ctx, 0, h - LABEL_H, w, LABEL_H, 0)
    ctx.fill()
    // round bottom corners
    ctx.beginPath()
    ctx.moveTo(0, h - LABEL_H)
    ctx.lineTo(w, h - LABEL_H)
    ctx.lineTo(w, h - 16)
    ctx.quadraticCurveTo(w, h, w - 16, h)
    ctx.lineTo(16, h)
    ctx.quadraticCurveTo(0, h, 0, h - 16)
    ctx.closePath()
    ctx.fillStyle = frameColor
    ctx.fill()
  } else if (isIcon) {
    // White card with colored bottom section
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = frameColor
    ctx.lineWidth = 3
    ctx.strokeRect(1.5, 1.5, w - 3, h - 3)
    // Colored bottom band
    ctx.fillStyle = frameColor
    ctx.fillRect(0, h - LABEL_H, w, LABEL_H)
  } else {
    // Simple / banner styles
    ctx.fillStyle = frameColor
    ctx.fillRect(0, 0, w, h)
  }

  // --- QR white inset ---
  ctx.fillStyle = bgColor
  ctx.fillRect(qrX - 4, qrY - 4, QR_SIZE + 8, QR_SIZE + 8)

  // --- Draw QR ---
  ctx.drawImage(qrCanvas, qrX, qrY, QR_SIZE, QR_SIZE)

  // --- Label / Icon ---
  const labelText = label || (isScanMe || isScanMeDark ? 'SCAN ME' : '')
  const textColor = (isScanMe || isIcon) ? '#FFFFFF' : (isScanMeDark ? '#FFFFFF' : '#FFFFFF')

  if (isBannerTop) {
    ctx.fillStyle = textColor
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(labelText || 'SCAN ME', w / 2, LABEL_H / 2 + PAD / 2)
  } else if (isIcon) {
    // Draw emoji icon + optional label
    const bannerY = h - LABEL_H
    const centerX = w / 2
    const centerY = bannerY + LABEL_H / 2

    if (label) {
      ctx.fillStyle = textColor
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, centerX, centerY)
    } else {
      // Draw emoji
      ctx.font = '22px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(FRAME_ICONS[frameStyle] || '📱', centerX, centerY)
    }
  } else {
    // Banner bottom or other
    if (labelText) {
      ctx.fillStyle = textColor
      ctx.font = 'bold 15px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const textY = QR_SIZE + PAD + LABEL_H / 2 + PAD / 2
      ctx.fillText(labelText, w / 2, textY)
    }
  }
}

export default function QRPreview({ content, design }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const qrNodeRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [qrInstance, setQrInstance] = useState<any>(null)

  const frameStyle = design.frameStyle ?? 'none'
  const frameColor = design.frameColor ?? '#041B4D'
  const frameLabel = design.frameLabel ?? ''
  const hasFrame = frameStyle !== 'none'
  const { w, h, qrX, qrY } = getFrameDimensions(frameStyle)

  const logoSizeMap: Record<string, number> = { small: 0.2, medium: 0.3, large: 0.4 }
  const logoImageSize = logoSizeMap[design.logoSize ?? 'medium']

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
        ...(design.logo ? {
          image: design.logo,
          imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: logoImageSize, hideBackgroundDots: true },
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

  // Render frame onto canvas
  useEffect(() => {
    if (!hasFrame || !canvasRef.current || !qrNodeRef.current) return

    const timer = setTimeout(() => {
      const qrCanvas = qrNodeRef.current?.querySelector('canvas')
      if (!qrCanvas) return
      const ctx = canvasRef.current!.getContext('2d')
      if (!ctx) return

      canvasRef.current!.width = w
      canvasRef.current!.height = h

      drawFrame(ctx, frameStyle, w, h, qrX, qrY, frameColor, design.bgColor, frameLabel, qrCanvas)
    }, 350)

    return () => clearTimeout(timer)
  }, [hasFrame, design, content, w, h, qrX, qrY, frameStyle, frameColor, frameLabel])

  const downloadPDF = () => {
    const src = hasFrame && canvasRef.current
      ? canvasRef.current.toDataURL('image/png')
      : qrNodeRef.current?.querySelector('canvas') instanceof HTMLCanvasElement
        ? (qrNodeRef.current.querySelector('canvas') as HTMLCanvasElement).toDataURL('image/png')
        : null
    if (!src) return
    const win = window.open('', '_blank')!
    win.document.write(`<html><head><title>QR Code Express</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;}img{max-width:400px;}</style></head><body><img src="${src}" onload="window.print();window.close()"/></body></html>`)
    win.document.close()
  }

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
      <div className="relative flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
            <RefreshCw className="animate-spin text-[#FF6A00]" size={24} />
          </div>
        )}
        {/* Hidden QR source */}
        <div ref={qrNodeRef} className={hasFrame ? 'hidden' : 'rounded-xl overflow-hidden border border-gray-100 shadow'} />
        {/* Frame canvas */}
        {hasFrame && (
          <canvas ref={canvasRef} className="rounded-xl shadow" style={{ maxWidth: 300, maxHeight: 380 }} />
        )}
      </div>

      <div className="flex gap-2 w-full justify-center">
        <button onClick={download} disabled={!content || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
          <Download size={16} />
          PNG
        </button>
        <button onClick={() => qrInstance?.download({ name: 'qrcode-express', extension: 'svg' })}
          disabled={!qrInstance || loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors">
          SVG
        </button>
        <button onClick={downloadPDF} disabled={!content || loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors">
          PDF
        </button>
      </div>
    </div>
  )
}
