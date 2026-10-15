import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | QR CODE EXPRESS',
  description: 'Comment QR CODE EXPRESS collecte, utilise et protège vos données personnelles.',
}

const SECTIONS = [
  {
    title: '1. Responsable du traitement',
    content: `IBIG SOFT (INTERMARK BUSINESS INTERNATIONAL GROUP — IBIG SARL), Abidjan, Côte d'Ivoire.
Contact DPO : privacy@qrcodeexpress.ci`,
  },
  {
    title: '2. Données collectées',
    content: `Nous collectons les données suivantes :

**Données de compte :** nom, prénom, adresse email, numéro de téléphone (optionnel).

**Données d'utilisation :** QR codes créés, scans effectués, type d'appareil, pays de scan (données agrégées et anonymisées).

**Données de paiement :** référence de transaction Mobile Money (Wave, Orange Money, MTN MoMo). Nous ne stockons jamais votre numéro de compte ni vos identifiants bancaires.

**Données techniques :** adresse IP, navigateur, cookies de session.`,
  },
  {
    title: '3. Finalités du traitement',
    content: `Vos données sont utilisées pour :
- Créer et gérer votre compte utilisateur
- Fournir les services QR CODE EXPRESS
- Traiter vos paiements et abonnements
- Envoyer des notifications liées au service
- Améliorer la plateforme (statistiques agrégées)
- Assurer la sécurité et prévenir la fraude`,
  },
  {
    title: '4. Base légale',
    content: `Le traitement de vos données repose sur :
- L'exécution du contrat de service (CGU)
- Votre consentement (communications marketing, cookies non essentiels)
- Notre intérêt légitime (sécurité, amélioration du service)`,
  },
  {
    title: '5. Partage des données',
    content: `Nous ne vendons jamais vos données. Elles peuvent être partagées avec :
- **Supabase** (hébergement de base de données, infrastructure EU)
- **Vercel** (hébergement applicatif)
- **GeniusPay** (traitement des paiements Mobile Money)

Ces sous-traitants sont soumis à des engagements contractuels de confidentialité.`,
  },
  {
    title: '6. Durée de conservation',
    content: `- Données de compte actif : conservées le temps de l'abonnement + 1 an après résiliation
- Données de scan (analytics) : 24 mois
- Données de paiement : 5 ans (obligation légale comptable)
- Données après suppression de compte : effacées dans les 30 jours`,
  },
  {
    title: '7. Vos droits',
    content: `Conformément aux lois applicables, vous disposez des droits suivants :
- **Droit d'accès** : obtenir une copie de vos données
- **Droit de rectification** : corriger vos données
- **Droit à l'effacement** : demander la suppression de votre compte et données
- **Droit à la portabilité** : exporter vos données au format CSV
- **Droit d'opposition** : vous opposer au traitement marketing

Pour exercer ces droits : privacy@qrcodeexpress.ci`,
  },
  {
    title: '8. Sécurité',
    content: `Nous mettons en œuvre les mesures techniques suivantes :
- Chiffrement TLS/SSL de toutes les communications
- Chiffrement des données sensibles en base
- Row Level Security (RLS) sur Supabase
- Authentification sécurisée via JWT
- Sauvegardes régulières`,
  },
  {
    title: '9. Cookies',
    content: `Pour la politique détaillée sur les cookies, consultez notre page dédiée : /cookies`,
  },
]

export default function ConfidentialitePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#041B4D] text-white rounded-2xl p-8 mb-8">
            <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2">Légal</p>
            <h1 className="text-3xl font-extrabold mb-2">Politique de Confidentialité</h1>
            <p className="text-blue-300 text-sm">Dernière mise à jour : janvier 2026</p>
          </div>

          <div className="space-y-6">
            {SECTIONS.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-[#041B4D] text-lg mb-3">{s.title}</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{s.content}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center space-x-4">
            <Link href="/cgu" className="text-sm text-gray-500 hover:text-[#FF6A00]">CGU</Link>
            <Link href="/cookies" className="text-sm text-gray-500 hover:text-[#FF6A00]">Cookies</Link>
            <Link href="/" className="text-sm text-[#FF6A00] hover:underline">← Accueil</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
