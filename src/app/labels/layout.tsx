import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ClientSidebar from '@/components/dashboard/ClientSidebar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Créateur d\'étiquettes en ligne | 31 gabarits | QR CODE EXPRESS',
  description: 'Créez et imprimez des étiquettes professionnelles : 31 gabarits (commerce, pharmacie, mode, bijoux, logistique). Compatible Avery. Intégration QR code et code-barres.',
  keywords: 'étiquettes en ligne, gabarits étiquettes, étiquettes Avery, étiquettes produits, étiquettes QR code, créateur étiquettes, étiquettes commerce Afrique',
  alternates: { canonical: 'https://qrcode-express.com/labels' },
  openGraph: {
    title: 'Créateur d\'étiquettes — 31 gabarits professionnels | QR CODE EXPRESS',
    description: '31 gabarits : commerce, pharmacie, mode, bijoux, logistique. Compatible Avery. QR code & code-barres intégrés.',
    url: 'https://qrcode-express.com/labels',
    images: [{ url: 'https://qrcode-express.com/og-default.png', width: 1200, height: 630 }],
  },
}

const LABELS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Créateur d\'étiquettes QR CODE EXPRESS',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  url: 'https://qrcode-express.com/labels',
  description: '31 gabarits d\'étiquettes professionnelles : commerce, pharmacie, mode, bijoux, logistique. Compatible Avery. Intégration QR code et code-barres.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'XOF' },
  provider: { '@type': 'Organization', name: 'IBIG SOFT', url: 'https://qrcode-express.com' },
}

export default async function LabelsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Non authentifié : layout public avec header
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LABELS_JSON_LD) }} />
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LABELS_JSON_LD) }} />
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
