"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

type SigninStep = "email" | "password"

export default function SigninPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState<SigninStep>("email")

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Check for pre-filled email from URL
  useEffect(() => {
    const email = searchParams.get("email")
    if (email) {
      setFormData(prev => ({ ...prev, email }))
      setCurrentStep("password")
    }
  }, [searchParams])

  const handleMicrosoftOAuth = async () => {
    console.log('[Signin] Starting Microsoft OAuth flow')
    try {
      console.log('[Signin] Fetching OAuth URL from /api/auth/oauth/microsoft')
      const response = await fetch("/api/auth/oauth/microsoft")
      console.log('[Signin] OAuth URL response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[Signin] Failed to get OAuth URL:', errorData)
        throw new Error("Failed to get Microsoft OAuth URL")
      }

      const data = await response.json()
      console.log('[Signin] OAuth response data:', data)
      console.log('[Signin] Redirecting to Microsoft OAuth URL:', data.url)

      window.location.href = data.url
    } catch (err) {
      console.error('[Signin] Microsoft OAuth error:', err)
      toast.error("Erreur lors de la connexion avec Microsoft")
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email) {
      setError("Veuillez entrer votre adresse email")
      return
    }

    setCheckingEmail(true)

    try {
      // Check if email exists
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la vérification de l'email")
      }

      const data = await response.json()

      if (!data.exists) {
        // Email doesn't exist, redirect to signup
        toast.info("Cet email n'existe pas. Redirection vers l'inscription...")
        setTimeout(() => {
          router.push(`/signup?email=${encodeURIComponent(formData.email)}`)
        }, 1000)
      } else {
        // Email exists, continue to password step
        setCurrentStep("password")
      }
    } catch (err: any) {
      console.error("Email check error:", err)
      setError(err.message || "Erreur lors de la vérification de l'email")
      toast.error(err.message || "Erreur lors de la vérification de l'email")
    } finally {
      setCheckingEmail(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.password) {
      setError("Veuillez entrer votre mot de passe")
      return
    }

    setLoading(true)

    try {
      await signIn(formData)
      toast.success("Connexion réussie !")
      // La redirection est gérée par le contexte Auth
    } catch (err: any) {
      console.error("Signin error:", err)
      setError(err.message || "Mot de passe incorrect")
      toast.error(err.message || "Mot de passe incorrect")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </Link>

        <div className="bg-background border rounded-2xl p-8 shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo className="h-8" />
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold">Connexion</h1>
              <p className="text-sm text-muted-foreground">
                Continuer vers Super Try
              </p>
            </div>

            {currentStep === "email" ? (
              // Step 1: Email check
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={checkingEmail}
                    className="h-12"
                    autoFocus
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={checkingEmail || !formData.email}
                >
                  {checkingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Utiliser cet e-mail"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  onClick={handleMicrosoftOAuth}
                  disabled={checkingEmail}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  Se connecter avec Microsoft
                </Button>

                <div className="text-center text-sm">
                  Débutant sur Super Try ?{" "}
                  <Link href="/signup" className="text-primary hover:underline font-medium">
                    Démarrer
                  </Link>
                </div>
              </form>
            ) : (
              // Step 2: Password form
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                  </div>
                )}

                {/* Email (readonly) */}
                <div className="space-y-2">
                  <Label htmlFor="email-readonly">E-mail</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email-readonly"
                      type="email"
                      value={formData.email}
                      disabled
                      className="h-12 flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep("email")}
                      className="text-primary hover:text-primary"
                    >
                      Changer l'adresse e-mail
                    </Button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      className="h-12 pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            )}

            <div className="text-xs text-center text-muted-foreground pt-4 border-t">
              En continuant, vous acceptez les{" "}
              <Link href="/legal/terms" className="text-primary hover:underline">
                Conditions générales
              </Link>{" "}
              et la{" "}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center space-x-4 text-xs text-muted-foreground">
          <Link href="/help" className="hover:text-foreground transition-colors">
            Aide
          </Link>
          <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
            Confidentialité
          </Link>
          <Link href="/legal/terms" className="hover:text-foreground transition-colors">
            Conditions
          </Link>
        </div>
      </div>
    </div>
  )
}
