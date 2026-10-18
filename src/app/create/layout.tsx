import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ClientSidebar from '@/components/dashboard/ClientSidebar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Créer un QR code professionnel | 33 types | QR CODE EXPRESS',
  description: 'Générez un QR code personnalisé : URL, vCard, menu restaurant, paiement Mobile Money (Wave, Orange Money), formulaire, billetterie, lien bio. 33 types disponibles.',
  keywords: 'créer QR code, générateur QR, QR dynamique, menu restaurant QR, paiement Wave QR, Orange Money QR, vCard QR, billetterie QR, Côte d\'Ivoire',
  alternates: { canonical: 'https://qrcode-express.com/create' },
  openGraph: {
    title: 'Créer un QR code — 33 types professionnels | QR CODE EXPRESS',
    description: 'URL, vCard, menu, paiement Mobile Money, billetterie… Personnalisez couleurs & logo. Export PNG & SVG.',
    url: 'https://qrcode-express.com/create',
    images: [{ url: 'https://qrcode-express.com/og-default.png', width: 1200, height: 630 }],
  },
}

export default async function CreateLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
