import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions Légales | QR CODE EXPRESS',
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#041B4D] text-white rounded-2xl p-8 mb-8">
            <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2">Légal</p>
            <h1 className="text-3xl font-extrabold">Mentions Légales</h1>
          </div>

          <div className="space-y-6">
            {[
              {
                title: 'Éditeur du site',
                content: `Raison sociale : INTERMARK BUSINESS INTERNATIONAL GROUP — IBIG SARL
Nom commercial : IBIG SOFT
Siège social : Abidjan, Côte d'Ivoire
Capital social : [en cours d'enregistrement]
RCCM : [en cours]
Email : contact@qrcodeexpress.ci
WhatsApp : +225 07 78 55 12 34`,
              },
              {
                title: 'Directeur de la publication',
                content: `Le directeur de la publication est le représentant légal d'IBIG SOFT.`,
              },
              {
                title: 'Hébergement',
                content: `Hébergement applicatif : Vercel Inc., 340 Pine Street, Suite 900, San Francisco, CA 94104, USA
Base de données : Supabase Inc. (infrastructure hébergée en Europe de l'Ouest)`,
              },
              {
                title: 'Propriété intellectuelle',
                content: `Le site QR CODE EXPRESS et l'ensemble de ses contenus (textes, images, logo, code source) sont protégés par le droit de la propriété intellectuelle.
Toute reproduction partielle ou totale sans autorisation préalable est strictement interdite.`,
              },
              {
                title: 'Limitation de responsabilité',
                content: `IBIG SOFT ne saurait être tenu responsable des dommages directs ou indirects causés au matériel de l'utilisateur lors de l'accès au site. IBIG SOFT se réserve le droit de modifier le contenu du site à tout moment et sans préavis.`,
              },
            ].map((s) => (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-[#041B4D] text-lg mb-3">{s.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center space-x-4">
            <Link href="/cgu" className="text-sm text-gray-500 hover:text-[#FF6A00]">CGU</Link>
            <Link href="/confidentialite" className="text-sm text-gray-500 hover:text-[#FF6A00]">Confidentialité</Link>
            <Link href="/" className="text-sm text-[#FF6A00] hover:underline">← Accueil</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
