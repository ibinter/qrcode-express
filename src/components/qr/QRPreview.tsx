'use client'
import { useEffect, useRef, useState } from 'react'
import { QRDesign } from '@/lib/types'
import { Download, RefreshCw, Printer } from 'lucide-react'

interface Props {
  content: string
  design: QRDesign
  aiImageUrl?: string
}

const QR_SIZE = 256
const PAD = 16
const LABEL_H = 48

const ICON_FRAMES = ['restaurant','shopping','coffee','wifi','phone','gift','scooter','chef','beer','drink','clipboard','youtube','instagram','whatsapp','delivery','mobile_frame']

const FRAME_EMOJI: Record<string, string> = {
  restaurant: '🍽️', shopping: '🛍️', coffee: '☕', wifi: '📶',
  phone: '📱', gift: '🎁', scooter: '🛵', chef: '👨‍🍳',
  beer: '🍺', drink: '🥤', delivery: '🚚',
}

function getFrameDimensions(fs: string | undefined) {
  if (!fs || fs === 'none') return { w: QR_SIZE, h: QR_SIZE, qrX: 0, qrY: 0 }
  if (fs === 'mobile_frame') return { w: QR_SIZE + PAD * 4, h: QR_SIZE + PAD * 6, qrX: PAD * 2, qrY: PAD * 3 }
  if (fs === 'envelope') return { w: QR_SIZE + PAD * 2, h: QR_SIZE + PAD * 2 + LABEL_H, qrX: PAD, qrY: PAD + LABEL_H / 2 }
  if (fs === 'tag') return { w: QR_SIZE + PAD * 2, h: QR_SIZE + PAD * 2 + LABEL_H, qrX: PAD, qrY: PAD + LABEL_H / 2 }
  if (fs === 'ticket') return { w: QR_SIZE + PAD * 2 + 20, h: QR_SIZE + PAD * 2 + LABEL_H, qrX: PAD + 10, qrY: PAD }
  if (fs === 'banner_top' || fs === 'speech') return { w: QR_SIZE + PAD * 2, h: QR_SIZE + PAD * 2 + LABEL_H, qrX: PAD, qrY: PAD + LABEL_H }
  if (fs === 'arrow') return { w: QR_SIZE + PAD * 2, h: QR_SIZE + PAD * 2 + LABEL_H + 20, qrX: PAD, qrY: PAD }
  if (ICON_FRAMES.includes(fs) || ['banner_bottom','scan_me','scan_me_dark','wave','zigzag','ribbon'].includes(fs)) {
    return { w: QR_SIZE + PAD * 2, h: QR_SIZE + PAD * 2 + LABEL_H, qrX: PAD, qrY: PAD }
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

function drawQRInset(ctx: CanvasRenderingContext2D, qrCanvas: HTMLCanvasElement, qrX: number, qrY: number, bgColor: string) {
  ctx.fillStyle = bgColor
  ctx.fillRect(qrX - 4, qrY - 4, QR_SIZE + 8, QR_SIZE + 8)
  ctx.drawImage(qrCanvas, qrX, qrY, QR_SIZE, QR_SIZE)
}

function labelAt(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size = 15) {
  ctx.fillStyle = color
  ctx.font = `bold ${size}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

function emojiAt(ctx: CanvasRenderingContext2D, emoji: string, x: number, y: number, size = 26) {
  ctx.font = `${size}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, x, y)
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  fs: string, w: number, h: number, qrX: number, qrY: number,
  color: string, bgColor: string, label: string, qrCanvas: HTMLCanvasElement
) {
  ctx.clearRect(0, 0, w, h)
  const cx = w / 2
  const bannerY = qrY + QR_SIZE + PAD / 2
  const bannerMid = bannerY + LABEL_H / 2
  const lbl = label || 'SCAN ME'

  switch (fs) {
    // ─── Border only ───────────────────────────────────────────────
    case 'simple': {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = color
      ctx.lineWidth = 4
      ctx.strokeRect(2, 2, w - 4, h - 4)
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      break
    }
    case 'bold': {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = color
      ctx.lineWidth = 10
      ctx.strokeRect(5, 5, w - 10, h - 10)
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      break
    }
    case 'dotted': {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.setLineDash([6, 4])
      ctx.strokeRect(4, 4, w - 8, h - 8)
      ctx.setLineDash([])
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      break
    }
    case 'rounded': {
      ctx.fillStyle = color
      drawRoundRect(ctx, 0, 0, w, h, 24)
      ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      break
    }
    case 'bubble': {
      ctx.fillStyle = color
      drawRoundRect(ctx, 0, 0, w, h, h / 2)
      ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      break
    }

    // ─── Scan Me ───────────────────────────────────────────────────
    case 'scan_me': {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = color; ctx.lineWidth = 3
      drawRoundRect(ctx, 2, 2, w - 4, h - 4, 14); ctx.stroke()
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(0, bannerY)
      ctx.lineTo(w, bannerY)
      ctx.lineTo(w, h - 14); ctx.quadraticCurveTo(w, h, w - 14, h)
      ctx.lineTo(14, h); ctx.quadraticCurveTo(0, h, 0, h - 14)
      ctx.closePath(); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, bannerMid, '#ffffff')
      break
    }
    case 'scan_me_dark': {
      ctx.fillStyle = color; ctx.fillRect(0, 0, w, h)
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, bannerMid, '#ffffff')
      break
    }

    // ─── Banners ───────────────────────────────────────────────────
    case 'banner_bottom': {
      ctx.fillStyle = color; ctx.fillRect(0, 0, w, h)
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, bannerMid, '#ffffff')
      break
    }
    case 'banner_top': {
      ctx.fillStyle = color; ctx.fillRect(0, 0, w, h)
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, PAD + LABEL_H / 2, '#ffffff')
      break
    }

    // ─── Wave ──────────────────────────────────────────────────────
    case 'wave': {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = color; ctx.lineWidth = 3
      drawRoundRect(ctx, 2, 2, w - 4, h - 4, 12); ctx.stroke()
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(0, bannerY - 10)
      const ww = w / 3
      ctx.quadraticCurveTo(ww * 0.5, bannerY - 24, ww, bannerY - 10)
      ctx.quadraticCurveTo(ww * 1.5, bannerY + 4, ww * 2, bannerY - 10)
      ctx.quadraticCurveTo(ww * 2.5, bannerY - 24, w, bannerY - 10)
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, bannerMid + 4, '#ffffff')
      break
    }

    // ─── Zigzag ────────────────────────────────────────────────────
    case 'zigzag': {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = color; ctx.lineWidth = 3
      drawRoundRect(ctx, 2, 2, w - 4, h - 4, 12); ctx.stroke()
      const teeth = 10
      const tw = w / teeth
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, bannerY)
      for (let i = 0; i < teeth; i++) {
        ctx.lineTo(tw * i + tw / 2, bannerY - 12)
        ctx.lineTo(tw * (i + 1), bannerY)
      }
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, bannerMid + 4, '#ffffff')
      break
    }

    // ─── Arrow ─────────────────────────────────────────────────────
    case 'arrow': {
      ctx.fillStyle = color; ctx.fillRect(0, 0, w, qrY + QR_SIZE + PAD)
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, PAD / 2 + 8, '#ffffff', 13)
      // Arrow pointing down
      const arrowY = qrY + QR_SIZE + PAD
      ctx.fillStyle = color; ctx.beginPath()
      ctx.moveTo(cx - 20, arrowY); ctx.lineTo(cx + 20, arrowY); ctx.lineTo(cx, arrowY + 20); ctx.closePath(); ctx.fill()
      break
    }

    // ─── Speech bubble ─────────────────────────────────────────────
    case 'speech': {
      ctx.fillStyle = color; ctx.fillRect(0, LABEL_H, w, h - LABEL_H)
      // Bubble tail top-left
      ctx.beginPath(); ctx.moveTo(20, LABEL_H); ctx.lineTo(8, 4); ctx.lineTo(40, LABEL_H); ctx.closePath(); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, LABEL_H / 2 + 6, '#ffffff', 12)
      break
    }

    // ─── Ribbon ────────────────────────────────────────────────────
    case 'ribbon': {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = color; ctx.lineWidth = 3
      drawRoundRect(ctx, 2, 2, w - 4, qrY + QR_SIZE + PAD - 2, 10); ctx.stroke()
      // Ribbon bottom
      ctx.fillStyle = color
      const ry = qrY + QR_SIZE + PAD
      ctx.beginPath()
      ctx.moveTo(PAD, ry); ctx.lineTo(w - PAD, ry)
      ctx.lineTo(w, ry + LABEL_H / 2); ctx.lineTo(w - PAD, ry + LABEL_H)
      ctx.lineTo(PAD, ry + LABEL_H); ctx.lineTo(0, ry + LABEL_H / 2); ctx.closePath(); ctx.fill()
      // V cut in ribbon
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.moveTo(0, ry + LABEL_H / 2 - 8); ctx.lineTo(12, ry + LABEL_H / 2); ctx.lineTo(0, ry + LABEL_H / 2 + 8); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(w, ry + LABEL_H / 2 - 8); ctx.lineTo(w - 12, ry + LABEL_H / 2); ctx.lineTo(w, ry + LABEL_H / 2 + 8); ctx.closePath(); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, ry + LABEL_H / 2, '#ffffff', 13)
      break
    }

    // ─── Tag ───────────────────────────────────────────────────────
    case 'tag': {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(PAD, 0); ctx.lineTo(w - PAD, 0)
      ctx.lineTo(w, PAD); ctx.lineTo(w, h - PAD * 2)
      ctx.lineTo(cx, h); ctx.lineTo(0, h - PAD * 2)
      ctx.lineTo(0, PAD); ctx.closePath(); ctx.fill()
      // Hole at top
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.arc(cx, PAD * 1.5, 6, 0, Math.PI * 2); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      break
    }

    // ─── Ticket ────────────────────────────────────────────────────
    case 'ticket': {
      ctx.fillStyle = color
      drawRoundRect(ctx, 0, 0, w, h, 10); ctx.fill()
      // Notches
      const notchR = 12
      ;[[0, h * 0.4], [0, h * 0.65], [w, h * 0.4], [w, h * 0.65]].forEach(([nx, ny]) => {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(nx, ny, notchR, 0, Math.PI * 2); ctx.fill()
      })
      // Dashed divider
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.setLineDash([6, 4])
      ctx.beginPath(); ctx.moveTo(notchR * 2, bannerY); ctx.lineTo(w - notchR * 2, bannerY); ctx.stroke(); ctx.setLineDash([])
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, label || '🎟️ TICKET', cx, bannerMid + 4, '#ffffff', 13)
      break
    }

    // ─── Envelope ──────────────────────────────────────────────────
    case 'envelope': {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = color; ctx.lineWidth = 3
      drawRoundRect(ctx, 2, 2, w - 4, h - 4, 10); ctx.stroke()
      // Envelope flap top
      ctx.fillStyle = color
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cx, qrY - 2); ctx.lineTo(w, 0); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#f3f4f6'
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cx, qrY - 8); ctx.lineTo(w, 0); ctx.closePath(); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, bannerMid, color, 13)
      break
    }

    // ─── Clipboard ─────────────────────────────────────────────────
    case 'clipboard': {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = color; ctx.lineWidth = 3
      drawRoundRect(ctx, 2, 2, w - 4, h - 4, 8); ctx.stroke()
      // Clip at top center
      ctx.fillStyle = color
      const clipW = w * 0.4; const clipH = PAD * 1.5
      drawRoundRect(ctx, cx - clipW / 2, -4, clipW, clipH, clipH / 2); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      labelAt(ctx, lbl, cx, bannerMid, color, 13)
      break
    }

    // ─── Mobile frame ──────────────────────────────────────────────
    case 'mobile_frame': {
      const mw = w, mh = h
      ctx.fillStyle = color
      drawRoundRect(ctx, 0, 0, mw, mh, 28); ctx.fill()
      ctx.fillStyle = '#ffffff'
      drawRoundRect(ctx, 8, 14, mw - 16, mh - 28, 18); ctx.fill()
      // Speaker notch
      ctx.fillStyle = color
      drawRoundRect(ctx, cx - 24, 6, 48, 6, 3); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 28, 9, 4, 0, Math.PI * 2); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      // Home indicator
      ctx.fillStyle = color
      drawRoundRect(ctx, cx - 20, mh - 12, 40, 4, 2); ctx.fill()
      break
    }

    // ─── YouTube ───────────────────────────────────────────────────
    case 'youtube': {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#FF0000'; ctx.lineWidth = 3
      drawRoundRect(ctx, 2, 2, w - 4, h - 4, 12); ctx.stroke()
      ctx.fillStyle = '#FF0000'
      drawRoundRect(ctx, 0, bannerY, w, LABEL_H + 4, 0); ctx.fill()
      ctx.fillStyle = '#FF0000'
      ctx.beginPath()
      ctx.moveTo(0, bannerY); ctx.lineTo(w, bannerY)
      ctx.lineTo(w, h - 12); ctx.quadraticCurveTo(w, h, w - 12, h)
      ctx.lineTo(12, h); ctx.quadraticCurveTo(0, h, 0, h - 12)
      ctx.closePath(); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      // Play button
      ctx.fillStyle = '#ffffff'
      const py = bannerMid; const px = cx - 20
      ctx.beginPath(); ctx.moveTo(px, py - 10); ctx.lineTo(px, py + 10); ctx.lineTo(px + 18, py); ctx.closePath(); ctx.fill()
      labelAt(ctx, label || 'YouTube', cx + 6, bannerMid, '#ffffff', 13)
      break
    }

    // ─── WhatsApp ──────────────────────────────────────────────────
    case 'whatsapp': {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#25d366'; ctx.lineWidth = 3
      drawRoundRect(ctx, 2, 2, w - 4, h - 4, 12); ctx.stroke()
      ctx.fillStyle = '#25d366'
      ctx.beginPath()
      ctx.moveTo(0, bannerY); ctx.lineTo(w, bannerY)
      ctx.lineTo(w, h - 12); ctx.quadraticCurveTo(w, h, w - 12, h)
      ctx.lineTo(12, h); ctx.quadraticCurveTo(0, h, 0, h - 12)
      ctx.closePath(); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      emojiAt(ctx, '💬', cx - 24, bannerMid, 22)
      labelAt(ctx, label || 'WhatsApp', cx + 12, bannerMid, '#ffffff', 12)
      break
    }

    // ─── Instagram ─────────────────────────────────────────────────
    case 'instagram': {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#e1306c'; ctx.lineWidth = 3
      drawRoundRect(ctx, 2, 2, w - 4, h - 4, 12); ctx.stroke()
      const igGrad = ctx.createLinearGradient(0, bannerY, w, h)
      igGrad.addColorStop(0, '#833ab4'); igGrad.addColorStop(0.5, '#fd1d1d'); igGrad.addColorStop(1, '#fcb045')
      ctx.fillStyle = igGrad
      ctx.beginPath()
      ctx.moveTo(0, bannerY); ctx.lineTo(w, bannerY)
      ctx.lineTo(w, h - 12); ctx.quadraticCurveTo(w, h, w - 12, h)
      ctx.lineTo(12, h); ctx.quadraticCurveTo(0, h, 0, h - 12)
      ctx.closePath(); ctx.fill()
      drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      emojiAt(ctx, '📸', cx - 24, bannerMid, 20)
      labelAt(ctx, label || 'Instagram', cx + 10, bannerMid, '#ffffff', 12)
      break
    }

    // ─── Icon frames ───────────────────────────────────────────────
    default: {
      if (ICON_FRAMES.includes(fs)) {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = color; ctx.lineWidth = 3
        ctx.strokeRect(1.5, 1.5, w - 3, h - 3)
        ctx.fillStyle = color; ctx.fillRect(0, bannerY, w, LABEL_H + 2)
        drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
        if (label) {
          labelAt(ctx, label, cx, bannerMid, '#ffffff', 13)
        } else if (FRAME_EMOJI[fs]) {
          emojiAt(ctx, FRAME_EMOJI[fs], cx, bannerMid, 26)
        }
      } else {
        // Fallback: simple border
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(2, 2, w - 4, h - 4)
        drawQRInset(ctx, qrCanvas, qrX, qrY, bgColor)
      }
      break
    }
  }
}

export default function QRPreview({ content, design, aiImageUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const qrNodeRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [qrInstance, setQrInstance] = useState<any>(null)
  const [printSize, setPrintSize] = useState<512 | 1024 | 2048 | 4096>(1024)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

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
      const eyeMap = { square: 'square', rounded: 'extra-rounded', circle: 'dot', leaf: 'extra-rounded', classy: 'square' } as const
      const eyeDotMap = { square: 'square', rounded: 'square', circle: 'dot', leaf: 'dot', classy: 'dot' } as const
      const eyeType = eyeMap[design.eyeStyle ?? 'square']
      const eyeDotType = eyeDotMap[design.eyeStyle ?? 'square']
      const bgColor = design.bgTransparent ? 'transparent' : design.bgColor
      const dotsGradient = design.fgGradient ? {
        gradient: {
          type: design.gradientType ?? 'linear' as const,
          rotation: 0,
          colorStops: [
            { offset: 0, color: design.fgColor },
            { offset: 1, color: design.fgGradient },
          ],
        },
      } : { color: design.fgColor }
      const qr = new QRCodeStyling({
        width: QR_SIZE,
        height: QR_SIZE,
        type: 'canvas',
        data: content,
        dotsOptions: {
          ...dotsGradient,
          type: design.moduleStyle === 'dots' ? 'dots' : design.moduleStyle === 'rounded' ? 'rounded' : 'square',
        },
        cornersSquareOptions: {
          type: eyeType,
          color: design.fgColor,
        },
        cornersDotOptions: {
          type: eyeDotType,
          color: design.fgColor,
        },
        backgroundOptions: { color: bgColor },
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

  const downloadAI = () => {
    if (!aiImageUrl) return
    const a = document.createElement('a')
    a.href = aiImageUrl
    a.download = 'qrcode-artistique-ia.png'
    a.target = '_blank'
    a.click()
  }

  const downloadHires = async () => {
    setExporting(true)
    const scale = printSize / QR_SIZE

    if (hasFrame && canvasRef.current) {
      // Redraw frame at larger scale into an offscreen canvas
      const qrCanvas = qrNodeRef.current?.querySelector('canvas')
      if (!qrCanvas) return
      const offscreen = document.createElement('canvas')
      offscreen.width = Math.round(w * scale)
      offscreen.height = Math.round(h * scale)
      const ctx = offscreen.getContext('2d')!
      ctx.scale(scale, scale)
      drawFrame(ctx, frameStyle, w, h, qrX, qrY, frameColor, design.bgColor, frameLabel, qrCanvas)
      const a = document.createElement('a')
      a.href = offscreen.toDataURL('image/png')
      a.download = `qrcode-express-${printSize}px.png`
      a.click()
      setExporting(false)
      return
    }

    // For unframed QR: render a fresh QRCodeStyling instance at target size
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      const logoSizeMapHi: Record<string, number> = { small: 0.2, medium: 0.3, large: 0.4 }
      const logoImageSizeHi = logoSizeMapHi[design.logoSize ?? 'medium']
      const eyeMapHi = { square: 'square', rounded: 'extra-rounded', circle: 'dot', leaf: 'extra-rounded', classy: 'square' } as const
      const eyeDotMapHi = { square: 'square', rounded: 'square', circle: 'dot', leaf: 'dot', classy: 'dot' } as const
      const bgColorHi = design.bgTransparent ? 'transparent' : design.bgColor
      const dotsGradientHi = design.fgGradient ? {
        gradient: { type: design.gradientType ?? 'linear' as const, rotation: 0, colorStops: [{ offset: 0, color: design.fgColor }, { offset: 1, color: design.fgGradient }] },
      } : { color: design.fgColor }
      const qr = new QRCodeStyling({
        width: printSize,
        height: printSize,
        type: 'canvas',
        data: content,
        dotsOptions: { ...dotsGradientHi, type: design.moduleStyle === 'dots' ? 'dots' : design.moduleStyle === 'rounded' ? 'rounded' : 'square' },
        cornersSquareOptions: { type: eyeMapHi[design.eyeStyle ?? 'square'], color: design.fgColor },
        cornersDotOptions: { type: eyeDotMapHi[design.eyeStyle ?? 'square'], color: design.fgColor },
        backgroundOptions: { color: bgColorHi },
        qrOptions: { errorCorrectionLevel: design.errorCorrection },
        ...(design.logo ? {
          image: design.logo,
          imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: logoImageSizeHi, hideBackgroundDots: true },
        } : {}),
      })
      qr.download({ name: `qrcode-express-${printSize}px`, extension: 'png' })
      setExporting(false)
    })
  }

  const getQRDataUrl = (format: 'png' | 'jpeg' = 'png'): string | null => {
    let src: string | null = null
    if (hasFrame && canvasRef.current) {
      if (format === 'jpeg') {
        const off = document.createElement('canvas')
        off.width = canvasRef.current.width
        off.height = canvasRef.current.height
        const ctx = off.getContext('2d')!
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, off.width, off.height)
        ctx.drawImage(canvasRef.current, 0, 0)
        src = off.toDataURL('image/jpeg', 0.95)
      } else {
        src = canvasRef.current.toDataURL('image/png')
      }
    } else {
      const c = qrNodeRef.current?.querySelector('canvas') as HTMLCanvasElement | null
      if (c) {
        if (format === 'jpeg') {
          const off = document.createElement('canvas')
          off.width = c.width; off.height = c.height
          const ctx = off.getContext('2d')!
          ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, off.width, off.height)
          ctx.drawImage(c, 0, 0)
          src = off.toDataURL('image/jpeg', 0.95)
        } else {
          src = c.toDataURL('image/png')
        }
      }
    }
    return src
  }

  const downloadJpeg = () => {
    const src = getQRDataUrl('jpeg')
    if (!src) return
    const a = document.createElement('a'); a.href = src
    a.download = 'qrcode-express.jpg'; a.click()
  }

  const copyToClipboard = async () => {
    try {
      const src = getQRDataUrl('png')
      if (!src) return
      const res = await fetch(src)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { setCopied(false) }
  }

  const downloadPrintPDF = () => {
    const src = getQRDataUrl('png')
    if (!src) return
    const url = content.startsWith('http') ? content : ''
    const win = window.open('', '_blank')!
    win.document.write(`<!DOCTYPE html><html><head>
<title>QR Code Express — Impression</title>
<style>
  @page { size: A4; margin: 20mm 25mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #1a1a2e; }
  .page { display: flex; flex-direction: column; align-items: center; min-height: 240mm; }
  .logo-line { display: flex; align-items: center; gap: 3mm; margin-bottom: 10mm; }
  .logo-line .dot { width: 5mm; height: 5mm; border-radius: 50%; background: #FF6A00; display: inline-block; }
  .logo-line span { font-size: 11pt; font-weight: bold; color: #041B4D; letter-spacing: 0.5px; }
  .card { border: 0.5pt solid #e5e7eb; border-radius: 5mm; padding: 10mm; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 120mm; }
  .qr-wrap { margin: 4mm 0 6mm; }
  .qr-wrap img { width: 70mm; height: auto; display: block; }
  .url { font-size: 8pt; color: #6b7280; word-break: break-all; text-align: center; margin-top: 2mm; max-width: 90mm; }
  .tip-box { border: 0.3pt solid #fed7aa; border-radius: 3mm; background: #fff7ed; padding: 4mm 6mm; margin-top: 6mm; width: 100%; max-width: 120mm; }
  .tip-box p { font-size: 8pt; color: #92400e; line-height: 1.7; }
  .tip-box strong { color: #B45309; }
  .footer { margin-top: auto; padding-top: 8mm; text-align: center; font-size: 7pt; color: #9ca3af; }
  .print-btn { display: block; margin: 8mm auto 0; padding: 3mm 10mm; background: #FF6A00; color: white; border: none; border-radius: 3mm; font-size: 11pt; cursor: pointer; font-weight: bold; }
  @media print { .print-btn { display: none !important; } }
</style>
</head><body>
<div class="page">
  <div class="logo-line"><span class="dot"></span><span>QR CODE EXPRESS</span></div>
  <div class="card">
    <div class="qr-wrap"><img src="${src}" alt="QR Code" /></div>
    ${url ? `<p class="url">${url}</p>` : ''}
  </div>
  <div class="tip-box">
    <p><strong>Taille recommandée :</strong> 3 cm minimum — 10 cm idéal pour signalétique.</p>
    <p><strong>Distance de scan :</strong> ≈ 10 × la taille du QR code.</p>
    <p><strong>Impression professionnelle :</strong> exportez en SVG et convertissez en CMJN dans Illustrator ou InDesign.</p>
  </div>
  <p class="footer">Généré avec QR CODE EXPRESS · qrcode-express.com</p>
</div>
<button class="print-btn" onclick="window.print()">🖨️ Imprimer (A4)</button>
</body></html>`)
    win.document.close()
  }

  if (!content) {
    return (
      <div className="w-[280px] h-[280px] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm text-center px-6">
        Remplissez le contenu pour voir votre QR code
      </div>
    )
  }

  // Always-dynamic types use __ID__ placeholder before saving — QR not yet usable
  if (content.includes('__ID__')) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-[280px] h-[280px] rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="text-4xl">🔒</div>
          <p className="font-bold text-[#041B4D] text-sm">QR dynamique prêt</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Ce type de QR doit être sauvegardé pour générer un lien actif. Connectez-vous et cliquez sur <strong>Sauvegarder</strong>.
          </p>
        </div>
      </div>
    )
  }

  if (aiImageUrl) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img src={aiImageUrl} alt="QR code artistique IA" className="rounded-xl shadow-lg" style={{ maxWidth: 300, maxHeight: 400 }} />
          <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">✨ IA</span>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadAI}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <Download size={16} /> PNG
          </button>
        </div>
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
        <div ref={qrNodeRef} className={hasFrame ? 'hidden' : 'rounded-xl overflow-hidden border border-gray-100 shadow'} />
        {hasFrame && (
          <canvas ref={canvasRef} className="rounded-xl shadow" style={{ maxWidth: 300, maxHeight: 400 }} />
        )}
      </div>

      {/* ── Export panel ── */}
      <div className="w-full border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/60">
        {/* Quick row */}
        <div className="grid grid-cols-4 divide-x divide-gray-100">
          <button onClick={download} disabled={!content || loading}
            className="flex flex-col items-center gap-1 py-2.5 hover:bg-white transition-colors disabled:opacity-40 group">
            <Download size={14} className="text-[#FF6A00] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-gray-700">PNG</span>
          </button>
          <button onClick={downloadJpeg} disabled={!content || loading}
            className="flex flex-col items-center gap-1 py-2.5 hover:bg-white transition-colors disabled:opacity-40 group">
            <Download size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-gray-700">JPEG</span>
          </button>
          <button onClick={() => qrInstance?.download({ name: 'qrcode-express', extension: 'svg' })}
            disabled={!qrInstance || loading || hasFrame}
            title={hasFrame ? 'SVG non disponible avec un cadre' : ''}
            className="flex flex-col items-center gap-1 py-2.5 hover:bg-white transition-colors disabled:opacity-40 group">
            <Download size={14} className="text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-gray-700">SVG</span>
          </button>
          <button onClick={downloadPrintPDF} disabled={!content || loading}
            className="flex flex-col items-center gap-1 py-2.5 hover:bg-white transition-colors disabled:opacity-40 group">
            <Printer size={14} className="text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-gray-700">PDF</span>
          </button>
        </div>
        {/* Clipboard */}
        <div className="border-t border-gray-100 px-3 py-2">
          <button onClick={copyToClipboard} disabled={!content || loading}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
              copied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-700 hover:border-[#FF6A00]/50 hover:text-[#FF6A00]'
            }`}>
            {copied ? '✅ Copié dans le presse-papiers !' : '📋 Copier l\'image'}
          </button>
        </div>
        {/* High-res */}
        <div className="border-t border-gray-100 px-3 py-2.5 flex items-center gap-2">
          <select
            value={printSize}
            onChange={e => setPrintSize(Number(e.target.value) as 512 | 1024 | 2048 | 4096)}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6A00]/40 font-semibold">
            <option value={512}>512 px — Web / Email</option>
            <option value={1024}>1024 px — Impression standard</option>
            <option value={2048}>2048 px — Haute résolution</option>
            <option value={4096}>4096 px — 4K / Impression pro</option>
          </select>
          <button onClick={downloadHires} disabled={!content || loading || exporting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-[#FF6A00]/40 text-[#FF6A00] hover:bg-orange-50 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0">
            <Download size={11} />
            {exporting ? '…' : 'Exporter'}
          </button>
        </div>
      </div>
    </div>
  )
}
