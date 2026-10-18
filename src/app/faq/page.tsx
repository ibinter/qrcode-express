'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const CATEGORIES = [
  {
    id: 'general',
    icon: '🌐',
    title: 'Général',
    color: '#041B4D',
    questions: [
      {
        q: "Qu'est-ce que QR Code Express ?",
        a: "QR Code Express est une plateforme tout-en-un pour créer, personnaliser et gérer des QR codes, codes-barres et étiquettes professionnelles. Elle est conçue pour les particuliers, commerçants, restaurateurs et entreprises d'Afrique francophone et du monde entier.",
      },
      {
        q: "Est-ce que QR Code Express est gratuit ?",
        a: "Oui, un plan Gratuit est disponible sans carte bancaire. Il permet de créer jusqu'à 5 QR codes statiques, de télécharger en PNG et d'accéder aux types de base (URL, WhatsApp, WiFi, vCard…). Les fonctionnalités avancées (QR dynamiques, personnalisation complète, codes-barres premium, étiquettes) nécessitent un plan payant ou des crédits.",
      },
      {
        q: "Ai-je besoin d'un compte pour créer un QR code ?",
        a: "Non, les pages /create, /barcode et /labels sont accessibles sans compte pour prévisualiser. En revanche, le téléchargement en haute définition, la sauvegarde et les fonctionnalités premium requièrent un compte. L'inscription est gratuite et ne prend que 30 secondes.",
      },
      {
        q: "Quelle est la différence entre un QR code statique et dynamique ?",
        a: "Un QR code statique encode l'information directement dans le QR — vous ne pouvez plus modifier le contenu après impression. Un QR code dynamique pointe vers une URL courte que vous contrôlez : vous pouvez changer la destination à tout moment sans réimprimer, et vous obtenez des statistiques de scans (pays, appareil, date).",
      },
      {
        q: "Puis-je utiliser QR Code Express sur mobile ?",
        a: "Oui, la plateforme est entièrement responsive et optimisée pour mobile. Vous pouvez créer, prévisualiser et télécharger vos QR codes, codes-barres et étiquettes depuis un smartphone ou une tablette.",
      },
      {
        q: "Dans quels pays QR Code Express est-il disponible ?",
        a: "QR Code Express est accessible partout dans le monde. La plateforme accepte les paiements par Mobile Money (Orange, MTN, Wave, Moov) pour l'Afrique de l'Ouest, ainsi que les cartes bancaires internationales via Stripe pour tous les autres pays.",
      },
      {
        q: "Comment contacter le support ?",
        a: "Le support est disponible via WhatsApp au +225 07 78 88 25 92, par email et via le formulaire de contact. Les utilisateurs des plans Essentiel et supérieurs bénéficient d'un support prioritaire avec un temps de réponse réduit.",
      },
      {
        q: "QR Code Express est-il sécurisé ?",
        a: "Oui. La plateforme utilise HTTPS (SSL), l'authentification Supabase avec chiffrement des données, et un système anti-phishing (anti-quishing) qui bloque la création de QR codes pointant vers des IPs privées ou des URLs non sécurisées. Vos données ne sont jamais revendues.",
      },
    ],
  },
  {
    id: 'qr-creation',
    icon: '📱',
    title: 'Création de QR codes',
    color: '#FF6A00',
    questions: [
      {
        q: "Combien de types de QR codes propose la plateforme ?",
        a: "QR Code Express propose plus de 30 types de QR codes : URL, WhatsApp, vCard, vCard Pro, WiFi, SMS, Email, PDF, Application, Événement, Menu restaurant, Coupon, Bio Link, Réseaux sociaux, Localisation, Catalogue, Avis Google, Formulaire lead, Paiement, Galerie photo, Vidéo, Audio, Carte cadeau, Ticket, Fidélité, Sondage, Offre d'emploi, Téléchargement, Cryptomonnaie, Rendez-vous et Business.",
      },
      {
        q: "Puis-je personnaliser les couleurs de mon QR code ?",
        a: "Oui. Vous pouvez choisir la couleur du QR code, la couleur de l'arrière-plan, ajouter un dégradé, arrondir les coins et modifier le style des modules (carrés, ronds, étoiles…). Le plan Essentiel débloque la personnalisation complète.",
      },
      {
        q: "Puis-je ajouter mon logo dans un QR code ?",
        a: "Oui, vous pouvez uploader votre logo (PNG, SVG, JPG) pour l'intégrer au centre du QR code. La taille du logo est ajustable. Assurez-vous que le logo ne couvre pas plus de 30 % de la surface pour que le QR code reste lisible.",
      },
      {
        q: "Quels formats d'export sont disponibles ?",
        a: "Le plan Gratuit permet le téléchargement en PNG. Les plans payants débloquent l'export en SVG (vectoriel, idéal pour l'impression grand format) et l'impression HD. Les codes-barres sont également exportables en PDF.",
      },
      {
        q: "Comment créer un QR code WhatsApp ?",
        a: "Allez sur /create, sélectionnez le type 'WhatsApp', entrez votre numéro de téléphone avec l'indicatif pays (ex : +2250778882592) et, optionnellement, un message pré-rempli. Le QR code généré ouvrira directement une conversation WhatsApp lorsqu'il est scanné.",
      },
      {
        q: "Comment créer un QR code WiFi ?",
        a: "Sélectionnez le type 'WiFi', entrez le nom de votre réseau (SSID), le mot de passe et le type de sécurité (WPA2, WPA3, WEP ou ouvert). Vos clients pourront se connecter automatiquement en scannant le QR code, sans taper le mot de passe.",
      },
      {
        q: "Comment créer un QR code vCard Pro ?",
        a: "Le type vCard Pro génère une page de contact interactive avec photo, réseaux sociaux, site web et bouton 'Ajouter aux contacts'. C'est une version enrichie de la vCard classique. Il nécessite le plan Essentiel ou des crédits.",
      },
      {
        q: "Comment créer un QR code menu restaurant ?",
        a: "Sélectionnez le type 'Menu', téléchargez votre PDF ou renseignez les catégories et plats directement dans le formulaire. Le QR code affichera un menu interactif sur le smartphone du client. Ce type nécessite le plan Essentiel.",
      },
      {
        q: "Puis-je créer un QR code PDF ?",
        a: "Oui. Avec le type 'PDF', uploadez votre document (max 10 Mo) et le QR code permettra à l'utilisateur de le consulter directement depuis son téléphone. Ce type est disponible à partir du plan Essentiel.",
      },
      {
        q: "Puis-je créer plusieurs QR codes à la fois ?",
        a: "Oui. La fonctionnalité d'import CSV (accessible via le tableau de bord) vous permet de générer plusieurs QR codes URL en masse. Pour les étiquettes, la page /labels/batch permet la génération en lot à partir d'un fichier CSV.",
      },
    ],
  },
  {
    id: 'qr-dynamic',
    icon: '⚡',
    title: 'QR codes dynamiques',
    color: '#8b5cf6',
    questions: [
      {
        q: "Comment fonctionne le suivi des scans ?",
        a: "Chaque scan d'un QR code dynamique est enregistré avec la date, l'heure, le pays, l'appareil (mobile/tablette/desktop) et le système d'exploitation. Ces statistiques sont visibles dans votre tableau de bord sous forme de graphiques et de listes d'activité.",
      },
      {
        q: "Puis-je modifier la destination d'un QR code dynamique après impression ?",
        a: "Oui, c'est l'avantage principal des QR codes dynamiques. Depuis votre dashboard, cliquez sur le QR code, puis 'Modifier la destination'. Le QR code imprimé pointera immédiatement vers la nouvelle URL, sans aucune réimpression.",
      },
      {
        q: "Puis-je mettre en pause un QR code dynamique ?",
        a: "Oui. Depuis le tableau de bord, vous pouvez basculer un QR code en mode 'Pause'. Lorsqu'il est en pause, les scans affichent un message personnalisable plutôt que la destination. Utile pour les promotions temporaires.",
      },
      {
        q: "Puis-je fixer une date d'expiration sur un QR code ?",
        a: "Oui, lors de la création d'un QR code dynamique, vous pouvez définir une date d'expiration. Après cette date, le QR code peut afficher un message d'expiration ou être automatiquement redirigé vers une URL de remplacement.",
      },
      {
        q: "Puis-je limiter le nombre de scans d'un QR code ?",
        a: "Oui. L'option 'Nombre de scans maximum' permet de désactiver automatiquement un QR code après un certain nombre de scans. Pratique pour les concours, coupons uniques ou offres limitées.",
      },
      {
        q: "Comment ajouter un mot de passe à un QR code ?",
        a: "Lors de la création ou de la modification d'un QR code dynamique, activez l'option 'Protéger par mot de passe' et définissez un code PIN. Les personnes qui scannent devront saisir ce code avant d'accéder au contenu.",
      },
      {
        q: "Les QR codes dynamiques fonctionnent-ils hors ligne ?",
        a: "Non. Un QR code dynamique pointe vers une URL courte qui redirige vers la destination réelle. Une connexion internet est nécessaire pour que la redirection fonctionne. Si votre cas d'usage nécessite un fonctionnement hors ligne, utilisez un QR code statique.",
      },
    ],
  },
  {
    id: 'barcodes',
    icon: '📊',
    title: 'Codes-barres',
    color: '#0ea5e9',
    questions: [
      {
        q: "Quels formats de codes-barres sont disponibles ?",
        a: "QR Code Express propose 26 formats : Code 128, EAN-13, EAN-8, UPC-A, UPC-E, Code 39, Code 39 Extended, Code 93, Codabar, Interleaved 2 of 5, ITF-14, Code 11, Industrial 2 of 5, Code 32, EAN-128, SSCC-18, ISBN, MSI Modified, DataMatrix, GS1 DataMatrix, PDF417, Postnet, Planet, QR Code natif, Aztec Code, et Code 93 Extended.",
      },
      {
        q: "Quelle est la différence entre EAN-13 et EAN-8 ?",
        a: "L'EAN-13 encode 13 chiffres et est le standard mondial pour les produits de grande consommation (supermarchés). L'EAN-8 encode 8 chiffres et est utilisé pour les petits emballages où l'espace est limité. Les deux sont lus par les scanners de caisse standard.",
      },
      {
        q: "Comment exporter un code-barres en SVG ?",
        a: "Sur la page /barcode, générez votre code-barres, puis cliquez sur 'Télécharger SVG'. Le SVG est vectoriel : il peut être agrandi à n'importe quelle taille sans perte de qualité, idéal pour l'impression industrielle. Cette fonctionnalité nécessite le plan Starter ou des crédits.",
      },
      {
        q: "Puis-je exporter un code-barres en PDF ?",
        a: "Oui. Le bouton 'Export PDF' sur la page /barcode génère un PDF à la taille exacte du code-barres, prêt pour l'impression. La résolution est optimisée pour les imprimantes professionnelles. Nécessite le plan Starter ou des crédits.",
      },
      {
        q: "Quelle résolution est recommandée pour imprimer un code-barres ?",
        a: "Pour une impression lisible, utilisez le format SVG (vectoriel, résolution infinie) ou le PNG à l'échelle maximale (scale 8). La taille minimale recommandée est de 25 mm de largeur pour un EAN-13 et une résolution d'impression de 300 DPI minimum.",
      },
      {
        q: "Les codes-barres générés sont-ils homologués pour la vente en grande surface ?",
        a: "Les codes-barres générés respectent les standards GS1 (EAN, ITF-14, SSCC-18…). Pour vendre en grande distribution, vous devez d'abord acheter un préfixe d'entreprise GS1 auprès de l'organisme national compétent, puis entrer votre numéro GTIN dans notre générateur.",
      },
    ],
  },
  {
    id: 'labels',
    icon: '🏷️',
    title: 'Étiquettes',
    color: '#16a34a',
    questions: [
      {
        q: "Combien de gabarits d'étiquettes sont disponibles ?",
        a: "La plateforme propose plus de 31 gabarits répartis en 10 catégories : retail, promo, étagère, multi-info, alimentaire, pharmacie, badge, logistique, luxe et événements. Les gabarits couvrent les formats les plus courants de 58×40 mm à 100×70 mm.",
      },
      {
        q: "Puis-je uploader mon logo sur mes étiquettes ?",
        a: "Oui. Sur la page /labels, un bouton 'Upload logo' vous permet d'intégrer votre image (PNG, SVG, JPG) dans le gabarit. Le logo est redimensionné automatiquement pour s'adapter à l'espace disponible sur l'étiquette.",
      },
      {
        q: "Comment générer des étiquettes en lot depuis un fichier CSV ?",
        a: "Allez sur /labels/batch, sélectionnez votre gabarit, puis importez un fichier CSV avec les colonnes : name, price, sku, subtitle, barcode. La plateforme génère un PDF multi-pages avec toutes vos étiquettes en grille 2 colonnes, prêt à imprimer.",
      },
      {
        q: "Les étiquettes sont-elles compatibles avec les feuilles Avery ?",
        a: "Oui. Les gabarits disponibles correspondent aux formats les plus courants des planches Avery A4. Le PDF généré est dimensionné pour s'imprimer directement sur ces planches sans ajustement de marges.",
      },
      {
        q: "Puis-je personnaliser les couleurs des étiquettes ?",
        a: "Oui. Sur la page /labels, des sélecteurs de couleurs vous permettent de modifier la couleur d'accent (barre colorée, texte prix) et la couleur de fond de l'étiquette, indépendamment du thème de base du gabarit.",
      },
      {
        q: "Comment imprimer mes étiquettes ?",
        a: "Après avoir généré votre PDF, ouvrez-le avec Adobe Acrobat ou votre lecteur PDF habituel. Imprimez en taille réelle (100%), sans adaptation à la page, pour respecter les dimensions exactes des étiquettes. Utilisez du papier adhésif ou des planches Avery.",
      },
      {
        q: "Puis-je sauvegarder une étiquette pour la modifier plus tard ?",
        a: "Oui. Le bouton 'Sauvegarder' sur la page /labels enregistre votre configuration (gabarit, données, couleurs) dans votre compte. Vous retrouverez vos étiquettes sauvegardées dans votre tableau de bord sous la section 'Mes créations'.",
      },
    ],
  },
  {
    id: 'plans',
    icon: '💳',
    title: 'Plans & Tarifs',
    color: '#dc2626',
    questions: [
      {
        q: "Quels sont les plans disponibles ?",
        a: "QR Code Express propose 5 plans : Gratuit (0 FCFA), Starter (4 900 FCFA/mois), Essentiel (9 900 FCFA/mois), Pro (19 900 FCFA/mois) et Business (29 900 FCFA/mois). Chaque plan inclut un nombre croissant de QR codes, de fonctionnalités et de crédits mensuels.",
      },
      {
        q: "Puis-je changer de plan à tout moment ?",
        a: "Oui. Vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre tableau de bord. La facturation est proratisée : si vous upgradez en cours de mois, vous ne payez que la différence pour la période restante.",
      },
      {
        q: "Quelle est la différence entre le plan Starter et Essentiel ?",
        a: "Le plan Starter (4 900 FCFA/mois) donne accès aux QR codes de type vCard Pro, Carte cadeau, Offre d'emploi, aux codes-barres premium de base et à 20 QR codes maximum. L'Essentiel (9 900 FCFA/mois) débloque tous les types QR avancés (Menu, Coupon, Bio Link, Galerie…), 100 QR codes et 20 QR dynamiques.",
      },
      {
        q: "Comment fonctionnent les crédits ?",
        a: "Les crédits sont une monnaie interne permettant d'accéder ponctuellement à des fonctionnalités premium sans abonnement. Par exemple, créer un QR code de type 'Menu' coûte 35 crédits. Les crédits s'achètent en packs depuis /portefeuille et ne nécessitent pas d'abonnement.",
      },
      {
        q: "Les crédits ont-ils une date d'expiration ?",
        a: "Non. Les crédits achetés n'expirent pas. Ils restent disponibles sur votre compte tant que vous êtes inscrit sur la plateforme.",
      },
      {
        q: "Quels moyens de paiement sont acceptés ?",
        a: "La plateforme accepte : Mobile Money (Orange Money, MTN MoMo, Wave, Moov Money) pour l'Afrique de l'Ouest, et les cartes bancaires Visa/Mastercard via Stripe pour le reste du monde. Les paiements sont sécurisés et chiffrés.",
      },
      {
        q: "Existe-t-il un essai gratuit des plans payants ?",
        a: "Le plan Gratuit est permanent et ne nécessite pas de carte bancaire. Il vous donne accès aux fonctionnalités de base sans limite de temps. Pour tester les fonctionnalités premium, vous pouvez acheter un petit pack de crédits (à partir de 500 FCFA) sans vous engager dans un abonnement.",
      },
    ],
  },
  {
    id: 'technical',
    icon: '🔧',
    title: 'Technique & Sécurité',
    color: '#6b7280',
    questions: [
      {
        q: "Quelle est la durée de vie d'un QR code ?",
        a: "Un QR code statique est permanent : une fois imprimé, il fonctionnera indéfiniment (l'information est encodée directement dans le motif). Un QR code dynamique fonctionne tant que votre compte est actif. En cas de clôture de compte, les QR codes dynamiques cesseront de fonctionner après une période de grâce de 90 jours.",
      },
      {
        q: "Les QR codes fonctionnent-ils sur tous les smartphones ?",
        a: "Oui. Les QR codes générés respectent la norme ISO/IEC 18004. Ils sont lisibles par les appareils photo natifs d'iPhone (iOS 11+), Android (Google Lens intégré depuis Android 8) et toutes les applications de scan standard.",
      },
      {
        q: "Comment scanner un QR code sans application dédiée ?",
        a: "Sur iPhone, ouvrez l'application Appareil photo et pointez vers le QR code — une notification apparaît en haut. Sur Android, utilisez l'appareil photo natif ou Google Lens (icône en bas à droite de l'appareil photo). Aucune application tierce n'est nécessaire.",
      },
      {
        q: "Mes données sont-elles protégées ?",
        a: "Oui. Toutes les données sont stockées dans Supabase (infrastructure PostgreSQL hébergée en Europe), chiffrées au repos et en transit (TLS 1.3). Les mots de passe des QR codes sont hashés avec SHA-256. QR Code Express ne revend aucune donnée personnelle à des tiers.",
      },
      {
        q: "Puis-je exporter tous mes QR codes en masse ?",
        a: "L'export en masse individuel (ZIP de tous les QR codes) est en développement et sera disponible prochainement pour les plans Pro et Business. Actuellement, vous pouvez télécharger chaque QR code individuellement depuis votre tableau de bord.",
      },
    ],
  },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border-b border-gray-100 last:border-0 transition-colors ${open ? 'bg-orange-50/40' : ''}`}>
      <button
        className="w-full text-left flex items-center justify-between gap-4 py-4 px-5 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#041B4D] leading-snug">{q}</span>
        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-200 ${open ? 'rotate-45' : ''}`}
          style={{ background: open ? '#FF6A00' : '#e5e7eb', color: open ? 'white' : '#6b7280' }}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const total = CATEGORIES.reduce((s, c) => s + c.questions.length, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#041B4D] text-white py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
              ❓ FAQ — Questions fréquentes
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              {total} réponses à vos questions
            </h1>
            <p className="text-blue-200 text-lg max-w-xl mx-auto">
              Tout ce que vous devez savoir sur QR Code Express — QR codes, codes-barres, étiquettes, plans et sécurité.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {CATEGORIES.map(cat => (
                <a key={cat.id} href={`#${cat.id}`}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
                  {cat.icon} {cat.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Body */}
        <section className="max-w-3xl mx-auto px-4 py-12 space-y-10">
          {CATEGORIES.map(cat => (
            <div key={cat.id} id={cat.id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{cat.icon}</span>
                <h2 className="text-lg font-extrabold text-[#041B4D]">{cat.title}</h2>
                <span className="ml-auto text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {cat.questions.length} questions
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {cat.questions.map((item, i) => (
                  <AccordionItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* CTA bas de page */}
        <section className="bg-white border-t border-gray-100 py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-2xl font-extrabold text-[#041B4D] mb-2">Vous ne trouvez pas votre réponse ?</p>
            <p className="text-gray-500 mb-6 text-sm">Notre équipe répond généralement en moins de 2 heures via WhatsApp.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/2250778882592"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity"
                style={{ background: '#25d366' }}>
                💬 Contacter le support WhatsApp
              </a>
              <Link href="/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                📱 Créer mon premier QR code
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
