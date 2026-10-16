import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'API REST | QR CODE EXPRESS',
  description: 'Documentation de l\'API REST QR CODE EXPRESS. Génération en lot, intégration, statistiques de scan.',
}

export default function ApiDocsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">

          <div className="bg-[#041B4D] text-white rounded-2xl p-10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 20%, #FF6A00, transparent 60%)' }} />
            <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-3 relative">Développeurs</p>
            <h1 className="text-3xl font-extrabold mb-3 relative">API REST QR CODE EXPRESS</h1>
            <p className="text-blue-300 relative">Génération en lot · Intégration · Statistiques</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 mb-6">
            <div className="text-5xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-[#041B4D] mb-3">Documentation en cours de rédaction</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              L&apos;API REST est disponible exclusivement sur le plan <strong className="text-[#041B4D]">Business</strong>.
              Elle permet la génération en lot (jusqu&apos;à 1 000 QR), l&apos;intégration dans vos outils métiers et la récupération des statistiques via des endpoints sécurisés.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: '⚡', label: 'Génération en lot', desc: 'Jusqu\'à 1 000 QR par appel' },
                { icon: '📊', label: 'Statistiques', desc: 'Scans via endpoints sécurisés' },
                { icon: '🔑', label: 'Auth par clé API', desc: 'Clés générées depuis votre profil' },
              ].map((f) => (
                <div key={f.label} className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <p className="font-semibold text-[#041B4D] text-sm">{f.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mb-4">Contactez-nous pour accès anticipé :</p>
            <a
              href="https://wa.me/2250778882592?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20l%27API%20REST%20QR%20CODE%20EXPRESS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #25d366, #128c5e)' }}
            >
              💬 Discutons sur WhatsApp
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/tarifs" className="text-[#FF6A00] hover:underline font-medium">Voir les plans →</Link>
            <Link href="/" className="text-gray-500 hover:text-[#FF6A00] transition-colors">← Accueil</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
