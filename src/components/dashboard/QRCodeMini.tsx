'use client'
import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

interface Props {
  content: string
  color?: string
}

export default function QRCodeMini({ content, color = '#041B4D' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (!ref.current) return
    if (!instanceRef.current) {
      instanceRef.current = new QRCodeStyling({
        width: 64, height: 64,
        data: content || 'https://qrcode-express-ibig.vercel.app',
        dotsOptions: { color, type: 'square' },
        backgroundOptions: { color: '#FFFFFF' },
        qrOptions: { errorCorrectionLevel: 'M' },
      })
      instanceRef.current.append(ref.current)
    } else {
      instanceRef.current.update({ data: content || 'https://qrcode-express-ibig.vercel.app', dotsOptions: { color } })
    }
  }, [content, color])

  return <div ref={ref} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shrink-0" />
}
