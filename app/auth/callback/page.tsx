"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshAuth } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRun) return

    const handleCallback = async () => {
      setHasRun(true)
      console.log('[Auth Callback] Starting callback handler')

      try {
        // Check for errors in URL
        const error = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        if (error) {
          console.error('[Auth Callback] OAuth error:', error, errorDescription)
          setStatus("error")
          setMessage(errorDescription || "Une erreur est survenue lors de l'authentification")

          setTimeout(() => {
            router.push(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`)
          }, 2000)
          return
        }

        console.log('[Auth Callback] No errors detected, checking for tokens in URL hash')

        // Extract tokens from URL hash (sent by backend after OAuth)
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (!accessToken || !refreshToken) {
          throw new Error('Tokens manquants dans l\'URL de callback')
        }

        console.log('[Auth Callback] Tokens found in URL, storing in httpOnly cookies')

        // Store tokens in httpOnly cookies via backend endpoint
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/store-oauth-tokens`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
          }),
        })

        // Clear URL hash to remove tokens from URL
        window.history.replaceState(null, '', window.location.pathname + window.location.search)

        console.log('[Auth Callback] Tokens stored, refreshing auth context')

        // Refresh auth context to load user profile with the new cookies
        await refreshAuth()

        // Fetch profile to check onboarding status
        const profile = await api.getMe()
        console.log('[Auth Callback] User profile received:', { role: profile.role, id: profile.id, isOnboarded: (profile as any).isOnboarded })

        setStatus("success")

        // Check if user needs to complete onboarding
        if ((profile as any).isOnboarded === false) {
          console.log('[Auth Callback] User needs to complete onboarding')
          setMessage("Finalisation de votre inscription en cours...")

          setTimeout(() => {
            router.push("/auth/onboarding")
          }, 1000)
          return
        }

        setMessage("Authentification réussie ! Redirection en cours...")

        // Redirect to appropriate dashboard based on role
        const dashboardPath = profile.role === "PRO"
          ? "/dashboard/pro"
          : profile.role === "ADMIN"
          ? "/dashboard/admin"
          : "/dashboard"

        console.log('[Auth Callback] Redirecting to:', dashboardPath)

        setTimeout(() => {
          router.push(dashboardPath)
        }, 1500)
      } catch (err) {
        console.error('[Auth Callback] Callback error:', err)
        setStatus("error")
        setMessage(err instanceof Error ? err.message : "Une erreur inattendue est survenue")

        setTimeout(() => {
          router.push("/auth/error?error=callback_failed")
        }, 2000)
      }
    }

    handleCallback()
  }, [searchParams, router, hasRun])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md space-y-6 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-semibold">Authentification en cours...</h1>
            <p className="text-sm text-muted-foreground">
              Veuillez patienter pendant que nous finalisons votre connexion.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-green-600">Authentification réussie !</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-red-600">Erreur d'authentification</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}
