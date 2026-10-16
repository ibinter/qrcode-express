'use client'
import { useEffect, useRef } from 'react'

interface Props {
  content: string
  color?: string
}

export default function QRCodeMini({ content, color = '#041B4D' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<any>(null)

  useEffect(() => {
    if (!ref.current) return
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (!ref.current) return
      if (!instanceRef.current) {
        instanceRef.current = new QRCodeStyling({
          width: 64, height: 64,
          data: content || 'https://qrcode-express.com',
          dotsOptions: { color, type: 'square' },
          backgroundOptions: { color: '#FFFFFF' },
          qrOptions: { errorCorrectionLevel: 'M' },
        })
        instanceRef.current.append(ref.current)
      } else {
        instanceRef.current.update({ data: content || 'https://qrcode-express.com', dotsOptions: { color } })
      }
    })
  }, [content, color])

  return <div ref={ref} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50" />
}
