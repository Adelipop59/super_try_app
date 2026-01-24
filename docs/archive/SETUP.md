# Configuration de l'environnement

## Variables d'environnement requises

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Installation

1. **Installer les dépendances**
   ```bash
   pnpm install
   ```

2. **Configurer les variables d'environnement**
   - Copier les variables ci-dessus dans `.env.local`
   - Remplacer les valeurs de placeholder par vos vraies clés

3. **Lancer le serveur de développement**
   ```bash
   pnpm dev
   ```

4. **Accéder à l'application**
   - Frontend: http://localhost:3001
   - API Backend: http://localhost:3000

## Stripe Setup

1. Créer un compte Stripe (test mode)
2. Obtenir vos clés API dans le dashboard Stripe
3. Configurer le webhook pour recevoir les événements de paiement
   - URL du webhook: `http://localhost:3000/api/v1/stripe/webhook`
   - Événements à écouter: `checkout.session.completed`, `checkout.session.expired`

## Première utilisation

1. Créer un compte utilisateur via `/signup`
2. Se connecter via `/signin`
3. Pour tester les fonctionnalités PRO, passer le rôle à `PRO` dans la base de données

## Troubleshooting

### Erreur de connexion à l'API
- Vérifier que le backend est bien lancé
- Vérifier l'URL de l'API dans `.env.local`

### Erreur Stripe
- Vérifier que les clés API Stripe sont correctes
- Vérifier que vous êtes en mode test

### Erreur d'authentification
- Vider le localStorage
- Se reconnecter

