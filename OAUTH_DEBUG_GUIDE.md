# Azure OAuth Debugging Guide

## Problem Identified

The OAuth callback flow is failing because of a **misconfigured redirect URL** in the backend.

### Current Configuration Issue

**Backend `.env` file** (`../super_try_api/.env`):
```
BACKEND_URL=http://localhost:3000/api/v1
```

**Auth Service** (`../super_try_api/src/modules/auth/auth.service.ts:547`):
```typescript
redirectTo: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/auth/oauth/callback`
```

This creates an **incorrect URL**:
```
http://localhost:3000/api/v1/api/v1/auth/oauth/callback  ❌
```

### Solution

Update the `BACKEND_URL` in `../super_try_api/.env` to:
```
BACKEND_URL=http://localhost:3000
```

This will generate the **correct callback URL**:
```
http://localhost:3000/api/v1/auth/oauth/callback  ✅
```

---

## Comprehensive Logging Added

I've added detailed console logging throughout the OAuth flow to help debug any remaining issues:

### 1. Frontend - Signin/Signup Pages
- Logs when Microsoft OAuth button is clicked
- Logs the OAuth URL fetched from backend
- Logs the redirect URL before navigation

**Files modified:**
- [app/signin/page.tsx](app/signin/page.tsx#L42-L57)
- [app/signup/page.tsx](app/signup/page.tsx#L86-L103)

### 2. Frontend - OAuth API Route
- Logs the backend API URL being called
- Logs the response from backend
- Logs the OAuth redirect URL

**File modified:**
- [app/api/auth/oauth/microsoft/route.ts](app/api/auth/oauth/microsoft/route.ts)

### 3. Frontend - Callback Page
- Logs all URL parameters received
- Logs token presence/absence
- Logs each step of the callback process
- Logs user info fetch and redirect destination

**File modified:**
- [app/auth/callback/page.tsx](app/auth/callback/page.tsx#L13-L88)

### 4. Frontend - Error Page
- Logs the error code and description
- Logs the full URL when error page is reached

**File modified:**
- [app/auth/error/page.tsx](app/auth/error/page.tsx#L64-L75)

---

## OAuth Flow Overview

```
┌─────────────┐
│   User      │
│  clicks     │
│ "Microsoft" │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: app/signin/page.tsx                       │
│ - Fetches /api/auth/oauth/microsoft                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Frontend API: app/api/auth/oauth/microsoft/route.ts│
│ - Calls backend: GET /api/v1/auth/oauth/microsoft  │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Backend: auth.controller.ts - initiateOAuth()       │
│ - Calls Supabase signInWithOAuth()                  │
│ - Sets redirectTo callback URL                      │
│ - Returns Azure OAuth URL                           │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ User redirected to Azure/Microsoft OAuth            │
│ - User authenticates with Microsoft                 │
│ - User approves permissions                         │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Supabase receives OAuth callback                    │
│ - Validates with Azure                              │
│ - Generates authorization code                      │
│ - Redirects to: redirectTo URL with ?code=xxx       │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Backend: auth.controller.ts - handleOAuthCallback() │
│ - Receives code from Supabase                       │
│ - Calls auth.service.ts handleOAuthCallback()       │
│ - Exchanges code for session with Supabase          │
│ - Creates/gets user profile                         │
│ - Returns access_token & refresh_token              │
│ - Redirects to frontend callback page               │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: app/auth/callback/page.tsx                │
│ - Extracts access_token & refresh_token from URL    │
│ - Stores tokens in localStorage                     │
│ - Fetches user info from /api/auth/me              │
│ - Redirects to appropriate dashboard                │
└─────────────────────────────────────────────────────┘
```

---

## Testing Steps

After fixing the `BACKEND_URL`:

1. **Restart the backend server** to load the new environment variable:
   ```bash
   cd ../super_try_api
   # Stop the server if running, then:
   npm run start:dev
   ```

2. **Open browser DevTools** (F12) and go to the Console tab

3. **Click "Se connecter avec Microsoft"** on signin or signup page

4. **Watch the console logs** at each step:
   - You should see `[Signin]` or `[Signup]` logs
   - Then `[Microsoft OAuth API]` logs
   - After Microsoft login, `[Auth Callback]` logs
   - Or `[Auth Error]` logs if something fails

5. **Check the backend logs** as well for any server-side errors

---

## Configuration Checklist

### Azure AD Configuration
In your Azure portal, verify:

- [ ] Redirect URI includes: `https://mdihnqriahzlqtrjexuy.supabase.co/auth/v1/callback`
- [ ] Application has "email", "openid", "profile" permissions
- [ ] Application is set to allow public client flows (if needed)

### Supabase Configuration
In your Supabase dashboard:

- [ ] Azure provider is enabled
- [ ] Azure Application (client) ID is configured
- [ ] Azure Application secret is configured
- [ ] Azure AD Tenant ID is configured (if using single tenant)
- [ ] Redirect URLs include your frontend callback: `http://localhost:3001/auth/callback`

### Backend Configuration
In `../super_try_api/.env`:

- [x] `BACKEND_URL=http://localhost:3000` (NOT `http://localhost:3000/api/v1`)
- [x] `FRONTEND_URL=http://localhost:3001`
- [x] `SUPABASE_URL=https://mdihnqriahzlqtrjexuy.supabase.co`
- [x] `SUPABASE_KEY=<your-anon-key>`
- [x] `SUPABASE_SERVICE_KEY=<your-service-key>`

### Frontend Configuration
In `.env.local` or `.env`:

- [x] `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`

---

## Common Issues & Solutions

### Issue 1: "Missing tokens in callback URL"
**Cause:** Backend OAuth callback isn't being called, or backend isn't redirecting properly to frontend
**Check:**
- Backend logs for OAuth callback execution
- Verify `BACKEND_URL` doesn't have `/api/v1` suffix
- Verify Azure redirect URI matches Supabase callback URL

### Issue 2: "Blank page after Microsoft login"
**Cause:** Supabase is redirecting to wrong URL, or URL parameters are missing
**Check:**
- Browser URL in the address bar - does it have `access_token` and `refresh_token` params?
- If URL shows Supabase authorization URL, the callback chain is broken
- Check console logs for `[Auth Callback]` messages

### Issue 3: "OAuth initialization failed"
**Cause:** Supabase can't generate OAuth URL
**Check:**
- Supabase dashboard: Azure provider configuration
- Backend logs for specific error message from Supabase

### Issue 4: "Code OAuth invalide"
**Cause:** Code exchange with Supabase is failing
**Check:**
- Supabase logs in dashboard
- Verify Azure app secret is correct in Supabase
- Check if code has already been used (codes are single-use)

---

## Log Prefixes Reference

All console logs now use prefixes to help you track the flow:

| Prefix | Location | Purpose |
|--------|----------|---------|
| `[Signin]` | app/signin/page.tsx | User initiated OAuth from signin page |
| `[Signup]` | app/signup/page.tsx | User initiated OAuth from signup page |
| `[Microsoft OAuth API]` | app/api/auth/oauth/microsoft/route.ts | Frontend API route processing |
| `[Auth Callback]` | app/auth/callback/page.tsx | Processing OAuth callback with tokens |
| `[Auth Error]` | app/auth/error/page.tsx | Error page with details |

---

## Next Steps

1. **Fix `BACKEND_URL`** in `../super_try_api/.env`
2. **Restart backend** server
3. **Test OAuth flow** and collect logs
4. **If still failing**, share:
   - Browser console logs (with prefixes)
   - Backend server logs
   - The exact URL you're seeing when stuck (address bar)
   - Any error messages from Azure or Supabase

The logs will now tell us exactly where the flow is breaking!
