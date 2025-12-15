# Système de Gestion des Erreurs Global

Ce document décrit le système robuste de gestion des erreurs implémenté dans l'application.

## Architecture

Le système de gestion des erreurs est composé de 3 parties principales :

### 1. **Error Handler Utilities** (`lib/error-handler.ts`)

Classes et fonctions centralisées pour gérer tous les types d'erreurs.

#### Classes d'Erreurs

- **`NetworkError`** : Erreurs de connexion réseau
- **`ValidationError`** : Erreurs de validation de données avec détails par champ

#### Types d'Erreurs

```typescript
type ErrorType =
  | 'NETWORK_ERROR'     // Erreur de connexion
  | 'UNAUTHORIZED'      // Session expirée (401)
  | 'FORBIDDEN'         // Accès refusé (403)
  | 'NOT_FOUND'         // Ressource introuvable (404)
  | 'VALIDATION_ERROR'  // Données invalides (400, 422)
  | 'SERVER_ERROR'      // Erreur serveur (500+)
  | 'UNKNOWN_ERROR'     // Erreur inconnue
```

#### Fonction Principale : `getErrorContext()`

Convertit n'importe quelle erreur en contexte structuré avec :
- **type** : Type d'erreur standardisé
- **message** : Message technique pour le debug
- **userMessage** : Message traduit et convivial pour l'utilisateur
- **statusCode** : Code HTTP si applicable
- **details** : Détails supplémentaires (erreurs de validation, etc.)
- **canRetry** : Indique si l'opération peut être réessayée

#### Mapping des Status Codes

| Status | Type | Message Utilisateur | Retry |
|--------|------|---------------------|-------|
| 400 | VALIDATION_ERROR | Les données fournies sont invalides | ❌ |
| 401 | UNAUTHORIZED | Votre session a expiré | ❌ |
| 403 | FORBIDDEN | Vous n'avez pas les permissions | ❌ |
| 404 | NOT_FOUND | La ressource n'existe pas | ❌ |
| 409 | VALIDATION_ERROR | Conflit avec l'état actuel | ❌ |
| 422 | VALIDATION_ERROR | Les données sont incorrectes | ❌ |
| 429 | SERVER_ERROR | Trop de requêtes | ✅ |
| 500+ | SERVER_ERROR | Erreur serveur | ✅ |

### 2. **API Client Integration** (`lib/api.ts`)

Le client API a été amélioré pour automatiquement :

#### Gestion Automatique des Erreurs

```typescript
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    // Effectuer la requête
    const response = await fetch(...)

    // Gestion automatique du refresh token pour les 401
    if (response.status === 401 && this.refreshToken) {
      // Tenter de rafraîchir le token
      // Réessayer la requête automatiquement
    }

    // Créer une ApiError avec le status code
    if (!response.ok) {
      const apiError = new ApiError(...)
      logError(apiError, `API: ${method} ${endpoint}`)
      throw apiError
    }

    return response.json()
  } catch (error) {
    // Détecter les erreurs réseau
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError(...)
    }

    // Logger et propager
    logError(error, context)
    throw error
  }
}
```

#### Fonctionnalités

- ✅ **Logging automatique** de toutes les erreurs API avec contexte
- ✅ **Détection des erreurs réseau** (fetch failed)
- ✅ **Refresh automatique** du token sur 401
- ✅ **Enrichissement des erreurs** avec statusCode et details

### 3. **React Hook** (`hooks/use-error-handler.ts`)

Hook personnalisé pour gérer les erreurs dans les composants React.

#### Utilisation

```typescript
import { useErrorHandler } from '@/hooks/use-error-handler'

function MyComponent() {
  const { handleError, handleErrorWithRetry } = useErrorHandler()

  const fetchData = async () => {
    try {
      const data = await api.getData()
      setData(data)
    } catch (error) {
      // Option 1: Gestion simple
      handleError(error)

      // Option 2: Avec message personnalisé
      handleError(error, 'Impossible de charger les données.')

      // Option 3: Avec fonction de retry
      handleErrorWithRetry(error, fetchData, 'Erreur lors du chargement.')
    }
  }
}
```

#### Fonctionnalités du Hook

- ✅ **Redirection automatique** vers `/auth/signin` sur erreur 401
- ✅ **Messages utilisateur conviviaux** en français
- ✅ **Support du retry** pour les erreurs temporaires
- ✅ **Logging structuré** dans la console

#### API du Hook

```typescript
{
  // Gérer une erreur avec message optionnel
  handleError: (error: unknown, customMessage?: string) => ErrorContext

  // Gérer avec possibilité de retry
  handleErrorWithRetry: (
    error: unknown,
    retryFn?: () => void | Promise<void>,
    customMessage?: string
  ) => ErrorContext

  // Accès direct à la fonction de contexte
  getErrorContext: (error: unknown) => ErrorContext
}
```

## Exemples d'Utilisation

### Exemple 1: Dashboard avec Retry

```typescript
const { user } = useAuth()
const { handleErrorWithRetry } = useErrorHandler()
const [stats, setStats] = useState(null)

const fetchStats = async () => {
  try {
    const data = await api.getDashboardStats()
    setStats(data)
  } catch (error) {
    handleErrorWithRetry(
      error,
      fetchStats, // Fonction de retry
      'Impossible de charger les statistiques.'
    )
    setStats(defaultStats)
  }
}
```

### Exemple 2: Formulaire avec Validation

```typescript
const { handleError } = useErrorHandler()

const handleSubmit = async (formData) => {
  try {
    await api.createCampaign(formData)
    toast({ title: 'Campagne créée avec succès!' })
  } catch (error) {
    const errorContext = handleError(error, 'Erreur lors de la création.')

    // Afficher les erreurs de validation si disponibles
    if (errorContext.type === 'VALIDATION_ERROR' && errorContext.details) {
      setFormErrors(errorContext.details)
    }
  }
}
```

### Exemple 3: Gestion d'Erreur Réseau

```typescript
const { handleErrorWithRetry } = useErrorHandler()

const syncData = async () => {
  try {
    await api.syncData()
  } catch (error) {
    const errorContext = handleErrorWithRetry(error, syncData)

    if (errorContext.type === 'NETWORK_ERROR') {
      // L'utilisateur sera informé et pourra réessayer
      console.log('Problème de connexion détecté')
    }
  }
}
```

## Logging et Monitoring

### Logs en Développement

Tous les logs sont affichés dans la console avec le format :

```
[Error Handler] {
  title: "Erreur de connexion",
  message: "Impossible de charger les statistiques.",
  details: {
    type: "NETWORK_ERROR",
    userMessage: "Impossible de se connecter...",
    canRetry: true
  }
}
```

### Logs en Production

La fonction `logError()` dans `lib/error-handler.ts` inclut :
- Contexte de l'erreur
- Type et message
- Status code si disponible
- Stack trace pour les erreurs JavaScript
- Timestamp ISO

**TODO**: Intégrer avec un service de monitoring (Sentry, LogRocket, etc.)

```typescript
// Dans lib/error-handler.ts (ligne 202-219)
export const logError = (error: unknown, context?: string) => {
  const errorContext = getErrorContext(error)

  console.error('Error occurred:', {
    context,
    type: errorContext.type,
    message: errorContext.message,
    statusCode: errorContext.statusCode,
    details: errorContext.details,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined
  })

  // TODO: Send to monitoring service
  // if (process.env.NODE_ENV === 'production') {
  //   sendToMonitoring(error, context)
  // }
}
```

## Améliorations Futures

### 1. Toast Notifications

Actuellement, les erreurs sont loggées dans la console. Il faut intégrer un système de toast :

```typescript
// TODO dans use-error-handler.ts
toast({
  title: getErrorTitle(errorContext.type),
  description: errorContext.userMessage,
  variant: 'destructive',
  action: errorContext.canRetry ? {
    label: 'Réessayer',
    onClick: () => retryFn()
  } : undefined
})
```

### 2. Monitoring en Production

Intégrer Sentry ou similaire :

```typescript
// Dans lib/error-handler.ts
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error, {
    tags: { type: errorContext.type },
    extra: errorContext
  })
}
```

### 3. Offline Detection

Détecter quand l'utilisateur est hors ligne :

```typescript
if (!navigator.onLine) {
  return {
    type: 'NETWORK_ERROR',
    message: 'Device is offline',
    userMessage: 'Vous êtes hors ligne. Vérifiez votre connexion.',
    canRetry: true
  }
}
```

### 4. Rate Limiting UI

Pour les erreurs 429, afficher un compte à rebours :

```typescript
if (errorContext.statusCode === 429) {
  const retryAfter = response.headers.get('Retry-After')
  // Afficher "Réessayer dans {retryAfter} secondes"
}
```

## Avantages du Système

✅ **Centralisé** : Une seule source de vérité pour la gestion des erreurs
✅ **Type-safe** : TypeScript garantit la cohérence
✅ **Convivial** : Messages en français adaptés aux utilisateurs
✅ **Debuggable** : Logs structurés avec contexte
✅ **Réutilisable** : Hook simple à utiliser partout
✅ **Robuste** : Gère tous les cas (network, API, validation, etc.)
✅ **Extensible** : Facile d'ajouter de nouveaux types d'erreurs

## Support

Pour toute question sur le système de gestion des erreurs, consulter :
- `lib/error-handler.ts` - Utilitaires centralisés
- `lib/api.ts` - Intégration dans le client API
- `hooks/use-error-handler.ts` - Hook React
- `app/dashboard/page.tsx` - Exemple d'implémentation
