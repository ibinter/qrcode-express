import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes | QR CODE EXPRESS',
  description: 'Toutes les réponses sur QR CODE EXPRESS : créer un QR code, codes-barres, étiquettes, QR dynamiques, plans & tarifs, paiement Mobile Money, sécurité. 50 questions essentielles.',
  keywords: 'FAQ QR code, questions fréquentes QR, aide QR CODE EXPRESS, codes-barres FAQ, étiquettes FAQ, QR dynamique explication, tarifs QR code Afrique',
  alternates: { canonical: 'https://qrcode-express.com/faq' },
  openGraph: {
    title: 'FAQ QR CODE EXPRESS — 50 questions essentielles',
    description: 'QR codes, codes-barres, étiquettes, plans & tarifs, paiement Mobile Money. Trouvez toutes les réponses.',
    url: 'https://qrcode-express.com/faq',
    images: [{ url: 'https://qrcode-express.com/og-default.png', width: 1200, height: 630 }],
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
