'use client'
import dynamic from 'next/dynamic'

const QRGenerator = dynamic(() => import('./QRGenerator'), { ssr: false })

export default function QRGeneratorClient() {
  return <QRGenerator />
}
