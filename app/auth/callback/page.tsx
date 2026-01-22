"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[Auth Callback] Starting callback handler')
      console.log('[Auth Callback] Current URL:', window.location.href)
      console.log('[Auth Callback] Search params:', window.location.search)
      console.log('[Auth Callback] Hash fragment:', window.location.hash)

      try {
        // Récupérer les tokens depuis l'URL (query params OU hash fragment)
        let accessToken = searchParams.get("access_token")
        let refreshToken = searchParams.get("refresh_token")
        let error = searchParams.get("error")
        let errorDescription = searchParams.get("error_description")

        // Si les tokens ne sont pas dans les query params, vérifier le hash fragment (Supabase OAuth)
        if (!accessToken && window.location.hash) {
          console.log('[Auth Callback] Checking hash fragment for tokens')
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          accessToken = hashParams.get("access_token")
          refreshToken = hashParams.get("refresh_token")
          error = hashParams.get("error")
          errorDescription = hashParams.get("error_description")

          console.log('[Auth Callback] Hash fragment params:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasError: !!error
          })
        }

        // Log all URL parameters
        const allParams: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          allParams[key] = value
        })
        console.log('[Auth Callback] Query parameters:', allParams)

        console.log('[Auth Callback] Access token present:', !!accessToken)
        console.log('[Auth Callback] Refresh token present:', !!refreshToken)
        console.log('[Auth Callback] Error present:', !!error)

        // Vérifier s'il y a une erreur
        if (error) {
          console.error('[Auth Callback] OAuth error:', error, errorDescription)
          setStatus("error")
          setMessage(errorDescription || "Une erreur est survenue lors de l'authentification")

          // Rediriger vers la page d'erreur après 2 secondes
          setTimeout(() => {
            router.push(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`)
          }, 2000)
          return
        }

        // Vérifier que les tokens sont présents
        if (!accessToken || !refreshToken) {
          console.error('[Auth Callback] Missing tokens in callback URL')
          console.error('[Auth Callback] This might indicate a backend OAuth configuration issue')
          setStatus("error")
          setMessage("Tokens manquants dans la réponse OAuth")

          setTimeout(() => {
            router.push("/auth/error?error=missing_tokens")
          }, 2000)
          return
        }

        console.log('[Auth Callback] Tokens received successfully')

        // Stocker les tokens
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
        console.log('[Auth Callback] Tokens stored in localStorage')

        setStatus("success")
        setMessage("Authentification réussie ! Redirection en cours...")

        // Récupérer les informations de l'utilisateur depuis le backend
        console.log('[Auth Callback] Fetching user information from backend')

        // Configurer le token dans l'API client
        api.setToken(accessToken)

        const profile = await api.getMe()
        console.log('[Auth Callback] User profile received:', { role: profile.role, id: profile.id })

        // Rediriger vers le dashboard approprié selon le rôle
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
  }, [searchParams, router])

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
