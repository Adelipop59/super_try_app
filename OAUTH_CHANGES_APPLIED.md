# Changements OAuth appliqués

## Problème résolu

Supabase ne pouvait pas rediriger vers `http://localhost:3000` (backend) car localhost n'est accessible que depuis votre machine, pas depuis Internet.

## Solution appliquée

Changement du flow OAuth pour rediriger **directement vers le frontend** au lieu du backend.

---

## Changements effectués

### 1. Backend - Redirection OAuth modifiée

**Fichier:** `../super_try_api/src/modules/auth/auth.service.ts` (ligne 547)

**AVANT:**
```typescript
redirectTo: `${process.env.BACKEND_URL}/api/v1/auth/oauth/callback`
```

**APRÈS:**
```typescript
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
redirectTo: `${frontendUrl}/auth/callback`
```

**Effet:** Supabase redirigera maintenant vers `http://localhost:3001/auth/callback` avec les tokens.

---

### 2. Frontend - Gestion des hash fragments

**Fichier:** `app/auth/callback/page.tsx`

**Ajouté:** Support pour les tokens dans le hash fragment (`#access_token=...`) en plus des query parameters (`?access_token=...`)

```typescript
// Si les tokens ne sont pas dans les query params, vérifier le hash fragment
if (!accessToken && window.location.hash) {
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  accessToken = hashParams.get("access_token")
  refreshToken = hashParams.get("refresh_token")
  // ...
}
```

**Pourquoi:** Supabase envoie les tokens dans le hash fragment pour plus de sécurité (les fragments ne sont jamais envoyés au serveur).

---

### 3. Backend - Logs détaillés ajoutés

**Fichier:** `../super_try_api/src/modules/auth/auth.controller.ts`

**Ajouté:** Logs détaillés pour le callback OAuth (au cas où on aurait encore besoin du flow backend)

---

## Nouveau flow OAuth

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clique "Se connecter avec Microsoft"                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend → Backend: GET /api/auth/oauth/microsoft           │
│    Backend génère l'URL Supabase OAuth                          │
│    redirectTo = http://localhost:3001/auth/callback             │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. User est redirigé vers Supabase → Azure/Microsoft           │
│    User s'authentifie avec Microsoft                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Azure → Supabase: Code d'autorisation                       │
│    Supabase échange le code avec Azure                          │
│    Supabase génère access_token et refresh_token                │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Supabase → Frontend: Redirection                            │
│    http://localhost:3001/auth/callback#access_token=xxx&...     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Frontend: Récupère les tokens depuis l'URL                  │
│    - Extrait access_token et refresh_token du hash fragment     │
│    - Stocke les tokens dans localStorage                        │
│    - Appelle /api/auth/me pour récupérer le profil user        │
│    - Redirige vers le dashboard approprié                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Supabase requise

Dans votre dashboard Supabase, **vérifiez** que cette URL est dans les "Redirect URLs" autorisées :

```
http://localhost:3001/auth/callback
```

Pour la production, ajoutez également :
```
https://votre-domaine.com/auth/callback
```

---

## Test du nouveau flow

1. **Ouvrez votre navigateur** avec DevTools (F12) ouvert
2. **Allez sur** http://localhost:3001/signin
3. **Cliquez sur "Se connecter avec Microsoft"**
4. **Authentifiez-vous**
5. **Observez les logs** dans la console :
   - Vous devriez voir `[Auth Callback] Hash fragment params`
   - Puis `[Auth Callback] Tokens received successfully`
   - Puis la redirection vers le dashboard

---

## Avantages de ce changement

✅ **Fonctionne en local** - Plus besoin que Supabase accède à localhost
✅ **Plus simple** - Moins d'intermédiaires
✅ **Plus rapide** - Un redirect de moins
✅ **Standard OAuth 2.0** - C'est la méthode recommandée pour les SPA
✅ **Sécurisé** - Les tokens dans le hash fragment ne sont pas envoyés au serveur
✅ **Compatible production** - Fonctionne aussi bien en prod qu'en local

---

## En cas de problème

Si ça ne fonctionne toujours pas après le test :

1. **Vérifiez les logs du frontend** dans la console
2. **Vérifiez la configuration Supabase** (Redirect URLs)
3. **Vérifiez que `FRONTEND_URL=http://localhost:3001`** dans le backend .env
4. **Redémarrez le backend** si nécessaire

---

## Backend callback conservé (optionnel)

Le code du callback backend (`/api/v1/auth/oauth/callback`) est toujours présent et fonctionnel avec les logs détaillés au cas où vous voudriez l'utiliser en production avec un backend public.

Pour l'activer, il suffirait de rechanger le `redirectTo` dans `auth.service.ts` pour pointer vers le backend au lieu du frontend.
