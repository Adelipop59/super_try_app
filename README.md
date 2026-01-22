# Super Try App

Application de gestion de campagnes de tests produits pour vendeurs et testeurs.

## 🚀 Démarrage

### Installation

```bash
pnpm install
```

### Développement

```bash
pnpm dev
```

Ouvrez [http://localhost:3001](http://localhost:3001) dans votre navigateur.

## 📁 Structure du projet

```
super_try_app/
├── app/                          # Pages Next.js (App Router)
│   ├── dashboard/               # Pages du dashboard
│   │   ├── campaigns/          # Gestion des campagnes
│   │   ├── products/           # Gestion des produits
│   │   ├── procedures/         # Gestion des procédures
│   │   ├── payments/           # Historique des paiements
│   │   └── settings/           # Paramètres
│   ├── signin/                 # Page de connexion
│   ├── signup/                 # Page d'inscription
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Page d'accueil
│   └── globals.css             # Styles globaux
│
├── components/                  # Composants React réutilisables
│   ├── ui/                     # Composants UI de base (shadcn/ui)
│   ├── app-sidebar.tsx         # Sidebar de l'application
│   ├── campaign-product-config.tsx  # Configuration produit dans campagne
│   ├── campaigns-data-table.tsx     # Table des campagnes
│   ├── products-data-table.tsx      # Table des produits
│   ├── procedures-data-table.tsx    # Table des procédures
│   ├── payment-dialog.tsx      # Modal de paiement Stripe
│   ├── protected-route.tsx     # HOC pour routes protégées
│   └── ...
│
├── contexts/                    # Contextes React
│   └── auth-context.tsx        # Contexte d'authentification
│
├── hooks/                       # Hooks personnalisés
│   └── use-mobile.ts           # Hook pour détecter mobile
│
├── lib/                         # Utilitaires et helpers
│   ├── api.ts                  # Client API et types
│   ├── utils.ts                # Fonctions utilitaires
│   └── data/                   # Données mock
│       └── mock-data.json      # Données de démo
│
├── public/                      # Assets statiques
│   └── favicon.ico
│
├── middleware.ts                # Middleware Next.js (auth)
├── components.json              # Config shadcn/ui
├── tailwind.config.ts           # Configuration Tailwind
├── tsconfig.json                # Configuration TypeScript
└── package.json                 # Dépendances
```

## 🎯 Fonctionnalités

### Pour les vendeurs (PRO)
- ✅ Créer et gérer des campagnes de tests
- ✅ Ajouter des produits au catalogue
- ✅ Définir des procédures de test
- ✅ Gérer les distributions de produits
- ✅ Paiement via Stripe pour activer les campagnes
- ✅ Suivi des transactions
- ✅ Configuration des remboursements et bonus

### Pour les testeurs
- ✅ Consulter les campagnes disponibles
- ✅ S'inscrire aux tests
- ✅ Suivre ses sessions
- ✅ Gérer son profil

## 🛠️ Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **API Client**: Fetch API
- **Paiements**: Stripe
- **Icons**: Lucide React
- **Forms**: React Hook Form (si utilisé)

## 🔐 Authentification

L'application utilise un système d'authentification JWT avec :
- Rôles: `TESTER`, `PRO`, `ADMIN`
- Token stocké dans localStorage
- Middleware pour protection des routes
- Context pour état global de l'authentification

## 💳 Intégration Stripe

- Checkout Session pour les paiements de campagnes
- Redirection vers Stripe pour sécurité maximale
- Gestion des webhooks pour confirmation de paiement
- Historique des transactions dans le dashboard

## 📝 Scripts disponibles

```bash
pnpm dev          # Démarrer le serveur de développement
pnpm build        # Construire pour production
pnpm start        # Démarrer le serveur de production
pnpm lint         # Linter le code
```

## 🌍 Variables d'environnement

Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 📦 Ajout de composants shadcn/ui

```bash
pnpx shadcn@latest add [component-name]
```

## 🤝 Contribution

1. Assurez-vous que le code est propre et bien formaté
2. Suivez la structure des dossiers existante
3. Documentez les nouvelles fonctionnalités

## 📄 License

Propriétaire - Tous droits réservés
