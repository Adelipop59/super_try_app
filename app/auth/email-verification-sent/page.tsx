"use client"

import { Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EmailVerificationSentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Vérifiez votre email</h1>
          <div className="space-y-2 text-muted-foreground">
            <p>
              Un email de vérification a été envoyé à votre adresse email.
            </p>
            <p>
              Veuillez cliquer sur le lien dans l'email pour activer votre compte.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Si vous ne voyez pas l'email, vérifiez votre dossier spam/courrier indésirable.
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
