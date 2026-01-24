# Configuration Backend pour l'authentification Microsoft

## Problème identifié

Le frontend tourne sur `localhost:3001` et le backend sur `localhost:3000`. Pour que l'authentification Microsoft fonctionne avec les cookies httpOnly, le backend doit être correctement configuré pour accepter les requêtes cross-origin.

## Variables d'environnement requises (Backend)

Assurez-vous que votre backend a ces variables dans son fichier `.env` :

```env
# URL du frontend (important pour CORS et OAuth redirects)
FRONTEND_URL=http://localhost:3001

# Port du backend
PORT=3000
```

## Configuration CORS (Backend)

Le backend doit être configuré pour :

1. **Accepter les credentials (cookies) depuis localhost:3001**
   ```javascript
   // Exemple avec Express.js
   app.use(cors({
     origin: 'http://localhost:3001',
     credentials: true,
     allowedHeaders: ['Content-Type', 'Authorization']
   }))
   ```

2. **Configurer les cookies avec les bons paramètres**
   ```javascript
   // Lors de la définition des cookies
   res.cookie('access_token', token, {
     httpOnly: true,
     secure: false, // false en dev (localhost), true en prod (HTTPS)
     sameSite: 'lax', // ou 'none' si secure: true
     domain: 'localhost', // Important pour partager entre ports
     path: '/'
   })
   ```

## Configuration OAuth Microsoft (Backend)

Dans votre code backend qui gère l'OAuth Microsoft :

```javascript
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001'

// Redirect après authentification Microsoft
const redirectUrl = `${frontendUrl}/auth/callback`
```

## Endpoint `/auth/store-oauth-tokens` (Backend)

Vérifiez que cet endpoint :

1. Reçoit les tokens depuis le frontend
2. Les stocke dans des cookies httpOnly avec les bons paramètres
3. Retourne un succès

```javascript
app.post('/api/v1/auth/store-oauth-tokens', (req, res) => {
  const { access_token, refresh_token } = req.body

  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: false, // false en dev
    sameSite: 'lax',
    domain: 'localhost',
    path: '/',
    maxAge: 15 * 60 * 1000 // 15 minutes
  })

  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    domain: 'localhost',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
  })

  res.json({ success: true })
})
```

## Vérification

Pour vérifier que tout fonctionne :

1. Démarrez le backend sur le port 3000
2. Démarrez le frontend sur le port 3001
3. Essayez de vous connecter avec Microsoft
4. Vérifiez dans les DevTools du navigateur (onglet Application > Cookies) que les cookies `access_token` et `refresh_token` sont bien définis pour `localhost`
5. Vérifiez que les requêtes à `/api/v1/users/me` incluent ces cookies dans les headers

## En cas de problème persistant

Si l'erreur 401 persiste :

1. Vérifiez les logs du backend lors de l'appel à `/auth/store-oauth-tokens`
2. Vérifiez que les cookies sont bien définis avec `domain: 'localhost'`
3. Vérifiez que le middleware CORS du backend autorise `credentials: true`
4. Vérifiez que le frontend envoie bien `credentials: 'include'` dans toutes ses requêtes (déjà fait)
