"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EmailVerifiedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const success = searchParams.get("success")

  useEffect(() => {
    // Simulate verification check
    const timer = setTimeout(() => {
      if (success === "true") {
        setStatus("success")
      } else {
        setStatus("error")
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [success])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Vérification en cours...</p>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-4">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
            <h1 className="text-3xl font-bold">Email vérifié avec succès !</h1>
            <p className="text-muted-foreground">
              Votre adresse email a été confirmée. Vous pouvez maintenant vous connecter à votre compte.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/signin">Se connecter</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <XCircle className="h-16 w-16 mx-auto text-red-500" />
          <h1 className="text-3xl font-bold">Erreur de vérification</h1>
          <p className="text-muted-foreground">
            Le lien de vérification est invalide ou a expiré. Veuillez réessayer ou contacter le support.
          </p>
        </div>
        <div className="space-y-3">
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/resend-verification">Renvoyer l'email de vérification</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
