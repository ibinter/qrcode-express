# QR CODE EXPRESS

**« Vos QR codes en un clic »** — Plateforme QR professionnelle par IBIG SOFT

## Stack

- **Frontend** : Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Base de données / Auth** : Supabase (PostgreSQL + RLS)
- **Génération QR** : qr-code-styling (côté navigateur, sans coût serveur)
- **Paiements** : GeniusPay (Mobile Money + cartes)
- **Déploiement** : Vercel

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# → Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Appliquer le schéma Supabase
# Ouvrir supabase/migrations/001_initial_schema.sql dans l'éditeur SQL Supabase

# 4. Lancer le serveur de développement
npm run dev
```

## Structure

```
src/
├── app/
│   ├── page.tsx              # Page d'accueil + générateur
│   ├── connexion/            # Authentification
│   ├── dashboard/            # Tableau de bord utilisateur
│   ├── r/[slug]/             # Service de redirection QR dynamiques
│   └── api/qr/               # API REST QR codes
├── components/
│   ├── layout/               # Header, Footer
│   ├── home/                 # Hero, Features, Pricing
│   └── qr/                   # Générateur, Preview, Design, Score
├── lib/
│   ├── supabase/             # Clients Supabase (navigateur + serveur)
│   ├── types.ts              # Types TypeScript
│   └── qr-content.ts         # Constructeurs de contenu QR
supabase/
└── migrations/
    └── 001_initial_schema.sql # Schéma complet de la base de données
```

## Feuille de route MVP → V3

Voir `Cahier_des_charges_QR_CODE_EXPRESS_v4.md` pour le détail complet.

| Phase | Statut |
|-------|--------|
| MVP — Générateur + téléchargement PNG gratuit | 🔨 En cours |
| MVP — Portefeuille + paiement GeniusPay | 🔜 À venir |
| V1 — Comptes, QR dynamiques, statistiques | 🔜 À venir |
| V2 — Pages métiers, billetterie, IA | 🔜 À venir |
