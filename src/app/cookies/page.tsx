import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique Cookies | QR CODE EXPRESS',
  description: 'Politique d\'utilisation des cookies sur QR CODE EXPRESS. Quels cookies, pourquoi, et comment les gérer.',
}

const COOKIES_TABLE = [
  { name: 'NEXT_LOCALE', type: 'Essentiel', duree: '1 an', desc: 'Mémorise votre préférence de langue (fr, en, ar, pt).' },
  { name: 'sb-auth-token', type: 'Essentiel', duree: 'Session', desc: 'Session d\'authentification Supabase. Nécessaire pour rester connecté.' },
  { name: '__vercel_live_token', type: 'Technique', duree: 'Session', desc: 'Déployé par Vercel pour le pré-rendu Edge.' },
  { name: 'qre_theme', type: 'Préférences', duree: '1 an', desc: 'Mémorise votre préférence de thème (clair/sombre).' },
  { name: '_ga, _gid', type: 'Analytique', duree: '2 ans / 24h', desc: 'Google Analytics — comptage des visites, uniquement avec votre consentement.' },
]

const TYPE_COLORS: Record<string, string> = {
  Essentiel: 'bg-green-100 text-green-700',
  Technique: 'bg-blue-100 text-blue-700',
  Préférences: 'bg-yellow-100 text-yellow-700',
  Analytique: 'bg-purple-100 text-purple-700',
}

const TYPE_ICONS: Record<string, string> = {
  Essentiel: '🟢',
  Technique: '🔵',
  Préférences: '🟡',
  Analytique: '🟣',
}

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header banner */}
          <div className="bg-[#041B4D] text-white rounded-2xl p-6 sm:p-10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 20%, #FF6A00, transparent 60%)' }} />
            <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2 relative">Légal</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 relative">Politique Cookies</h1>
            <p className="text-blue-300 text-sm relative">Dernière mise à jour : janvier 2026</p>
          </div>

          <div className="space-y-4">

            {/* Qu'est-ce qu'un cookie */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🍪</span>
                <h2 className="font-bold text-[#041B4D] text-lg">Qu&apos;est-ce qu&apos;un cookie ?</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d&apos;un site web. Il permet de mémoriser vos préférences entre deux visites (langue, session, thème) ou de collecter des statistiques anonymes pour améliorer l&apos;expérience utilisateur.
              </p>
            </div>

            {/* Tableau des cookies */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xl">📊</span>
                <h2 className="font-bold text-[#041B4D] text-lg">Cookies utilisés</h2>
              </div>

              {/* Mobile: cards */}
              <div className="sm:hidden space-y-3">
                {COOKIES_TABLE.map((c) => (
                  <div key={c.name} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-0.5 rounded">{c.name}</code>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type]}`}>
                        {TYPE_ICONS[c.type]} {c.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Durée : <span className="font-medium text-gray-700">{c.duree}</span></p>
                    <p className="text-xs text-gray-500">{c.desc}</p>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="py-2 pr-4">Nom</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Durée</th>
                      <th className="py-2">Finalité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {COOKIES_TABLE.map((c) => (
                      <tr key={c.name} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 pr-4">
                          <code className="font-mono text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">{c.name}</code>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type]}`}>
                            {TYPE_ICONS[c.type]} {c.type}
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

            {/* Gérer les préférences */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚙️</span>
                <h2 className="font-bold text-[#041B4D] text-lg">Gérer vos préférences</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
                  <span className="text-green-600 font-bold shrink-0">🟢</span>
                  <p><strong className="text-gray-700">Cookies essentiels</strong> — Nécessaires au fonctionnement du service (authentification, langue). Ils ne peuvent pas être désactivés.</p>
                </div>
                <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
                  <span className="text-purple-600 font-bold shrink-0">🟣</span>
                  <p><strong className="text-gray-700">Cookies analytiques</strong> — Optionnels et soumis à votre consentement. Vous pouvez les refuser sans impact sur le service.</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                Vous pouvez à tout moment effacer les cookies depuis les paramètres de votre navigateur ou utiliser un gestionnaire de confidentialité (ex. uBlock Origin, Privacy Badger).
              </p>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✉️</span>
                <h2 className="font-bold text-[#041B4D] text-lg">Contact</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">Pour toute question relative aux cookies ou à votre vie privée :</p>
                <p>📧 <a href="mailto:contact@qrcode-express.com" className="text-[#FF6A00] hover:underline font-medium">contact@qrcode-express.com</a></p>
                <p>📞 <span className="text-gray-700 font-medium">+225 27 22 27 60 14</span></p>
                <p>💬 <a href="https://wa.me/2250778882592" target="_blank" rel="noopener noreferrer" className="text-[#25d366] hover:underline font-medium">WhatsApp +225 07 78 88 25 92</a></p>
              </div>
            </div>

          </div>

          {/* Nav links */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/cgu" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">CGU</Link>
            <Link href="/confidentialite" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">Confidentialité</Link>
            <Link href="/mentions-legales" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">Mentions légales</Link>
            <Link href="/" className="text-[#FF6A00] hover:underline font-medium">← Accueil</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
