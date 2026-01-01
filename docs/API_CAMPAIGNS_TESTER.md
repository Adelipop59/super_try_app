# API Campagnes - Guide Testeur (USER)

Documentation complète des actions qu'un testeur peut effectuer avec les campagnes de test.

---

## Sommaire

1. [Cycle de vie d'une participation](#cycle-de-vie-dune-participation)
2. [Découvrir les campagnes](#1-découvrir-les-campagnes)
3. [Postuler à une campagne](#2-postuler-à-une-campagne)
4. [Suivi de sa candidature](#3-suivi-de-sa-candidature)
5. [Valider le prix du produit](#4-valider-le-prix-du-produit)
6. [Acheter et soumettre la preuve d'achat](#5-acheter-et-soumettre-la-preuve-dachat)
7. [Compléter les étapes du test](#6-compléter-les-étapes-du-test)
8. [Soumettre le test complété](#7-soumettre-le-test-complété)
9. [Annuler sa participation](#8-annuler-sa-participation)
10. [Créer un litige](#9-créer-un-litige)
11. [Laisser un avis](#10-laisser-un-avis)
12. [Règles métier importantes](#règles-métier-importantes)

---

## Cycle de vie d'une participation

```
PENDING → ACCEPTED → IN_PROGRESS → SUBMITTED → COMPLETED
   ↓          ↓            ↓            ↓
REJECTED  CANCELLED  CANCELLED    DISPUTED
```

1. **PENDING**: Candidature envoyée, en attente d'acceptation par le vendeur
2. **ACCEPTED**: Candidature acceptée par le vendeur, peut acheter le produit
3. **IN_PROGRESS**: Produit acheté, preuve d'achat soumise, test en cours
4. **SUBMITTED**: Test complété et soumis, en attente de validation du vendeur
5. **COMPLETED**: Test validé par le vendeur, récompense versée
6. **REJECTED**: Candidature refusée par le vendeur
7. **CANCELLED**: Participation annulée par le testeur
8. **DISPUTED**: Litige créé, nécessite intervention admin

---

## 1. Découvrir les campagnes

### 1.1. Campagnes éligibles (recommandé)

Liste des campagnes auxquelles vous êtes éligible selon vos critères (âge, localisation, note, etc.)

**Endpoint**: `GET /api/campaigns/eligible`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Query Parameters**:
- `page` (optionnel): Numéro de page (défaut: 1)
- `limit` (optionnel): Résultats par page (défaut: 20, max: 100)

**Réponse (200)**:
```json
{
  "data": [
    {
      "id": "campaign-uuid",
      "title": "Test iPhone 15 Pro",
      "description": "Testez le nouvel iPhone...",
      "status": "ACTIVE",
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-02-01T00:00:00Z",
      "totalSlots": 50,
      "availableSlots": 35,
      "seller": {
        "id": "seller-uuid",
        "firstName": "Jean",
        "lastName": "Dupont",
        "companyName": "TechStore"
      },
      "offers": [
        {
          "id": "offer-uuid",
          "product": {
            "id": "product-uuid",
            "name": "iPhone 15 Pro",
            "description": "...",
            "imageUrl": "https://...",
            "category": {
              "name": "Électronique"
            }
          },
          "expectedPrice": 1199.99,
          "shippingCost": 5.99,
          "bonus": 50.00,
          "reimbursedPrice": true,
          "reimbursedShipping": true,
          "quantity": 1
        }
      ],
      "procedures": [...],
      "distributions": [...]
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Note KYC**: Si votre compte n'est pas vérifié KYC, vous verrez des informations génériques sans détails des produits.

### 1.2. Toutes les campagnes actives (public)

Liste publique des campagnes actives (sans authentification)

**Endpoint**: `GET /api/campaigns`

**Query Parameters**:
- `status` (optionnel): Filtrer par statut (ACTIVE, COMPLETED...)
- `hasAvailableSlots` (optionnel): true/false
- `page`, `limit`: Pagination

**Réponse**: Même structure que `/eligible`

### 1.3. Détails d'une campagne

**Endpoint**: `GET /api/campaigns/:id`

**Réponse (200)**: Détails complets de la campagne

---

## 2. Postuler à une campagne

Envoyez votre candidature pour participer à une campagne.

**Endpoint**: `POST /api/sessions/apply`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Body**:
```json
{
  "campaignId": "campaign-uuid",
  "applicationMessage": "Je suis très intéressé par ce test car..."
}
```

**Réponse (201)**:
```json
{
  "id": "session-uuid",
  "campaignId": "campaign-uuid",
  "testerId": "your-uuid",
  "status": "PENDING",
  "applicationMessage": "Je suis très intéressé...",
  "appliedAt": "2025-01-15T10:00:00Z",
  "scheduledPurchaseDate": "2025-01-20T00:00:00Z",
  "campaign": {...}
}
```

**Erreurs**:
- `400`: Campagne non active, déjà postulé, plus de slots disponibles
- `403`: KYC non vérifié ou non éligible selon les critères
- `404`: Campagne inexistante

**Règles**:
- KYC obligatoire
- Ne peut postuler qu'une fois par campagne
- Doit respecter les critères définis par le vendeur (âge, note, localisation...)
- La campagne doit avoir des slots disponibles

---

## 3. Suivi de sa candidature

### 3.1. Liste de mes sessions

**Endpoint**: `GET /api/sessions`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Query Parameters**:
- `status` (optionnel): PENDING, ACCEPTED, IN_PROGRESS, SUBMITTED, COMPLETED...
- `campaignId` (optionnel): Filtrer par campagne
- `page`, `limit`: Pagination

**Réponse (200)**:
```json
[
  {
    "id": "session-uuid",
    "status": "PENDING",
    "appliedAt": "2025-01-15T10:00:00Z",
    "campaign": {...},
    "scheduledPurchaseDate": "2025-01-20T00:00:00Z"
  }
]
```

### 3.2. Détails d'une session

**Endpoint**: `GET /api/sessions/:id`

**Réponse (200)**: Détails complets de la session, incluant l'historique des étapes

---

## 4. Valider le prix du produit

Avant d'acheter, vous devez valider le prix trouvé du produit.

**Endpoint**: `PATCH /api/sessions/:id/validate-price`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Body**:
```json
{
  "productPrice": 1195.00
}
```

**Réponse (200)**:
```json
{
  "id": "session-uuid",
  "status": "ACCEPTED",
  "validatedProductPrice": 1195.00,
  "priceValidatedAt": "2025-01-20T14:30:00Z",
  ...
}
```

**Règles de validation du prix**:
- Le prix doit être dans une fourchette acceptable autour du `expectedPrice`
- Fourchette: `[prix - 5€, prix + 5€]`
- Si prix < 5€, fourchette: `[0€, 5€]`
- Cette étape est **obligatoire** avant de pouvoir acheter

**Erreurs**:
- `400`: Prix hors fourchette, session pas en statut ACCEPTED
- `403`: Pas le testeur de cette session
- `404`: Session inexistante

---

## 5. Acheter et soumettre la preuve d'achat

Une fois le prix validé, achetez le produit et soumettez votre preuve d'achat.

**Endpoint**: `PATCH /api/sessions/:id/submit-purchase`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Body**:
```json
{
  "purchaseProofUrl": "https://storage.supabase.co/.../proof.jpg",
  "orderNumber": "AMZ-12345-FR",
  "productPrice": 1195.00,
  "shippingCost": 5.99
}
```

**Réponse (200)**:
```json
{
  "id": "session-uuid",
  "status": "IN_PROGRESS",
  "purchaseProofUrl": "https://...",
  "orderNumber": "AMZ-12345-FR",
  "purchasedAt": "2025-01-20T15:00:00Z",
  "productPrice": 1195.00,
  "shippingCost": 5.99,
  ...
}
```

**Règles**:
- Session doit être en statut `ACCEPTED`
- Prix produit doit avoir été validé (étape précédente)
- Preuve d'achat = reçu, confirmation de commande, capture d'écran

**Erreurs**:
- `400`: Statut invalide, prix non validé
- `403`: Pas le testeur de cette session

---

## 6. Compléter les étapes du test

Pendant que vous testez le produit, complétez les étapes définies dans les procédures.

**Endpoint**: `POST /api/sessions/:id/steps/:stepId/complete`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Body**:
```json
{
  "submissionData": {
    "type": "PHOTO",
    "urls": ["https://storage.supabase.co/.../photo1.jpg"],
    "comment": "Photo de déballage"
  }
}
```

**Types d'étapes**:
- `TEXT`: Instructions texte (juste lire)
- `PHOTO`: Soumettre une ou plusieurs photos
- `VIDEO`: Soumettre une vidéo
- `CHECKLIST`: Cocher des items de vérification
- `RATING`: Noter de 1 à 5 étoiles
- `PRICE_VALIDATION`: Étape automatique finale

**Réponse (200)**:
```json
{
  "id": "progress-uuid",
  "sessionId": "session-uuid",
  "stepId": "step-uuid",
  "isCompleted": true,
  "completedAt": "2025-01-22T10:30:00Z",
  "submissionData": {...}
}
```

---

## 7. Soumettre le test complété

Lorsque toutes les étapes sont complétées, soumettez le test final.

**Endpoint**: `PATCH /api/sessions/:id/submit-test`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Body**:
```json
{
  "submissionData": {
    "generalComment": "Test très positif, excellent produit",
    "rating": 5,
    "completedSteps": [
      {
        "stepId": "step-uuid-1",
        "data": {...}
      }
    ]
  }
}
```

**Réponse (200)**:
```json
{
  "id": "session-uuid",
  "status": "SUBMITTED",
  "submittedAt": "2025-01-25T16:00:00Z",
  "submissionData": {...},
  ...
}
```

**Règles**:
- Session doit être en statut `IN_PROGRESS`
- Toutes les étapes obligatoires doivent être complétées
- Le vendeur recevra une notification

**Après soumission**:
- Statut passe à `SUBMITTED`
- Le vendeur valide et note votre test
- Une fois validé: statut `COMPLETED`, récompense versée dans votre wallet

---

## 8. Annuler sa participation

Vous pouvez annuler votre participation à tout moment avant la validation finale.

**Endpoint**: `PATCH /api/sessions/:id/cancel`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Body**:
```json
{
  "cancellationReason": "Je ne peux plus participer pour raisons personnelles"
}
```

**Réponse (200)**:
```json
{
  "id": "session-uuid",
  "status": "CANCELLED",
  "cancelledAt": "2025-01-20T12:00:00Z",
  "cancellationReason": "Je ne peux plus...",
  ...
}
```

**Règles**:
- Possible uniquement si statut: `PENDING`, `ACCEPTED`, `IN_PROGRESS`
- Si déjà acheté (IN_PROGRESS): impact négatif sur votre note et statistiques
- Le slot redevient disponible pour la campagne

**Impact sur votre profil**:
- Incrémente `cancelledSessionsCount`
- Peut affecter votre éligibilité aux futures campagnes
- Réduction possible du taux de complétion

---

## 9. Créer un litige

Si problème avec le vendeur ou la campagne, créez un litige.

**Endpoint**: `PATCH /api/sessions/:id/dispute`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Body**:
```json
{
  "disputeReason": "Le vendeur ne valide pas mon test alors que j'ai tout complété correctement"
}
```

**Réponse (200)**:
```json
{
  "id": "session-uuid",
  "status": "DISPUTED",
  "disputedAt": "2025-01-26T10:00:00Z",
  "disputeReason": "Le vendeur ne valide pas...",
  "disputeDeclaredBy": "your-uuid",
  "isConversationLocked": true,
  ...
}
```

**Règles**:
- Possible à tout moment (sauf si déjà en litige)
- Conversation verrouillée (seul admin peut intervenir)
- Admin sera notifié et interviendra
- Statut passe à `DISPUTED`

**Résolution**:
- Admin rejoint la conversation
- Examine les preuves
- Prend une décision
- Résolution enregistrée dans `disputeResolution`

---

## 10. Laisser un avis

Une fois la session terminée (COMPLETED), laissez un avis sur la campagne/produit.

**Endpoint**: `POST /api/reviews/sessions/:sessionId`

**Headers**:
```
Authorization: Bearer <supabase_token>
```

**Body**:
```json
{
  "rating": 5,
  "comment": "Excellent produit, livraison rapide. Test facile à réaliser.",
  "isPublic": true
}
```

**Réponse (201)**:
```json
{
  "id": "review-uuid",
  "sessionId": "session-uuid",
  "campaignId": "campaign-uuid",
  "productId": "product-uuid",
  "testerId": "your-uuid",
  "rating": 5,
  "comment": "Excellent produit...",
  "isPublic": true,
  "republishProposed": false,
  "republishAccepted": null,
  "createdAt": "2025-01-28T10:00:00Z"
}
```

**Règles**:
- Session doit être en statut `COMPLETED`
- Un seul avis par session
- Note de 1 à 5 étoiles
- Commentaire optionnel
- Peut être public ou privé

**Republication**:
Si le vendeur souhaite republier votre avis sur son site:

**Accepter**: `PATCH /api/reviews/:reviewId/accept-republish`
**Refuser**: `PATCH /api/reviews/:reviewId/decline-republish`

---

## Règles métier importantes

### Vérification KYC

**Obligatoire pour**:
- Postuler à une campagne
- Valider le prix
- Soumettre preuve d'achat
- Soumettre le test

**Comment vérifier votre compte**: Contactez le support ou utilisez le endpoint de vérification Stripe Identity.

### Critères d'éligibilité

Chaque campagne peut définir des critères:

- **Âge**: `minAge`, `maxAge`
- **Note moyenne**: `minRating`, `maxRating`
- **Expérience**: `minCompletedSessions`
- **Genre**: `requiredGender` (M, F, ALL)
- **Localisation**: `requiredCountries`, `requiredLocations`, `excludedLocations`
- **Catégories préférées**: `requiredCategories`
- **Qualité**: `minCompletionRate`, `maxCancellationRate`
- **Ancienneté compte**: `minAccountAge`
- **Activité récente**: `lastActiveWithinDays`
- **Vérification**: `requireVerified`
- **Premium**: `requirePrime`

Si vous ne respectez pas les critères, vous ne verrez pas la campagne dans `/eligible` et ne pourrez pas postuler.

### Calendrier de distribution

Les campagnes définissent des **distributions** qui contrôlent quand les testeurs peuvent candidater:

- **RECURRING**: Jours récurrents (tous les lundis, mercredis...)
- **SPECIFIC_DATE**: Dates spécifiques (3 janvier, 15 février...)

Chaque distribution a un `maxUnits` limitant le nombre de testeurs par jour.

### Remboursements

Chaque offre définit ce qui est remboursé:

- `reimbursedPrice`: Le prix du produit est-il remboursé ?
- `reimbursedShipping`: Les frais de livraison sont-ils remboursés ?
- `maxReimbursedPrice`: Montant max remboursé pour le produit (null = total)
- `maxReimbursedShipping`: Montant max remboursé pour la livraison (null = total)

**Exemple**:
```json
{
  "expectedPrice": 100.00,
  "reimbursedPrice": true,
  "maxReimbursedPrice": 80.00,
  "bonus": 20.00
}
```
→ Produit acheté 95€, remboursé 80€ max, bonus 20€ → Vous gagnez 5€ net (80 + 20 - 95)

### Récompenses (Bonus)

Le bonus est versé dans votre wallet une fois le test validé (statut COMPLETED).

**Wallet**: `GET /api/wallets/my-wallet`
**Retrait**: `POST /api/wallets/withdraw`

Méthodes de retrait:
- Virement bancaire
- Carte cadeau

### Notifications

Vous recevez des notifications pour:
- Candidature acceptée/refusée
- Rappel date d'achat
- Test validé
- Paiement reçu
- Nouveaux messages
- Litiges

**Préférences**: `PATCH /api/notifications/preferences`

### Messagerie

Une conversation s'ouvre automatiquement avec le vendeur dès l'acceptation de votre candidature.

**Envoyer message**: `POST /api/messages`
**Liste messages**: `GET /api/messages/session/:sessionId`
**Marquer lu**: `PATCH /api/messages/:id/read`

### Statistiques de performance

Votre profil contient:
- `averageRating`: Note moyenne (0-5)
- `completedSessionsCount`: Nombre de tests complétés
- `cancelledSessionsCount`: Nombre de sessions annulées
- `totalSessionsCount`: Total de sessions

Ces stats influencent votre éligibilité aux campagnes.

### Prestations supplémentaires (Bonus Tasks)

Après la session COMPLETED, le vendeur peut vous demander des prestations additionnelles payées:
- Photos de déballage
- Vidéos UGC
- Avis sur site externe
- Pourboires

**Accepter/Refuser**: Vous recevez une notification, vous pouvez accepter ou refuser.

### Résumé du parcours testeur

1. ✅ **Compléter KYC** (vérification identité)
2. 🔍 **Découvrir campagnes éligibles** (`GET /campaigns/eligible`)
3. 📝 **Postuler** (`POST /sessions/apply`)
4. ⏳ **Attendre acceptation** (notification reçue)
5. 💰 **Valider prix trouvé** (`PATCH /sessions/:id/validate-price`)
6. 🛒 **Acheter produit** + soumettre preuve (`PATCH /sessions/:id/submit-purchase`)
7. 🧪 **Tester le produit** + compléter étapes
8. 📤 **Soumettre test** (`PATCH /sessions/:id/submit-test`)
9. ⏳ **Attendre validation vendeur** (notification reçue)
10. 💵 **Récompense versée dans wallet** (statut COMPLETED)
11. ⭐ **Laisser avis** (`POST /reviews/sessions/:sessionId`)
12. 💸 **Retirer gains** (`POST /wallets/withdraw`)

---

## Support

En cas de problème:
- Créer un litige: `PATCH /sessions/:id/dispute`
- Contacter le support: `support@super-try.com`
- Consulter l'historique: `GET /sessions/:id`

**Bon test !** 🚀
