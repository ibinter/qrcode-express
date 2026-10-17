import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CGU — Conditions Générales d\'Utilisation | QR CODE EXPRESS',
  description: 'Conditions générales d\'utilisation de la plateforme QR CODE EXPRESS par IBIG SOFT — INTERMARK BUSINESS INTERNATIONAL GROUP.',
}

const SECTIONS = [
  {
    icon: '📌',
    title: '1. Objet',
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme QR CODE EXPRESS, éditée par IBIG SOFT (INTERMARK BUSINESS INTERNATIONAL GROUP — IBIG SARL), société de droit ivoirien, dont le siège social est situé à Abidjan, Côte d'Ivoire.

En accédant à la plateforme, l'utilisateur accepte sans réserve l'intégralité des présentes CGU.`,
  },
  {
    icon: '🛠️',
    title: '2. Services proposés',
    list: [
      'Création et personnalisation de QR codes statiques et dynamiques (20+ types)',
      'Génération de codes-barres professionnels — 26 formats (EAN-13, Code 128, Data Matrix, PDF417, ISBN, GS1-128…)',
      'Création d\'étiquettes imprimables — 31 gabarits · 10 catégories · PDF compatible Avery',
      'Gestion de menus digitaux, billetterie événementielle, paiements Mobile Money',
      'Formulaires de collecte de prospects',
      'Bio Links et cartes de visite digitales (vCard)',
      'Statistiques et analytics de scan',
      'Génération en masse via import CSV et export ZIP',
      'Gestion d\'organisations et d\'équipes',
    ],
    note: 'Certains services sont disponibles gratuitement. D\'autres sont soumis à un abonnement payant ou à l\'achat de crédits.',
  },
  {
    icon: '👤',
    title: '3. Compte utilisateur',
    content: `Pour accéder aux fonctionnalités avancées, l'utilisateur doit créer un compte en fournissant des informations exactes et à jour. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion.

IBIG SOFT se réserve le droit de suspendre ou résilier tout compte en cas de violation des présentes CGU, d'activité frauduleuse ou de comportement abusif.`,
  },
  {
    icon: '©️',
    title: '4. Propriété intellectuelle',
    content: `Tous les éléments de la plateforme (code source, design, marques, logos, textes) sont la propriété exclusive d'IBIG SOFT et sont protégés par les lois applicables en matière de propriété intellectuelle.

Le contenu créé par l'utilisateur (QR codes, données, textes) reste sa propriété. En l'uploadant sur la plateforme, l'utilisateur concède à IBIG SOFT une licence non exclusive pour le stockage et l'affichage de ce contenu dans le cadre du service.`,
  },
  {
    icon: '⚠️',
    title: '5. Responsabilités & usages interdits',
    intro: 'L\'utilisateur s\'engage à utiliser la plateforme conformément à la loi et aux présentes CGU. Il est notamment interdit d\'utiliser QR CODE EXPRESS pour :',
    list: [
      'Diffuser du contenu illicite, frauduleux ou trompeur',
      'Collecter des données personnelles sans consentement',
      'Contourner les mesures de sécurité de la plateforme',
      'Utiliser la plateforme à des fins concurrentielles non autorisées',
      'Générer des QR codes à des fins de phishing ou d\'escroquerie',
    ],
    note: 'IBIG SOFT ne saurait être tenu responsable des dommages indirects liés à l\'utilisation ou à l\'indisponibilité temporaire du service.',
  },
  {
    icon: '💳',
    title: '6. Abonnements et paiements',
    content: `Les abonnements sont facturés mensuellement en FCFA via les opérateurs de Mobile Money (Wave, Orange Money, MTN MoMo) ou par carte bancaire Visa/Mastercard. L'abonnement est sans engagement et peut être résilié à tout moment depuis le profil utilisateur.

Tarifs en vigueur (FCFA/mois TTC) :
• Gratuit : 0 FCFA — accès limité aux fonctions de base
• Starter : 4 900 FCFA/mois
• Essentiel : 9 900 FCFA/mois
• Pro : 19 900 FCFA/mois
• Business : 29 900 FCFA/mois

En cas de non-paiement, les QR codes dynamiques et codes-barres premium passent en lecture seule. Les données sont conservées pendant 30 jours après résiliation, puis définitivement supprimées.`,
  },
  {
    icon: '🔒',
    title: '7. Protection des données',
    content: 'IBIG SOFT traite les données personnelles conformément à sa Politique de Confidentialité disponible à l\'adresse /confidentialite. Les données sont hébergées sur des serveurs sécurisés (Supabase / infrastructure européenne) et ne sont jamais revendues à des tiers.',
  },
  {
    icon: '✏️',
    title: '8. Modifications des CGU',
    content: 'IBIG SOFT se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email ou notification in-app au moins 7 jours avant l\'entrée en vigueur des nouvelles conditions. La poursuite de l\'utilisation du service après modification vaut acceptation des nouvelles CGU.',
  },
  {
    icon: '⚖️',
    title: '9. Droit applicable & contact',
    content: 'Les présentes CGU sont soumises au droit ivoirien. Tout litige sera soumis à la juridiction compétente d\'Abidjan, Côte d\'Ivoire.',
    contact: {
      email: 'contact@qrcode-express.com',
      phone: '+225 27 22 27 60 14',
      whatsapp: '+225 07 78 88 25 92',
    },
  },
]

export default function CGUPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header banner */}
          <div className="bg-[#041B4D] text-white rounded-2xl p-6 sm:p-10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 20%, #FF6A00, transparent 60%)' }} />
            <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2 relative">Légal</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 relative">Conditions Générales d&apos;Utilisation</h1>
            <p className="text-blue-300 text-sm relative">Dernière mise à jour : octobre 2026</p>
            <p className="text-blue-200 text-sm mt-3 relative">
              Éditeur :{' '}
              <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">IBIG SOFT</a>
              {' '}—{' '}
              <a href="https://intermark-business.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">INTERMARK BUSINESS INTERNATIONAL GROUP (IBIG SARL)</a>
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

                {'intro' in s && s.intro && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{s.intro}</p>
                )}

                {'list' in s && s.list && (
                  <ul className="space-y-1.5 mb-3">
                    {s.list.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#FF6A00] mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {'note' in s && s.note && (
                  <p className="text-gray-500 text-xs italic border-l-2 border-gray-200 pl-3">{s.note}</p>
                )}

                {'content' in s && s.content && (
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
                )}

                {'contact' in s && s.contact && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <p className="text-gray-500">Pour toute question relative aux CGU :</p>
                    <p>📧 <a href={`mailto:${s.contact.email}`} className="text-[#FF6A00] hover:underline font-medium">{s.contact.email}</a></p>
                    <p>📞 <span className="text-gray-700 font-medium">{s.contact.phone}</span></p>
                    <p>💬 <a href="https://wa.me/2250778882592" target="_blank" rel="noopener noreferrer" className="text-[#25d366] hover:underline font-medium">WhatsApp {s.contact.whatsapp}</a></p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Nav links */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/confidentialite" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">Confidentialité</Link>
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
