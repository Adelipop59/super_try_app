"use client"

import { useState } from "react"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ResendVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Veuillez entrer votre adresse email")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'envoi de l'email")
      }

      setSuccess(true)
      toast.success("Email de vérification envoyé avec succès !")

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/auth/email-verification-sent")
      }, 3000)
    } catch (err: any) {
      console.error("Resend verification error:", err)
      toast.error(err.message || "Erreur lors de l'envoi de l'email")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold">Email envoyé !</h1>
            <p className="text-muted-foreground">
              Un nouvel email de vérification a été envoyé à <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Redirection en cours...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à la connexion</span>
        </Link>

        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Renvoyer l'email de vérification</h1>
            <p className="text-muted-foreground">
              Entrez votre adresse email pour recevoir un nouveau lien de vérification
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Renvoyer l'email
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
