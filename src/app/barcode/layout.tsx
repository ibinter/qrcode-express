import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ClientSidebar from '@/components/dashboard/ClientSidebar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Générateur de codes-barres en ligne | 26 formats | QR CODE EXPRESS',
  description: 'Créez des codes-barres professionnels : EAN-13, Code 128, QR Code, Data Matrix, PDF417, ISBN, GS1-128 et 26 formats. Export PNG haute résolution et SVG vectoriel. Gratuit.',
  keywords: 'générateur code-barres, EAN-13, Code 128, Data Matrix, PDF417, QR Code, barcode generator, codes-barres en ligne, export PNG SVG',
  alternates: { canonical: 'https://qrcode-express.com/barcode' },
  openGraph: {
    title: 'Générateur de codes-barres 26 formats | QR CODE EXPRESS',
    description: 'EAN-13, Code 128, Data Matrix, PDF417, ISBN, GS1-128… 26 formats professionnels. Export PNG & SVG.',
    url: 'https://qrcode-express.com/barcode',
    images: [{ url: 'https://qrcode-express.com/og-default.png', width: 1200, height: 630 }],
  },
}

const BARCODE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Générateur de codes-barres QR CODE EXPRESS',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  url: 'https://qrcode-express.com/barcode',
  description: '26 formats de codes-barres : EAN-13, Code 128, Data Matrix, PDF417, ISBN, GS1-128, QR Code, Aztec. Export PNG & SVG.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'XOF' },
  provider: { '@type': 'Organization', name: 'IBIG SOFT', url: 'https://qrcode-express.com' },
}

export default async function BarcodeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Non authentifié : layout public avec header
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BARCODE_JSON_LD) }} />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    )
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, credits')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BARCODE_JSON_LD) }} />
      <ClientSidebar
        userEmail={user.email ?? ''}
        plan={profile?.plan ?? 'free'}
        credits={profile?.credits ?? 0}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
