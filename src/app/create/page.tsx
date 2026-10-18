import type { Metadata } from 'next'
import QRGenerator from '@/components/qr/QRGenerator'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function CreatePage() {
  return <QRGenerator />
}
