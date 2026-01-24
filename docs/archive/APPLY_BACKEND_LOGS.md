# Instructions pour ajouter les logs au backend

## Fichier à modifier

`../super_try_api/src/modules/auth/auth.controller.ts`

## Modifications à faire

### 1. Trouver la méthode `handleOAuthCallback`

Cherchez cette méthode (elle commence vers la ligne 309).

### 2. Remplacer la signature de la méthode

**AVANT** :
```typescript
async handleOAuthCallback(
  @Query('code') code: string,
  @Query('error') error: string,
  @Query('error_description') errorDescription: string,
  @Res() res: Response,
) {
```

**APRÈS** :
```typescript
async handleOAuthCallback(
  @Query('code') code: string,
  @Query('error') error: string,
  @Query('error_description') errorDescription: string,
  @Res({ passthrough: false }) res: Response,
) {
```

### 3. Ajouter des logs au début de la méthode

Juste après l'accolade ouvrante `{`, ajoutez :

```typescript
console.log('[OAuth Callback] ========== START ==========');
console.log('[OAuth Callback] Received code:', code ? 'PRESENT' : 'MISSING');
console.log('[OAuth Callback] Received error:', error || 'NONE');
console.log('[OAuth Callback] Error description:', errorDescription || 'NONE');
```

### 4. Ajouter des logs pour chaque cas

**Pour les erreurs du provider** (ligne qui contient `if (error)`), ajoutez avant le `return` :

```typescript
if (error) {
  const encodedError = encodeURIComponent(errorDescription || error);
  const redirectUrl = `${frontendUrl}/auth/error?error=${encodedError}`;
  console.log('[OAuth Callback] Provider error, redirecting to:', redirectUrl);
  return res.redirect(redirectUrl);
}
```

**Pour le code manquant** (ligne qui contient `if (!code)`), ajoutez avant le `return` :

```typescript
if (!code) {
  const redirectUrl = `${frontendUrl}/auth/error?error=Code OAuth manquant`;
  console.log('[OAuth Callback] Code missing, redirecting to:', redirectUrl);
  return res.redirect(redirectUrl);
}
```

**Dans le try block**, juste après `try {` :

```typescript
try {
  console.log('[OAuth Callback] Exchanging code for session with Supabase...');
  const authData = await this.authService.handleOAuthCallback(code, '');
  console.log('[OAuth Callback] Session exchange successful');

  // ... reste du code
```

**Avant la redirection finale** (juste avant `return res.redirect`), ajoutez :

```typescript
const redirectUrl = `${frontendUrl}/auth/callback?${params.toString()}`;
console.log('[OAuth Callback] Redirecting to frontend callback:', `${frontendUrl}/auth/callback?access_token=***`);
console.log('[OAuth Callback] ========== END SUCCESS ==========');

return res.redirect(redirectUrl);
```

**Dans le catch block** :

```typescript
} catch (err) {
  console.error('[OAuth Callback] ========== ERROR ==========');
  console.error('[OAuth Callback] Error:', err);
  const errorMsg = err instanceof Error ? err.message : 'Erreur OAuth inconnue';
  const redirectUrl = `${frontendUrl}/auth/error?error=${encodeURIComponent(errorMsg)}`;
  console.log('[OAuth Callback] Redirecting to error page:', redirectUrl);
  console.log('[OAuth Callback] ========== END ERROR ==========');
  return res.redirect(redirectUrl);
}
```

## Après les modifications

1. Sauvegardez le fichier
2. Le backend devrait se recharger automatiquement (hot reload)
3. Testez à nouveau le flow OAuth
4. **Partagez-moi les logs du backend** qui apparaissent dans le terminal

Les logs vont nous dire exactement où le flow est bloqué !
