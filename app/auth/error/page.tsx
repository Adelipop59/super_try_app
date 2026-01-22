"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ErrorMessages {
  [key: string]: {
    title: string
    description: string
  }
}

const errorMessages: ErrorMessages = {
  access_denied: {
    title: "Accès refusé",
    description: "Vous avez refusé l'accès à votre compte Microsoft. Veuillez réessayer et accepter les permissions requises.",
  },
  invalid_request: {
    title: "Requête invalide",
    description: "La demande d'authentification est invalide. Veuillez réessayer.",
  },
  unauthorized_client: {
    title: "Client non autorisé",
    description: "L'application n'est pas autorisée à effectuer cette action.",
  },
  server_error: {
    title: "Erreur serveur",
    description: "Une erreur est survenue sur le serveur d'authentification. Veuillez réessayer plus tard.",
  },
  temporarily_unavailable: {
    title: "Service temporairement indisponible",
    description: "Le service d'authentification est temporairement indisponible. Veuillez réessayer dans quelques instants.",
  },
  missing_tokens: {
    title: "Tokens manquants",
    description: "Les tokens d'authentification n'ont pas été reçus. Veuillez réessayer.",
  },
  callback_failed: {
    title: "Échec du callback",
    description: "Une erreur est survenue lors du traitement de l'authentification.",
  },
  invalid_email: {
    title: "Email non fourni",
    description: "Votre compte Microsoft ne fournit pas d'adresse email. Veuillez vérifier les permissions de votre compte.",
  },
  default: {
    title: "Erreur d'authentification",
    description: "Une erreur inattendue est survenue lors de l'authentification.",
  },
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [errorInfo, setErrorInfo] = useState({
    title: "Erreur d'authentification",
    description: "Une erreur inattendue est survenue.",
    technicalDetails: "",
  })

  useEffect(() => {
    console.log('[Auth Error] Error page loaded')
    console.log('[Auth Error] Current URL:', window.location.href)

    const error = searchParams.get("error") || "default"
    const description = searchParams.get("description")

    console.log('[Auth Error] Error code:', error)
    console.log('[Auth Error] Error description:', description)

    const errorMsg = errorMessages[error] || errorMessages.default

    setErrorInfo({
      title: errorMsg.title,
      description: description || errorMsg.description,
      technicalDetails: error,
    })
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-xl font-semibold text-red-900">{errorInfo.title}</h1>
              <p className="text-sm text-red-700">{errorInfo.description}</p>
            </div>
          </div>

          {errorInfo.technicalDetails && (
            <div className="mt-4 rounded-md bg-red-100 p-3">
              <p className="text-xs font-mono text-red-800">
                Code d'erreur: {errorInfo.technicalDetails}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/signup/pro")}
            className="w-full"
            variant="default"
          >
            Réessayer l'inscription
          </Button>

          <Button
            onClick={() => router.push("/signin")}
            className="w-full"
            variant="outline"
          >
            Se connecter à un compte existant
          </Button>
        </div>

        <div className="rounded-lg border bg-muted p-4">
          <h2 className="mb-2 text-sm font-semibold">Besoin d'aide ?</h2>
          <p className="text-xs text-muted-foreground">
            Si le problème persiste, assurez-vous que :
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>• Vous avez accepté toutes les permissions demandées</li>
            <li>• Votre compte Microsoft est actif et vérifié</li>
            <li>• Votre compte Microsoft dispose d'une adresse email publique</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Pour toute assistance, contactez notre support à{" "}
            <a href="mailto:support@supertry.com" className="text-primary hover:underline">
              support@supertry.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
