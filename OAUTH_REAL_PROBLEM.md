# Le vrai problème OAuth identifié

## Ce qui se passe

D'après vos logs :

### Frontend
✅ Frontend appelle `/api/auth/oauth/microsoft`
✅ Backend génère l'URL : `https://mdihnqriahzlqtrjexuy.supabase.co/auth/v1/authorize?provider=azure&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fv1%2Fauth%2Foauth%2Fcallback`
✅ Vous êtes redirigé vers Microsoft/Azure
✅ Vous vous authentifiez

### Backend (d'après les logs)
✅ Le backend reçoit bien le callback : `GET /api/v1/auth/oauth/callback - 200`

### Navigateur
❌ Vous restez bloqué sur l'URL Supabase d'autorisation au lieu d'être redirigé vers `/auth/callback` avec les tokens

## Le problème

Le backend **reçoit** le callback de Supabase mais il y a **2 problèmes** :

### Problème 1 : Le code du callback est manquant ou invalide

Supabase envoie probablement le callback au backend **SANS** le paramètre `code`, ou avec un code invalide.

D'après le code du backend :
```typescript
if (!code) {
  return res.redirect(`${frontendUrl}/auth/error?error=Code OAuth manquant`);
}
```

Si le `code` est manquant, le backend devrait rediriger vers la page d'erreur, mais vous ne voyez pas cette page.

### Problème 2 : La redirection du backend ne fonctionne pas

Le log montre `200` au lieu de `302` (redirection). Cela signifie que `res.redirect()` ne fonctionne pas correctement.

## Solution

Nous devons ajouter des logs détaillés dans le backend pour voir :
1. Si le `code` est reçu
2. Quelle URL de redirection est générée
3. Pourquoi la redirection ne fonctionne pas

### Étape 1 : Ajouter des logs dans le backend

Modifiez `../super_try_api/src/modules/auth/auth.controller.ts` dans la méthode `handleOAuthCallback` :

```typescript
async handleOAuthCallback(
  @Query('code') code: string,
  @Query('error') error: string,
  @Query('error_description') errorDescription: string,
  @Res() res: Response,
) {
  console.log('[OAuth Callback] ========== START ==========');
  console.log('[OAuth Callback] Received parameters:', { code: code ? 'PRESENT' : 'MISSING', error, errorDescription });
  console.log('[OAuth Callback] Full query params:', arguments);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  console.log('[OAuth Callback] Frontend URL:', frontendUrl);

  // Handle OAuth errors from provider
  if (error) {
    const encodedError = encodeURIComponent(errorDescription || error);
    const redirectUrl = `${frontendUrl}/auth/error?error=${encodedError}`;
    console.log('[OAuth Callback] Redirecting to error page:', redirectUrl);
    return res.redirect(redirectUrl);
  }

  // Handle missing code
  if (!code) {
    const redirectUrl = `${frontendUrl}/auth/error?error=Code OAuth manquant`;
    console.log('[OAuth Callback] Code missing, redirecting to:', redirectUrl);
    return res.redirect(redirectUrl);
  }

  try {
    console.log('[OAuth Callback] Exchanging code for session...');
    const authData = await this.authService.handleOAuthCallback(code, '');
    console.log('[OAuth Callback] Session exchange successful, got tokens');

    // Redirect to frontend with tokens in URL (will be extracted by frontend and stored)
    const params = new URLSearchParams({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_in: authData.expires_in.toString(),
    });

    const redirectUrl = `${frontendUrl}/auth/callback?${params.toString()}`;
    console.log('[OAuth Callback] Redirecting to frontend callback:', redirectUrl);
    console.log('[OAuth Callback] ========== END SUCCESS ==========');

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('[OAuth Callback] Error during callback:', err);
    const errorMsg = err instanceof Error ? err.message : 'Erreur OAuth inconnue';
    const redirectUrl = `${frontendUrl}/auth/error?error=${encodeURIComponent(errorMsg)}`;
    console.log('[OAuth Callback] Redirecting to error page:', redirectUrl);
    console.log('[OAuth Callback] ========== END ERROR ==========');
    return res.redirect(redirectUrl);
  }
}
```

### Étape 2 : Vérifier le decorator @Res()

Dans le même fichier, vérifiez que le decorator au-dessus de `handleOAuthCallback` inclut `@Res({ passthrough: false })` :

Cherchez cette ligne :
```typescript
@Public()
@Get('oauth/callback')
```

Et ajoutez juste avant la méthode :
```typescript
async handleOAuthCallback(
  @Query('code') code: string,
  @Query('error') error: string,
  @Query('error_description') errorDescription: string,
  @Res({ passthrough: false }) res: Response,  // <-- Ajoutez { passthrough: false }
)
```

### Étape 3 : Redémarrer le backend

```bash
cd ../super_try_api
# Ctrl+C pour arrêter le serveur actuel
npm run start:dev
```

### Étape 4 : Tester à nouveau

1. Ouvrez la console DevTools (F12)
2. Cliquez sur "Se connecter avec Microsoft"
3. Authentifiez-vous
4. **Regardez les logs du backend dans votre terminal**
5. Partagez-moi ces logs

## Hypothèse principale

Je pense que :
1. Le backend reçoit le callback **SANS** le paramètre `code`
2. OU le backend reçoit le code mais `res.redirect()` ne fonctionne pas à cause du decorator `@Res()`

Les logs que je vous ai fournis nous diront exactement ce qui se passe.

## Alternative si le problème persiste

Si après avoir ajouté les logs, on voit que le problème vient de la redirection, nous devrons **changer l'architecture** pour que Supabase redirige **directement vers le frontend** au lieu du backend :

```
Supabase → Frontend → (échange code avec backend) → Dashboard
```

Au lieu de :
```
Supabase → Backend → (échange code) → Frontend → Dashboard
```

Mais faisons d'abord le diagnostic avec les logs !
