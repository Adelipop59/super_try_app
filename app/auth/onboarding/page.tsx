"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CountrySelect } from "@/components/ui/country-select"
import { CountryMultiSelect } from "@/components/ui/country-multi-select"
import { Logo } from "@/components/logo"
import { toast } from "sonner"
import { api } from "@/lib/api"
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

type Role = "USER" | "PRO"

export default function OnboardingPage() {
  const router = useRouter()
  const { refreshAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [error, setError] = useState("")
  const [userType, setUserType] = useState<Role>("USER")

  // Form state - identical to signup
  const [formData, setFormData] = useState({
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

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Le prénom et le nom sont obligatoires")
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
      await api.completeOnboarding({
        role: userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ...(userType === "USER" ? { country: formData.country } : {}),
        ...(userType === "PRO" ? { countries: formData.countries } : {}),
      })

      toast.success("Profil complété avec succès !")

      // Refresh auth context to update user role before redirecting
      await refreshAuth()

      // Redirect based on role
      const dashboardPath = userType === "PRO" ? "/dashboard/pro" : "/dashboard"
      router.push(dashboardPath)
    } catch (err: any) {
      console.error("Onboarding error:", err)
      setError(err.message || "Erreur lors de la finalisation du profil")
      toast.error(err.message || "Erreur lors de la finalisation du profil")
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
        <div className="bg-background border rounded-2xl p-6 shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Logo className="h-8" />
          </div>

          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold">Finaliser votre inscription</h1>
              <p className="text-xs text-muted-foreground">
                Complétez votre profil pour continuer
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                  {error}
                </div>
              )}

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
                    Finalisation...
                  </>
                ) : (
                  "Finaliser mon inscription"
                )}
              </Button>
            </form>

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
