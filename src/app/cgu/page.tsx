import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CGU — Conditions Générales d\'Utilisation | QR CODE EXPRESS',
  description: 'Conditions générales d\'utilisation de la plateforme QR CODE EXPRESS par IBIG SOFT.',
}

const SECTIONS = [
  {
    title: '1. Objet',
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme QR CODE EXPRESS, éditée par IBIG SOFT (INTERMARK BUSINESS INTERNATIONAL GROUP — IBIG SARL), société de droit ivoirien, dont le siège social est situé à Abidjan, Côte d'Ivoire.

En accédant à la plateforme, l'utilisateur accepte sans réserve l'intégralité des présentes CGU.`,
  },
  {
    title: '2. Services proposés',
    content: `QR CODE EXPRESS propose les services suivants :
- Création et personnalisation de QR codes statiques et dynamiques
- Gestion de menus digitaux, billetterie événementielle, paiements Mobile Money
- Formulaires de collecte de prospects
- Bio Links et cartes de visite digitales (vCard)
- Statistiques et analytics de scan
- Gestion d'organisations et d'équipes

Certains services sont disponibles gratuitement. D'autres sont soumis à un abonnement payant ou à l'achat de crédits.`,
  },
  {
    title: '3. Compte utilisateur',
    content: `Pour accéder aux fonctionnalités avancées, l'utilisateur doit créer un compte en fournissant des informations exactes et à jour. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion.

IBIG SOFT se réserve le droit de suspendre ou résilier tout compte en cas de violation des présentes CGU, d'activité frauduleuse ou de comportement abusif.`,
  },
  {
    title: '4. Propriété intellectuelle',
    content: `Tous les éléments de la plateforme (code source, design, marques, logos, textes) sont la propriété exclusive d'IBIG SOFT et sont protégés par les lois applicables en matière de propriété intellectuelle.

Le contenu créé par l'utilisateur (QR codes, données, textes) reste sa propriété. En l'uploadant sur la plateforme, l'utilisateur concède à IBIG SOFT une licence non exclusive pour le stockage et l'affichage de ce contenu dans le cadre du service.`,
  },
  {
    title: '5. Responsabilités',
    content: `L'utilisateur s'engage à utiliser la plateforme conformément à la loi et aux présentes CGU. Il est notamment interdit d'utiliser QR CODE EXPRESS pour :
- Diffuser du contenu illicite, frauduleux ou trompeur
- Collecter des données personnelles sans consentement
- Contourner les mesures de sécurité de la plateforme
- Utiliser la plateforme pour des fins concurrentielles non autorisées

IBIG SOFT ne saurait être tenu responsable des dommages indirects liés à l'utilisation ou à l'indisponibilité temporaire du service.`,
  },
  {
    title: '6. Abonnements et paiements',
    content: `Les abonnements sont facturés mensuellement en FCFA via les opérateurs de Mobile Money (Wave, Orange Money, MTN MoMo). L'abonnement est sans engagement et peut être résilié à tout moment depuis le profil utilisateur.

En cas de non-paiement, les QR codes dynamiques passent en lecture seule. Les données sont conservées pendant 30 jours après résiliation.`,
  },
  {
    title: '7. Protection des données',
    content: `IBIG SOFT traite les données personnelles conformément à sa Politique de Confidentialité disponible à l'adresse /confidentialite. Les données sont hébergées sur des serveurs sécurisés (Supabase / infrastructure européenne).`,
  },
  {
    title: '8. Modifications des CGU',
    content: `IBIG SOFT se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email ou notification in-app. La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles CGU.`,
  },
  {
    title: '9. Droit applicable',
    content: `Les présentes CGU sont soumises au droit ivoirien. Tout litige sera soumis à la juridiction compétente d'Abidjan, Côte d'Ivoire.

Pour toute question : contact@qrcodeexpress.ci`,
  },
]

export default function CGUPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-[#041B4D] text-white rounded-2xl p-8 mb-8">
            <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2">Légal</p>
            <h1 className="text-3xl font-extrabold mb-2">Conditions Générales d&apos;Utilisation</h1>
            <p className="text-blue-300 text-sm">Dernière mise à jour : janvier 2026</p>
            <p className="text-blue-200 text-sm mt-3">
              Éditeur : IBIG SOFT — INTERMARK BUSINESS INTERNATIONAL GROUP (IBIG SARL)<br/>
              Siège social : Abidjan, Côte d&apos;Ivoire
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {SECTIONS.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-[#041B4D] text-lg mb-3">{s.title}</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{s.content}</div>
              </div>
            ))}
          </div>

          {/* Back */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-[#FF6A00] hover:underline">← Retour à l&apos;accueil</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
