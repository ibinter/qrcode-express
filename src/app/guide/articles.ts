export interface Article {
  slug: string
  title: string
  description: string
  category: string
  icon: string
  readTime: string
  content: Section[]
}

export interface Section {
  type: 'intro' | 'steps' | 'tip' | 'warning' | 'faq' | 'cta'
  title?: string
  text?: string
  items?: string[]
  pairs?: { q: string; a: string }[]
  href?: string
  label?: string
}

export const CATEGORIES = [
  { slug: 'demarrage', label: 'Démarrage', icon: '🚀' },
  { slug: 'qr-codes', label: 'QR codes', icon: '📱' },
  { slug: 'dynamique', label: 'QR Dynamique', icon: '⚡' },
  { slug: 'codes-barres', label: 'Codes-barres', icon: '📊' },
  { slug: 'etiquettes', label: 'Étiquettes', icon: '🏷️' },
  { slug: 'impression', label: 'Impression', icon: '🖨️' },
  { slug: 'plans', label: 'Plans & Crédits', icon: '💳' },
  { slug: 'parrainage', label: 'Parrainage', icon: '🎁' },
  { slug: 'organisations', label: 'Organisations', icon: '🏢' },
  { slug: 'i18n', label: 'Multilingue', icon: '🌍' },
  { slug: 'compte', label: 'Mon compte', icon: '👤' },
]

export const ARTICLES: Article[] = [
  // DÉMARRAGE
  {
    slug: 'creer-premier-qr',
    title: 'Créer votre premier QR code',
    description: 'Guide pas-à-pas pour créer et télécharger votre premier QR code en moins de 2 minutes.',
    category: 'demarrage',
    icon: '🚀',
    readTime: '2 min',
    content: [
      {
        type: 'intro',
        text: 'QR CODE EXPRESS vous permet de créer un QR code gratuitement, sans inscription, en quelques secondes. Voici comment procéder.',
      },
      {
        type: 'steps',
        title: 'Étapes',
        items: [
          'Rendez-vous sur la page d\'accueil et descendez jusqu\'au générateur.',
          'Choisissez le type de QR code (URL, WhatsApp, vCard, WiFi…).',
          'Remplissez les informations demandées (URL, numéro, texte…).',
          'Personnalisez les couleurs et le style si vous le souhaitez.',
          'Cliquez sur "Télécharger PNG" pour récupérer votre QR code.',
          '(Optionnel) Créez un compte pour sauvegarder votre QR et accéder aux statistiques.',
        ],
      },
      {
        type: 'tip',
        title: 'Conseil',
        text: 'Testez votre QR code avec votre smartphone avant de l\'imprimer. Scannez-le avec l\'appareil photo natif ou une app de scan.',
      },
      {
        type: 'cta',
        label: 'Créer mon QR code →',
        href: '/#generateur',
      },
    ],
  },
  {
    slug: 'creer-compte',
    title: 'Créer un compte et ses avantages',
    description: 'Pourquoi créer un compte et comment en profiter au maximum.',
    category: 'demarrage',
    icon: '👤',
    readTime: '2 min',
    content: [
      {
        type: 'intro',
        text: 'Un compte gratuit vous donne accès à des fonctionnalités essentielles : sauvegarde de vos QR codes, statistiques de scans, et gestion centralisée.',
      },
      {
        type: 'steps',
        title: 'Créer votre compte',
        items: [
          'Cliquez sur "Se connecter" en haut à droite.',
          'Choisissez "Créer un compte".',
          'Inscrivez-vous avec Google (recommandé) ou votre email.',
          'Confirmez votre email si vous avez choisi l\'inscription classique.',
          'Vous êtes redirigé vers votre tableau de bord.',
        ],
      },
      {
        type: 'faq',
        pairs: [
          { q: 'Combien de QR codes puis-je créer gratuitement ?', a: 'Le plan gratuit permet de créer jusqu\'à 5 QR codes sauvegardés.' },
          { q: 'Est-ce que mes QR codes expirent ?', a: 'Non. Vos QR codes statiques sont permanents. Les QR dynamiques sont actifs tant que votre compte est actif.' },
        ],
      },
      {
        type: 'cta',
        label: 'Créer mon compte →',
        href: '/inscription',
      },
    ],
  },
  {
    slug: 'tableau-de-bord',
    title: 'Comprendre le tableau de bord',
    description: 'Tour complet du dashboard : QR codes, statistiques, sidebar et navigation.',
    category: 'demarrage',
    icon: '📊',
    readTime: '3 min',
    content: [
      {
        type: 'intro',
        text: 'Votre tableau de bord centralise tous vos QR codes, vos statistiques de scans et vos paramètres de compte.',
      },
      {
        type: 'steps',
        title: 'Les sections principales',
        items: [
          'Sidebar gauche (PC) : navigation rapide entre vos QR, outils et compte. Réductible avec Ctrl+B.',
          'KPI cards : total QR actifs, scans aujourd\'hui, scans 7 jours, QR dynamiques.',
          'Graphique 7 jours : évolution de vos scans sur la semaine.',
          'Top QR codes : vos 3 QR les plus scannés.',
          'Activité récente : derniers scans avec pays et type d\'appareil.',
          'Liste complète : recherche, filtres, tri, vue grille ou liste.',
        ],
      },
      {
        type: 'tip',
        title: 'Navigation rapide',
        text: 'Utilisez Ctrl+B pour réduire/ouvrir la sidebar. Sur mobile, naviguez via le menu hamburger en haut.',
      },
    ],
  },

  // QR CODES
  {
    slug: 'types-qr-codes',
    title: 'Les types de QR codes disponibles',
    description: 'URL, WhatsApp, vCard, WiFi, PDF, menu restaurant… Découvrez tous les types supportés.',
    category: 'qr-codes',
    icon: '📋',
    readTime: '4 min',
    content: [
      {
        type: 'intro',
        text: 'QR CODE EXPRESS supporte plus de 20 types de QR codes, chacun adapté à un usage spécifique.',
      },
      {
        type: 'steps',
        title: 'Types disponibles',
        items: [
          '🔗 URL — Lien vers n\'importe quel site web',
          '💬 WhatsApp — Ouvre une conversation WhatsApp directement',
          '👤 vCard — Carte de visite numérique (nom, téléphone, email)',
          '🪪 vCard+ — Carte de visite avancée avec réseaux sociaux',
          '📶 WiFi — Connexion automatique au réseau sans saisir le mot de passe',
          '📝 Texte — Affiche un message texte libre',
          '✉️ Email — Pré-remplit un email avec destinataire et sujet',
          '📞 Téléphone — Appel direct en un scan',
          '💬 SMS — Pré-remplit un SMS',
          '📄 PDF — Lien vers un document PDF',
          '📲 App — Lien vers une app (App Store / Google Play)',
          '📅 Événement — Ajoute un événement au calendrier',
          '🍽️ Menu restaurant — Menu digital interactif',
          '🎫 Coupon — Bon de réduction avec code',
          '🔗 Biolink — Page liens multiples (comme Linktree)',
          '📱 Réseaux sociaux — Liens vers vos profils sociaux',
          '📍 Localisation — Coordonnées GPS ou adresse',
          '🛍️ Catalogue — Galerie produits cliquables',
          '⭐ Avis Google — Lien direct vers votre fiche Google',
          '📋 Lead capture — Formulaire de collecte de contacts',
          '💳 Paiement — Lien de paiement',
        ],
      },
      {
        type: 'tip',
        title: 'Quel type choisir ?',
        text: 'Pour un usage professionnel et modifiable dans le temps, préférez les QR dynamiques. Pour un contenu fixe (WiFi, vCard), le QR statique suffit.',
      },
    ],
  },
  {
    slug: 'personnaliser-qr',
    title: 'Personnaliser l\'apparence de votre QR',
    description: 'Couleurs, logo, style de modules, cadre — toutes les options de design.',
    category: 'qr-codes',
    icon: '🎨',
    readTime: '3 min',
    content: [
      {
        type: 'intro',
        text: 'Un QR code peut être entièrement personnalisé pour correspondre à votre identité visuelle tout en restant scannable.',
      },
      {
        type: 'steps',
        title: 'Options de personnalisation',
        items: [
          'Couleur des modules : choisissez la couleur des "pixels" du QR.',
          'Couleur de fond : fond blanc recommandé, mais personnalisable.',
          'Style des modules : carrés, arrondis, points, formes spéciales.',
          'Logo central : ajoutez votre logo au centre du QR (plan Pro+).',
          'Cadre et texte : ajoutez un appel à l\'action ("Scannez-moi !") autour du QR.',
          'Taille de sortie : PNG jusqu\'à 2048px (4K), SVG vectoriel illimité, PDF A4 pour imprimeurs.',
        ],
      },
      {
        type: 'warning',
        title: 'Important',
        text: 'Conservez toujours un fort contraste (module sombre sur fond clair). Un QR trop coloré ou avec un logo trop grand peut ne pas être scannable.',
      },
    ],
  },
  {
    slug: 'modifier-supprimer-qr',
    title: 'Modifier, mettre en pause ou supprimer un QR',
    description: 'Gérez vos QR codes : modification du contenu, mise en pause temporaire, suppression.',
    category: 'qr-codes',
    icon: '✏️',
    readTime: '2 min',
    content: [
      {
        type: 'intro',
        text: 'Depuis votre dashboard, vous pouvez gérer chaque QR code individuellement.',
      },
      {
        type: 'steps',
        title: 'Actions disponibles',
        items: [
          'Modifier : cliquez sur l\'icône crayon pour changer le contenu ou le design.',
          'Mettre en pause : le QR affichera une page "QR en pause" au lieu de la destination.',
          'Réactiver : remettez en route un QR mis en pause en un clic.',
          'Copier le lien : copiez l\'URL de votre QR dynamique.',
          'Télécharger PNG : export rapide en PNG jusqu\'à 2048px (4K).',
          'Télécharger SVG : vectoriel, qualité infinie, idéal pour l\'impression (plan Essentiel+).',
          'Télécharger PDF : prêt pour l\'imprimerie au format A4 (plan Pro+).',
          'Supprimer : supprimez définitivement le QR (irréversible).',
        ],
      },
      {
        type: 'tip',
        title: 'Mise en pause vs Suppression',
        text: 'Préférez la mise en pause à la suppression si vous voulez garder les statistiques et pouvoir réactiver le QR plus tard.',
      },
    ],
  },

  // QR DYNAMIQUE
  {
    slug: 'qr-statique-vs-dynamique',
    title: 'QR statique vs QR dynamique',
    description: 'Comprendre la différence et choisir le bon type selon votre usage.',
    category: 'dynamique',
    icon: '⚡',
    readTime: '3 min',
    content: [
      {
        type: 'intro',
        text: 'Il existe deux grands types de QR codes : statique (le contenu est gravé dans le QR) et dynamique (le QR pointe vers un lien court modifiable).',
      },
      {
        type: 'steps',
        title: 'QR Statique',
        items: [
          'Le contenu est encodé directement dans les pixels du QR.',
          'Impossible de modifier après impression.',
          'Pas de statistiques de scans.',
          'Fonctionne sans connexion internet (sauf si le contenu est une URL).',
          'Idéal pour : WiFi, vCard simple, texte fixe.',
        ],
      },
      {
        type: 'steps',
        title: 'QR Dynamique',
        items: [
          'Le QR pointe vers un lien court (qrcode-express.com/r/xxxxx).',
          'La destination peut être modifiée à tout moment sans réimprimer.',
          'Statistiques complètes : scans, pays, appareils, date.',
          'Mise en pause possible.',
          'Règles de redirection conditionnelle (par heure, appareil, pays).',
          'Idéal pour : menus, flyers, affiches, promotions.',
        ],
      },
      {
        type: 'faq',
        pairs: [
          { q: 'Un QR dynamique peut-il devenir statique ?', a: 'Non. Une fois créé en mode dynamique, il reste dynamique. Vous pouvez créer un nouveau QR statique séparément.' },
          { q: 'Combien de redirections par mois ?', a: 'Illimitées sur tous les plans. Seul le nombre de QR codes créés est limité selon le plan.' },
        ],
      },
    ],
  },
  {
    slug: 'statistiques-scans',
    title: 'Consulter les statistiques de scans',
    description: 'Analysez vos scans : pays, appareils, heures, évolution dans le temps.',
    category: 'dynamique',
    icon: '📊',
    readTime: '3 min',
    content: [
      {
        type: 'intro',
        text: 'Chaque QR dynamique dispose d\'une page analytique dédiée accessible depuis votre dashboard.',
      },
      {
        type: 'steps',
        title: 'Accéder aux statistiques',
        items: [
          'Depuis le dashboard, cliquez sur un QR code.',
          'Ou cliquez sur l\'icône graphique dans la liste.',
          'La page analytique affiche : total scans, scans par jour, pays, appareils.',
          'Filtrez par période : 7 jours, 30 jours, 90 jours, tout.',
        ],
      },
      {
        type: 'steps',
        title: 'Données disponibles',
        items: [
          'Scans totaux et par période',
          'Répartition par pays (carte interactive)',
          'Type d\'appareil : mobile, tablette, desktop',
          'Système d\'exploitation : iOS, Android, Windows…',
          'Horaires de pointe (heure de scan)',
          'Évolution dans le temps (graphique)',
        ],
      },
    ],
  },

  // CODES-BARRES
  {
    slug: 'creer-code-barres',
    title: 'Créer un code-barres',
    description: 'EAN-13, Code 128, QR, Data Matrix, PDF417 — générez et téléchargez en PNG ou SVG vectoriel.',
    category: 'codes-barres',
    icon: '📊',
    readTime: '3 min',
    content: [
      {
        type: 'intro',
        text: 'QR CODE EXPRESS propose un générateur de codes-barres complet, compatible avec tous les formats industriels. Téléchargez en PNG pour le web ou en SVG vectoriel pour l\'impression professionnelle.',
      },
      {
        type: 'steps',
        title: 'Types de codes-barres disponibles',
        items: [
          '📦 EAN-13 — Code universel pour produits en supermarché (13 chiffres)',
          '📦 EAN-8 — Version courte pour petits emballages (8 chiffres)',
          '🇺🇸 UPC-A — Standard américain (12 chiffres)',
          '📬 Code 128 — Logistique, colis, inventaire (texte libre)',
          '🔧 Code 39 — Industrie, inventaire (caractères alphanumériques)',
          '📦 ITF-14 — Cartons et palettes (14 chiffres)',
          '💊 Data Matrix — Pharma, composants électroniques (petit format)',
          '🎫 PDF417 — Billets, cartes d\'identité, documents',
          '📱 QR Code — Universel (liens, texte, contacts)',
          '🚌 Aztec — Transport, billetterie (compact)',
        ],
      },
      {
        type: 'steps',
        title: 'Générer votre code-barres',
        items: [
          'Depuis la sidebar, cliquez sur "Codes-barres".',
          'Choisissez le type de code (EAN-13, Code 128, etc.).',
          'Saisissez le contenu (numéro produit, texte, URL).',
          'Personnalisez les couleurs, la hauteur et la résolution.',
          'Aperçu en temps réel dans le panneau droit.',
          'Téléchargez en PNG (web/écran) ou SVG (impression pro).',
          'Optionnel : sauvegardez dans votre compte pour y revenir.',
        ],
      },
      {
        type: 'tip',
        title: 'PNG vs SVG',
        text: 'Le PNG ×3–6 est idéal pour le web et les petits formats. Le SVG est vectoriel (sans perte de qualité) : utilisez-le pour l\'impression professionnelle, grands formats, packaging.',
      },
      {
        type: 'faq',
        pairs: [
          { q: 'Puis-je générer des centaines de codes d\'un coup ?', a: 'Oui. Utilisez la fonctionnalité Import CSV dans "Codes-barres > Import CSV". Téléchargez un fichier CSV avec vos données et recevez un ZIP de tous vos codes-barres PNG.' },
          { q: 'Quel type pour un produit vendu en supermarché ?', a: 'EAN-13 (international) ou UPC-A (marché américain). Ces codes nécessitent un numéro officiel GS1 si vous distribuez en grande surface.' },
          { q: 'Quel type pour mon inventaire interne ?', a: 'Code 128 (logistique) ou Code 39 (industrie). Ces formats acceptent du texte libre — pas besoin de numéro officiel.' },
        ],
      },
      {
        type: 'cta',
        label: 'Créer mon code-barres →',
        href: '/barcode',
      },
    ],
  },
  {
    slug: 'codes-barres-en-masse',
    title: 'Générer des codes-barres en masse (CSV)',
    description: 'Importez un fichier CSV pour générer des centaines de codes-barres en un clic — téléchargement en ZIP.',
    category: 'codes-barres',
    icon: '📋',
    readTime: '2 min',
    content: [
      {
        type: 'intro',
        text: 'La fonctionnalité Import CSV permet de générer jusqu\'à 500 codes-barres en une seule opération. Idéal pour les commerçants, responsables logistique et gestionnaires de stock.',
      },
      {
        type: 'steps',
        title: 'Étapes',
        items: [
          'Depuis /barcode, cliquez sur "Import CSV en masse" en haut à droite.',
          'Préparez un fichier CSV avec au minimum une colonne "text".',
          'Colonne optionnelle "name" pour nommer chaque fichier PNG.',
          'Uploadez votre CSV ou collez son contenu directement.',
          'Choisissez le type de code-barres, les couleurs et la résolution.',
          'Cliquez "Générer" — une barre de progression apparaît.',
          'Téléchargement automatique d\'un ZIP avec tous vos PNG nommés.',
        ],
      },
      {
        type: 'tip',
        title: 'Format CSV',
        text: 'Deux colonnes : text (le contenu du code, requis) et name (le nom du fichier PNG, optionnel). Téléchargez le modèle CSV depuis la page pour démarrer rapidement.',
      },
      {
        type: 'warning',
        title: 'Limite recommandée',
        text: 'Pour des performances optimales, limitez vos batches à 500 codes-barres par import. Au-delà, découpez en plusieurs fichiers.',
      },
      {
        type: 'cta',
        label: 'Générer en masse →',
        href: '/barcode/batch',
      },
    ],
  },

  // ÉTIQUETTES
  {
    slug: 'creer-etiquette',
    title: 'Créer des étiquettes imprimables',
    description: '31 gabarits · 10 catégories : commerce, pharmacie, logistique, luxe, feuilles A4 Avery — export PDF prêt à imprimer.',
    category: 'etiquettes',
    icon: '🏷️',
    readTime: '3 min',
    content: [
      {
        type: 'intro',
        text: 'QR CODE EXPRESS propose 31 gabarits d\'étiquettes dans 10 catégories métier. Générez des PDF professionnels avec code-barres intégré, logo et mise en page adaptée à votre secteur.',
      },
      {
        type: 'steps',
        title: 'Les 10 catégories de gabarits',
        items: [
          '🛒 Commerce & Distribution — étiquettes prix, rayonnage, promotions',
          '💊 Pharmacie & Santé — médicaments, flacons, dispositifs médicaux',
          '🚚 Logistique & Transport — colis, palettes, expéditions',
          '✨ Luxe & Bijoux — haute couture, parfums, joaillerie',
          '🍽️ Alimentation & Restauration — ingrédients, dates limite, menus',
          '🏭 Industrie & Fabrication — composants, maintenance, traçabilité',
          '🖥️ Informatique & Électronique — asset management, référencement',
          '📅 Événements & Badges — conférences, salons, passes VIP',
          '📦 E-commerce — envois, retours, codes de réduction',
          '📄 Feuilles A4 Avery — 24 étiquettes 63.5×33.9 mm, compatibles L7160',
        ],
      },
      {
        type: 'steps',
        title: 'Créer votre étiquette',
        items: [
          'Depuis la sidebar, cliquez sur "Étiquettes".',
          'Choisissez votre gabarit.',
          'Remplissez les champs : nom, prix, référence, code-barres.',
          'Uploadez votre logo (PNG/JPG/SVG) — apparaît dans l\'étiquette.',
          'Aperçu en temps réel avec le thème coloré du gabarit.',
          'Ajustez le nombre de copies ou utilisez la feuille A4 (24 étiquettes).',
          'Cliquez "Télécharger PDF" — imprimez directement.',
        ],
      },
      {
        type: 'tip',
        title: 'Impression parfaite',
        text: 'Toujours imprimer à 100% (taille réelle). Désactivez "Ajuster à la page" dans votre imprimante. Pour la feuille A4, utilisez du papier autocollant Avery L7160.',
      },
      {
        type: 'faq',
        pairs: [
          { q: 'Puis-je mettre mon logo sur l\'étiquette ?', a: 'Oui. Uploadez votre logo (PNG transparent recommandé) dans le champ "Logo / image". Il s\'intègre automatiquement dans l\'aperçu et dans le PDF.' },
          { q: 'Quelle imprimante pour les petits formats ?', a: 'Pour les étiquettes 58×40mm et 70×35mm, une imprimante thermique (Zebra, Dymo, Niimbot) est recommandée. Pour les feuilles A4, n\'importe quelle imprimante laser ou jet d\'encre.' },
          { q: 'Le code-barres est-il scannable dans le PDF ?', a: 'Oui. Le code-barres est généré en haute résolution et intégré au PDF. Il est scannable par tous les lecteurs de codes-barres standard.' },
        ],
      },
      {
        type: 'cta',
        label: 'Créer mes étiquettes →',
        href: '/labels',
      },
    ],
  },

  // IMPRESSION
  {
    slug: 'guide-impression',
    title: 'Guide d\'impression QR codes',
    description: 'Tailles recommandées, formats, résolution et supports d\'impression.',
    category: 'impression',
    icon: '🖨️',
    readTime: '3 min',
    content: [
      {
        type: 'intro',
        text: 'Un QR code imprimé doit respecter certaines règles pour être facilement scannable dans toutes les conditions.',
      },
      {
        type: 'steps',
        title: 'Tailles recommandées',
        items: [
          'Flyer A5 / carte de visite : minimum 2 × 2 cm, idéal 3 × 3 cm',
          'Affiche A4 : 4 × 4 cm minimum',
          'Affiche A3 / Roll-up : 6 × 6 cm ou plus',
          'Vitrine / façade : 10 × 10 cm et plus',
          'Distance de scan ≈ 10× la taille du QR (ex: 3 cm → scannable à 30 cm)',
        ],
      },
      {
        type: 'steps',
        title: 'Formats d\'export',
        items: [
          'PNG (tous les plans) : jusqu\'à 2048px (4K) — parfait pour impression jusqu\'à A3.',
          'SVG (plan Essentiel+) : vectoriel, qualité infinie, idéal pour grands formats.',
          'PDF (plan Pro+) : document A4 prêt à envoyer à l\'imprimerie.',
        ],
      },
      {
        type: 'warning',
        title: 'À éviter',
        text: 'Ne jamais imprimer un QR code sur fond brillant (reflets), ne pas le coller sur une surface courbée, et toujours laisser une marge blanche (quiet zone) d\'au moins 4 modules autour du QR.',
      },
    ],
  },

  // PLANS & CRÉDITS
  {
    slug: 'plans-tarifs',
    title: 'Comprendre les plans et tarifs',
    description: 'Différences entre les plans Gratuit, Starter, Essentiel, Pro et Business — QR codes, codes-barres, étiquettes.',
    category: 'plans',
    icon: '🏷️',
    readTime: '3 min',
    content: [
      {
        type: 'intro',
        text: 'QR CODE EXPRESS propose 5 plans adaptés à chaque usage. Tous incluent le générateur de QR codes, de codes-barres et d\'étiquettes PDF.',
      },
      {
        type: 'steps',
        title: 'Les plans disponibles',
        items: [
          '🆓 Gratuit — 0 FCFA/mois : 5 QR, PNG uniquement, 2 formats codes-barres, statistiques basiques',
          '🚀 Starter — 4 900 FCFA/mois : 20 QR, SVG, 10 formats codes-barres, 10 gabarits étiquettes',
          '✅ Essentiel — 9 900 FCFA/mois : 100 QR, export SVG/PDF, 26 formats codes-barres, 20 gabarits (10 catégories)',
          '⚡ Pro — 19 900 FCFA/mois : QR illimités, logo dans le QR, 31 gabarits · 10 catégories, règles de redirection',
          '🏢 Business — 29 900 FCFA/mois : Multi-utilisateurs, organisations, étiquettes custom, support prioritaire',
        ],
      },
      {
        type: 'faq',
        pairs: [
          { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui. Vous pouvez upgrader depuis la page Tarifs. Le changement est immédiat, payable par Wave, Orange Money ou MTN MoMo.' },
          { q: 'Y a-t-il un engagement ?', a: 'Non, sans engagement. Choisissez mensuel, semestriel (1 mois offert) ou annuel (2 mois offerts).' },
          { q: 'Que se passe-t-il si je dépasse ma limite de QR codes ?', a: 'Vous ne pourrez pas créer de nouveaux QR codes jusqu\'à ce que vous supprimiez des anciens ou passiez à un plan supérieur.' },
        ],
      },
      {
        type: 'cta',
        label: 'Voir les tarifs →',
        href: '/tarifs',
      },
    ],
  },
  {
    slug: 'credits',
    title: 'Les crédits : comment ça marche ?',
    description: 'Utilisation des crédits, comment en obtenir et les dépenser.',
    category: 'plans',
    icon: '💰',
    readTime: '2 min',
    content: [
      {
        type: 'intro',
        text: 'Les crédits sont la monnaie interne de QR CODE EXPRESS. Ils permettent d\'accéder à des fonctionnalités premium ponctuelles sans changer de plan.',
      },
      {
        type: 'steps',
        title: 'Comment obtenir des crédits',
        items: [
          'Inscription : 0 crédits offerts sur le plan gratuit',
          'Parrainage : gagnez 50 crédits par ami parrainé confirmé',
          'Bienvenue (parrainé) : recevez 20 crédits à l\'activation',
          'Achat : rechargez depuis la page Portefeuille',
          'Promotions et événements spéciaux',
        ],
      },
      {
        type: 'steps',
        title: 'Comment utiliser vos crédits',
        items: [
          'Créer un QR code au-delà de votre limite de plan',
          'Accéder à des templates de design premium',
          'Exporter en formats avancés (SVG, PDF) sur plan gratuit',
          'Fonctionnalités IA de génération de contenu',
        ],
      },
      {
        type: 'cta',
        label: 'Recharger mes crédits →',
        href: '/portefeuille',
      },
    ],
  },

  // PARRAINAGE
  {
    slug: 'systeme-parrainage',
    title: 'Le système de parrainage',
    description: 'Comment fonctionne le parrainage, combien gagner et comment partager votre lien.',
    category: 'parrainage',
    icon: '🎁',
    readTime: '2 min',
    content: [
      {
        type: 'intro',
        text: 'Le parrainage vous permet de gagner des crédits en invitant vos amis à rejoindre QR CODE EXPRESS.',
      },
      {
        type: 'steps',
        title: 'Comment ça marche',
        items: [
          'Rendez-vous sur la page Parrainage depuis votre dashboard.',
          'Copiez votre lien unique ou partagez via WhatsApp / Email / SMS / Twitter.',
          'Scannez votre QR code de parrainage pour partager encore plus facilement.',
          'Votre ami s\'inscrit avec votre lien.',
          'Il confirme son email → vous recevez une notification par email + 50 crédits, lui reçoit 20 crédits.',
          'Vous pouvez parrainer autant d\'amis que vous voulez. Des paliers de récompense débloquent des crédits bonus.',
        ],
      },
      {
        type: 'faq',
        pairs: [
          { q: 'Quand sont crédités les crédits de parrainage ?', a: 'Dès que votre filleul confirme son adresse email et active son compte.' },
          { q: 'Y a-t-il une limite au nombre de parrainages ?', a: 'Non, il n\'y a aucune limite. Chaque parrainage confirmé vous rapporte 50 crédits.' },
          { q: 'Puis-je me parrainer moi-même ?', a: 'Non, le système empêche de s\'auto-parrainer.' },
        ],
      },
      {
        type: 'cta',
        label: 'Ma page parrainage →',
        href: '/parrainage',
      },
    ],
  },

  // ORGANISATIONS
  {
    slug: 'creer-organisation',
    title: 'Créer et gérer une organisation',
    description: 'Travaillez en équipe sur des QR codes partagés avec le système d\'organisations.',
    category: 'organisations',
    icon: '🏢',
    readTime: '3 min',
    content: [
      {
        type: 'intro',
        text: 'Les organisations permettent de partager des QR codes et des statistiques avec une équipe. Disponible dès le plan Business.',
      },
      {
        type: 'steps',
        title: 'Créer une organisation',
        items: [
          'Depuis la sidebar, cliquez sur "Organisations".',
          'Cliquez sur "Nouvelle organisation".',
          'Donnez un nom et un logo à votre organisation.',
          'Invitez des membres par email.',
          'Définissez les rôles : Admin, Éditeur, Lecteur.',
        ],
      },
      {
        type: 'steps',
        title: 'Rôles et permissions',
        items: [
          'Propriétaire : accès complet, peut supprimer l\'org',
          'Admin : gestion des membres et des QR',
          'Éditeur : création et modification de QR',
          'Contrôleur : accès aux statistiques uniquement',
          'Lecteur : consultation uniquement',
        ],
      },
      {
        type: 'tip',
        title: 'Conseil',
        text: 'Créez une organisation même si vous êtes seul pour séparer vos QR professionnels de vos QR personnels.',
      },
    ],
  },

  // MULTILINGUE
  {
    slug: 'pages-multilingues',
    title: 'Pages publiques multilingues (fr / en / ar / pt)',
    description: 'Vos pages vCard, menu, coupon et formulaire s\'affichent dans la langue du visiteur. Support arabe RTL et portugais.',
    category: 'i18n',
    icon: '🌍',
    readTime: '2 min',
    content: [
      {
        type: 'intro',
        text: 'QR CODE EXPRESS détecte automatiquement la langue du navigateur de vos visiteurs et affiche vos pages publiques dans leur langue. Quatre langues sont supportées : français, anglais, arabe et portugais.',
      },
      {
        type: 'steps',
        title: 'Pages concernées',
        items: [
          'vCard et vCard+ — Appel, email, WhatsApp, téléchargement du contact',
          'Menu restaurant — Indisponible, commande WhatsApp',
          'Coupon — Code promo, statut de validité',
          'Événement — Date, lieu, prix, capacité',
          'Formulaire de prospects — Bouton d\'envoi',
          'Page d\'avis — Étoiles, commentaire, envoi',
          'Biolink (page liens) — Navigation',
        ],
      },
      {
        type: 'steps',
        title: 'Fonctionnement',
        items: [
          'Le serveur lit l\'en-tête Accept-Language envoyé par le navigateur.',
          'Si la langue principale est l\'arabe → page en arabe + direction RTL (droite à gauche).',
          'Si la langue est l\'anglais → page en anglais.',
          'Si la langue est le portugais → page en portugais (Brésil, Angola, Mozambique…).',
          'Sinon → page en français (langue par défaut).',
          'Aucune action requise de votre part : c\'est automatique.',
        ],
      },
      {
        type: 'tip',
        title: 'Pour vos clients arabophones',
        text: 'Lorsqu\'un visiteur arabophone scanne votre QR, il voit la page entière en arabe avec les textes alignés à droite. Idéal pour les entreprises en Afrique du Nord et au Moyen-Orient.',
      },
      {
        type: 'faq',
        pairs: [
          { q: 'Puis-je forcer une langue spécifique ?', a: 'Non, la langue est détectée automatiquement selon la préférence du navigateur du visiteur. C\'est volontaire pour offrir la meilleure expérience.' },
          { q: 'D\'autres langues seront-elles ajoutées ?', a: 'Oui. Wolof et Haoussa sont en préparation pour mieux servir les marchés d\'Afrique de l\'Ouest.' },
        ],
      },
    ],
  },

  // COMPTE
  {
    slug: 'modifier-profil',
    title: 'Modifier mon profil',
    description: 'Changer votre nom, email, mot de passe et préférences de compte.',
    category: 'compte',
    icon: '✏️',
    readTime: '2 min',
    content: [
      {
        type: 'intro',
        text: 'Vos informations personnelles sont modifiables depuis la page Profil.',
      },
      {
        type: 'steps',
        title: 'Modifier vos informations',
        items: [
          'Dans la sidebar, cliquez sur "Mon profil".',
          'Modifiez votre nom complet, téléphone ou photo.',
          'Cliquez "Enregistrer" pour valider.',
          'Pour changer d\'email ou de mot de passe : utilisez la section Sécurité.',
        ],
      },
      {
        type: 'faq',
        pairs: [
          { q: 'Puis-je supprimer mon compte ?', a: 'Oui. Contactez le support depuis la page Profil avec la demande de suppression. Vos données sont supprimées sous 30 jours.' },
          { q: 'Mon adresse email est-elle visible par d\'autres ?', a: 'Non. Votre email est uniquement utilisé pour l\'authentification et les notifications.' },
        ],
      },
    ],
  },
]

export function getArticlesByCategory(cat: string) {
  return ARTICLES.filter((a) => a.category === cat)
}

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug) ?? null
}
