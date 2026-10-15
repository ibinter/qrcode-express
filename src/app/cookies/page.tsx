import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique Cookies | QR CODE EXPRESS',
  description: 'Politique d\'utilisation des cookies sur QR CODE EXPRESS.',
}

const COOKIES_TABLE = [
  { name: 'sb-auth-token', type: 'Essentiel', duree: 'Session', desc: 'Session d\'authentification Supabase. Nécessaire pour rester connecté.' },
  { name: '__vercel_live_token', type: 'Technique', duree: 'Session', desc: 'Déployé par Vercel, sert au prérendu Edge.' },
  { name: 'qre_theme', type: 'Préférences', duree: '1 an', desc: 'Mémorise votre préférence de thème (clair/sombre).' },
  { name: 'qre_lang', type: 'Préférences', duree: '1 an', desc: 'Mémorise votre préférence de langue.' },
  { name: '_ga, _gid', type: 'Analytique', duree: '2 ans / 24h', desc: 'Google Analytics — comptage des visites (activé uniquement avec votre consentement).' },
]

const TYPE_COLORS: Record<string, string> = {
  Essentiel: 'bg-green-100 text-green-700',
  Technique: 'bg-blue-100 text-blue-700',
  Préférences: 'bg-yellow-100 text-yellow-700',
  Analytique: 'bg-purple-100 text-purple-700',
}

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#041B4D] text-white rounded-2xl p-8 mb-8">
            <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2">Légal</p>
            <h1 className="text-3xl font-extrabold mb-2">Politique Cookies</h1>
            <p className="text-blue-300 text-sm">Dernière mise à jour : janvier 2026</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-[#041B4D] text-lg mb-3">Qu&apos;est-ce qu&apos;un cookie ?</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d&apos;un site web. Il permet de mémoriser des informations entre deux visites (session, préférences) ou de collecter des statistiques anonymes.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-[#041B4D] text-lg mb-4">Cookies utilisés sur QR CODE EXPRESS</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      <th className="py-2 pr-4">Nom</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Durée</th>
                      <th className="py-2">Finalité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {COOKIES_TABLE.map((c) => (
                      <tr key={c.name}>
                        <td className="py-3 pr-4 font-mono text-xs text-gray-500">{c.name}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type]}`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">{c.duree}</td>
                        <td className="py-3 text-xs text-gray-500">{c.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-[#041B4D] text-lg mb-3">Gérer vos préférences</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Les cookies <strong>essentiels</strong> sont nécessaires au fonctionnement du service et ne peuvent pas être désactivés.
                Les cookies <strong>analytiques</strong> sont optionnels et soumis à votre consentement.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Vous pouvez à tout moment effacer les cookies depuis les paramètres de votre navigateur ou utiliser un module de gestion des cookies (ex. : uBlock Origin, Privacy Badger).
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-[#041B4D] text-lg mb-3">Contact</h2>
              <p className="text-gray-600 text-sm">
                Pour toute question relative aux cookies : <a href="mailto:privacy@qrcodeexpress.ci" className="text-[#FF6A00] hover:underline">privacy@qrcodeexpress.ci</a>
              </p>
            </div>
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
