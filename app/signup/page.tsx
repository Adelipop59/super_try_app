"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff, Loader2, Info } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CountrySelect } from "@/components/ui/country-select"
import { CountryMultiSelect } from "@/components/ui/country-multi-select"
import { Logo } from "@/components/logo"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

interface Country {
  code: string
  name: string
  nameEn: string
  nameFr: string
  isActive: boolean
  region: string
  available?: boolean
  spots_remaining?: number
  max_users?: number
}

type SignupStep = "email" | "form"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [userType, setUserType] = useState<"USER" | "PRO">("USER")
  const [currentStep, setCurrentStep] = useState<SignupStep>("email")

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    country: "",
    countries: [] as string[],
  })

  // Load countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries?locale=fr")
        if (!response.ok) {
          throw new Error("Failed to fetch countries")
        }
        const data = await response.json()
        setCountries(data.countries || [])
      } catch (err) {
        console.error("Error fetching countries:", err)
        toast.error("Erreur lors du chargement des pays")
      } finally {
        setLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

  // Check for pre-filled email from URL
  useEffect(() => {
    const email = searchParams.get("email")
    if (email) {
      setFormData(prev => ({ ...prev, email }))
      setCurrentStep("form")
    }
  }, [searchParams])

  const handleMicrosoftOAuth = async () => {
    console.log('[Signup] Starting Microsoft OAuth flow')
    try {
      console.log('[Signup] Fetching OAuth URL from /api/auth/oauth/microsoft')
      const response = await fetch(`/api/auth/oauth/microsoft`)
      console.log('[Signup] OAuth URL response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[Signup] Failed to get OAuth URL:', errorData)
        throw new Error("Failed to get Microsoft OAuth URL")
      }

      const data = await response.json()
      console.log('[Signup] OAuth response data:', data)
      console.log('[Signup] Redirecting to Microsoft OAuth URL:', data.url)

      window.location.href = data.url
    } catch (err) {
      console.error('[Signup] Microsoft OAuth error:', err)
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

      if (data.exists) {
        // Email exists, redirect to login
        toast.info("Cet email existe déjà. Redirection vers la connexion...")
        setTimeout(() => {
          router.push(`/signin?email=${encodeURIComponent(formData.email)}`)
        }, 1000)
      } else {
        // Email doesn't exist, continue to full form
        setCurrentStep("form")
      }
    } catch (err: any) {
      console.error("Email check error:", err)
      setError(err.message || "Erreur lors de la vérification de l'email")
      toast.error(err.message || "Erreur lors de la vérification de l'email")
    } finally {
      setCheckingEmail(false)
    }
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Tous les champs obligatoires doivent être remplis")
      return false
    }

    // Validation selon le type d'utilisateur
    if (userType === "USER") {
      if (!formData.country) {
        setError("Veuillez sélectionner votre pays")
        return false
      }
      if (!/^[A-Z]{2}$/.test(formData.country)) {
        setError("Le code pays doit être un code ISO valide (2 lettres)")
        return false
      }
    } else if (userType === "PRO") {
      if (formData.countries.length === 0) {
        setError("Veuillez sélectionner au moins un pays")
        return false
      }
      // Vérifier qu'au moins un pays sélectionné est disponible
      const hasAvailableCountry = formData.countries.some(countryCode =>
        countries.find(c => c.code === countryCode && c.isActive)
      )
      if (!hasAvailableCountry) {
        setError("Vous devez sélectionner au moins un pays disponible pour créer des campagnes")
        return false
      }
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return false
    }

    if (formData.firstName.length < 2) {
      setError("Le prénom doit contenir au moins 2 caractères")
      return false
    }

    if (formData.lastName.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        role: userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ...(userType === "USER" ? { country: formData.country } : {}),
        ...(userType === "PRO" ? { countries: formData.countries } : {}),
      })

      toast.success("Inscription réussie !")
      // La redirection est gérée par le contexte Auth
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "Erreur lors de l'inscription")
      toast.error(err.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCountriesChange = (countries: string[]) => {
    setFormData({
      ...formData,
      countries: countries,
    })
  }

  const handleCountryChange = (country: string) => {
    setFormData({
      ...formData,
      country: country,
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </Link>

        <div className="bg-background border rounded-2xl p-6 shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Logo className="h-8" />
          </div>

          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold">
                {currentStep === "email" ? "Créer un compte Super Try" : "Créer un compte Super Try"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentStep === "email"
                  ? "Une dernière étape avant de commencer votre essai gratuit."
                  : "Complétez votre profil pour continuer"}
              </p>
            </div>

            {currentStep === "email" ? (
              // Step 1: Email check
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={checkingEmail}
                    className="h-11"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
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
                  className="w-full h-11"
                  onClick={handleMicrosoftOAuth}
                  disabled={checkingEmail}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  S'inscrire avec Microsoft
                </Button>

                <div className="text-center text-xs">
                  Vous avez déjà un compte Super Try ?{" "}
                  <Link href="/signin" className="text-primary hover:underline font-medium">
                    Connexion
                  </Link>
                </div>
              </form>
            ) : (
              // Step 2: Full registration form
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    {error}
                  </div>
                )}

                {/* Email (readonly) */}
                <div className="space-y-1.5">
                  <Label htmlFor="email-readonly" className="text-sm">E-mail</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email-readonly"
                      type="email"
                      value={formData.email}
                      disabled
                      className="h-10 flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep("email")}
                      className="text-primary hover:text-primary text-xs h-8 px-2"
                    >
                      Changer
                    </Button>
                  </div>
                </div>

                {/* Toggle User Type */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Type de compte</Label>
                  <div className="flex gap-1.5 p-1 bg-muted rounded-lg">
                    <button
                      type="button"
                      onClick={() => setUserType("USER")}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                        userType === "USER"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Testeur
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("PRO")}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                        userType === "PRO"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Vendeur PRO
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-sm">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      disabled={loading}
                      className="h-10"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-sm">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      disabled={loading}
                      className="h-10"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground -mt-1">
                  Saisissez votre prénom et votre nom tels qu'ils apparaissent sur votre pièce d'identité officielle.
                </p>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 caractères"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      disabled={loading}
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm">Confirmer</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmez"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      disabled={loading}
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Country / Countries */}
                <div className="space-y-1.5">
                  <Label htmlFor={userType === "PRO" ? "countries" : "country"} className="text-sm">
                    {userType === "PRO" ? "Pays (sélection multiple)" : "Pays"} <span className="text-red-500">*</span>
                  </Label>
                  {loadingCountries ? (
                    <div className="flex items-center gap-2 p-2 border rounded-lg h-10">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">Chargement...</span>
                    </div>
                  ) : userType === "PRO" ? (
                    <>
                      {/* Multi-select avec drapeaux pour PRO */}
                      <CountryMultiSelect
                        countries={countries}
                        selectedCountries={formData.countries}
                        onChange={handleCountriesChange}
                        disabled={loading}
                      />
                      <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
                          Vous pouvez créer des campagnes uniquement dans les pays <span className="font-semibold">disponibles</span> sélectionnés.
                          Vous recevrez une notification lorsque les pays "Bientôt disponible" deviendront actifs.
                        </p>
                      </div>
                    </>
                  ) : (
                    // Select avec drapeaux pour USER
                    <CountrySelect
                      countries={countries}
                      selectedCountry={formData.country}
                      onChange={handleCountryChange}
                      disabled={loading}
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    "Créer un compte Super Try"
                  )}
                </Button>
              </form>
            )}

            <div className="text-[10px] text-center text-muted-foreground pt-3 border-t">
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

        <div className="mt-4 text-center space-x-3 text-[10px] text-muted-foreground">
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
