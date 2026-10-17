import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | QR CODE EXPRESS',
  description: 'Comment QR CODE EXPRESS collecte, utilise et protège vos données personnelles. IBIG SOFT — INTERMARK BUSINESS INTERNATIONAL GROUP.',
}

const SECTIONS = [
  {
    icon: '🏢',
    title: '1. Responsable du traitement',
    items: [
      { label: 'Société', value: 'IBIG SOFT — INTERMARK BUSINESS INTERNATIONAL GROUP (IBIG SARL)' },
      { label: 'Siège social', value: 'Abidjan, Côte d\'Ivoire' },
      { label: 'Site', value: 'ibigsoft.com', href: 'https://ibigsoft.com' },
      { label: 'Contact DPO', value: 'contact@qrcode-express.com', href: 'mailto:contact@qrcode-express.com' },
    ],
  },
  {
    icon: '📋',
    title: '2. Données collectées',
    categories: [
      { name: 'Données de compte', desc: 'Nom, prénom, adresse email, numéro de téléphone (optionnel).' },
      { name: 'Données d\'utilisation', desc: 'QR codes créés, codes-barres générés, étiquettes PDF téléchargées, scans effectués, type d\'appareil, pays de scan (données agrégées et anonymisées).' },
      { name: 'Données de paiement', desc: 'Référence de transaction Mobile Money uniquement. Nous ne stockons jamais vos numéros de compte ni identifiants bancaires.' },
      { name: 'Données techniques', desc: 'Adresse IP, navigateur, cookies de session.' },
    ],
  },
  {
    icon: '🎯',
    title: '3. Finalités du traitement',
    list: [
      'Créer et gérer votre compte utilisateur',
      'Fournir les services QR CODE EXPRESS (QR codes, codes-barres, étiquettes)',
      'Traiter vos paiements et abonnements',
      'Envoyer des notifications liées au service',
      'Améliorer la plateforme (statistiques agrégées)',
      'Assurer la sécurité et prévenir la fraude',
    ],
  },
  {
    icon: '⚖️',
    title: '4. Base légale',
    list: [
      'Exécution du contrat de service (CGU acceptées)',
      'Votre consentement (communications marketing, cookies non essentiels)',
      'Intérêt légitime d\'IBIG SOFT (sécurité, amélioration du service)',
    ],
  },
  {
    icon: '🤝',
    title: '5. Partage des données',
    content: 'Nous ne vendons jamais vos données. Elles peuvent être partagées uniquement avec nos sous-traitants techniques :',
    partners: [
      { name: 'Supabase', role: 'Hébergement base de données, infrastructure EU', href: 'https://supabase.com' },
      { name: 'Vercel', role: 'Hébergement applicatif et CDN', href: 'https://vercel.com' },
      { name: 'GeniusPay', role: 'Traitement des paiements Mobile Money', href: '#' },
    ],
  },
  {
    icon: '⏳',
    title: '6. Durée de conservation',
    list: [
      'Données de compte actif : durée de l\'abonnement + 1 an après résiliation',
      'Données de scan (analytics) : 24 mois glissants',
      'Données de paiement : 5 ans (obligation légale comptable)',
      'Données après suppression de compte : effacées dans les 30 jours',
    ],
  },
  {
    icon: '✅',
    title: '7. Vos droits',
    rights: [
      { name: 'Droit d\'accès', desc: 'Obtenir une copie de vos données personnelles' },
      { name: 'Droit de rectification', desc: 'Corriger des données inexactes ou incomplètes' },
      { name: 'Droit à l\'effacement', desc: 'Demander la suppression de votre compte et de vos données' },
      { name: 'Droit à la portabilité', desc: 'Exporter vos données au format CSV depuis votre profil' },
      { name: 'Droit d\'opposition', desc: 'Vous opposer au traitement à des fins marketing' },
    ],
    contact: 'contact@qrcode-express.com',
  },
  {
    icon: '🔒',
    title: '8. Sécurité des données',
    list: [
      'Chiffrement TLS/SSL de toutes les communications',
      'Chiffrement des données sensibles en base',
      'Row Level Security (RLS) sur Supabase',
      'Authentification sécurisée via JWT',
      'Sauvegardes régulières et plan de reprise',
      'Aucun stockage de données de paiement brutes',
    ],
  },
  {
    icon: '🍪',
    title: '9. Cookies',
    content: 'Pour la politique détaillée sur les cookies, consultez notre page dédiée.',
    link: { label: 'Politique Cookies →', href: '/cookies' },
  },
]

export default function ConfidentialitePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header banner */}
          <div className="bg-[#041B4D] text-white rounded-2xl p-6 sm:p-10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 20%, #FF6A00, transparent 60%)' }} />
            <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2 relative">Légal</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 relative">Politique de Confidentialité</h1>
            <p className="text-blue-300 text-sm relative">Dernière mise à jour : octobre 2026</p>
            <p className="text-blue-200 text-xs mt-3 relative">
              <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">IBIG SOFT</a>
              {' '}— <a href="https://intermark-business.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">INTERMARK BUSINESS INTERNATIONAL GROUP</a>
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {SECTIONS.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{s.icon}</span>
                  <h2 className="font-bold text-[#041B4D] text-lg">{s.title}</h2>
                </div>

                {'content' in s && s.content && !('partners' in s) && !('link' in s) && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{(s as any).content}</p>
                )}

                {'items' in s && s.items && (
                  <dl className="grid gap-2">
                    {s.items.map((item) => (
                      <div key={item.label} className="flex flex-col sm:flex-row sm:gap-3 py-2 border-b border-gray-50 last:border-0">
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-36 shrink-0 mb-0.5 sm:mb-0">{item.label}</dt>
                        <dd className="text-sm text-gray-700">
                          {'href' in item && item.href ? (
                            <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="text-[#041B4D] font-medium hover:text-[#FF6A00] transition-colors">
                              {item.value}
                            </a>
                          ) : item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {'categories' in s && s.categories && (
                  <div className="grid gap-3">
                    {s.categories.map((c) => (
                      <div key={c.name} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-[#FF6A00] font-bold text-sm shrink-0 mt-0.5">→</span>
                        <div>
                          <p className="text-sm font-semibold text-[#041B4D]">{c.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {'list' in s && s.list && (
                  <ul className="space-y-1.5">
                    {s.list.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#FF6A00] mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {'partners' in s && s.partners && (
                  <>
                    {'content' in s && <p className="text-gray-600 text-sm mb-3">{(s as any).content}</p>}
                    <div className="grid gap-2">
                      {s.partners.map((p) => (
                        <div key={p.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold text-[#041B4D]">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.role}</p>
                          </div>
                          {p.href !== '#' && (
                            <a href={p.href} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-[#FF6A00] hover:underline">↗</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {'rights' in s && s.rights && (
                  <>
                    <div className="grid gap-2 mb-4">
                      {s.rights.map((r) => (
                        <div key={r.name} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                          <span className="text-[#FF6A00] font-bold text-sm shrink-0 mt-0.5">✓</span>
                          <div>
                            <p className="text-sm font-semibold text-[#041B4D]">{r.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {'contact' in s && s.contact && (
                      <p className="text-sm text-gray-500">
                        Pour exercer ces droits :{' '}
                        <a href={`mailto:${s.contact}`} className="text-[#FF6A00] hover:underline font-medium">{s.contact}</a>
                      </p>
                    )}
                  </>
                )}

                {'link' in s && s.link && (
                  <>
                    {'content' in s && <p className="text-gray-600 text-sm mb-3">{(s as any).content}</p>}
                    <Link href={s.link.href} className="inline-block text-sm font-medium text-[#FF6A00] hover:underline">{s.link.label}</Link>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Nav links */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/cgu" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">CGU</Link>
            <Link href="/cookies" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">Cookies</Link>
            <Link href="/mentions-legales" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">Mentions légales</Link>
            <Link href="/" className="text-[#FF6A00] hover:underline font-medium">← Accueil</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
