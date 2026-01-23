"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"

type Role = "USER" | "PRO"

interface OnboardingFormData {
  role: Role
  country?: string
  countries?: string[]
  firstName?: string
  lastName?: string
  phone?: string
  companyName?: string
  siret?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<OnboardingFormData>({
    role: "USER",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate role is selected
    if (!formData.role) {
      setError("Veuillez choisir un rôle")
      setLoading(false)
      return
    }

    try {
      // Call complete-onboarding endpoint
      const updatedProfile = await api.completeOnboarding(formData)

      // Redirect based on role - the auth context will update automatically on next checkAuth
      const dashboardPath = updatedProfile.role === "PRO" ? "/dashboard/pro" : "/dashboard"
      router.push(dashboardPath)
    } catch (err: any) {
      console.error("Onboarding error:", err)
      setError(err.message || "Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Finaliser votre inscription</CardTitle>
          <CardDescription>
            Quelques informations supplémentaires pour compléter votre profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Je suis</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value: Role) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="USER" id="user" />
                  <Label htmlFor="user" className="font-normal cursor-pointer">
                    Testeur - Je veux tester des produits
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PRO" id="pro" />
                  <Label htmlFor="pro" className="font-normal cursor-pointer">
                    Professionnel - Je veux faire tester mes produits
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* USER specific fields */}
            {formData.role === "USER" && (
              <div className="space-y-2">
                <Label htmlFor="country">Pays *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Sélectionnez votre pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="BE">Belgique</SelectItem>
                    <SelectItem value="DE">Allemagne</SelectItem>
                    <SelectItem value="ES">Espagne</SelectItem>
                    <SelectItem value="IT">Italie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* PRO specific fields */}
            {formData.role === "PRO" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33612345678"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siret">Numéro SIRET</Label>
                  <Input
                    id="siret"
                    placeholder="12345678901234"
                    value={formData.siret || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, siret: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countries">Pays d'intervention *</Label>
                  <Select
                    value={formData.countries?.[0]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, countries: [value] })
                    }
                  >
                    <SelectTrigger id="countries">
                      <SelectValue placeholder="Sélectionnez vos pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="BE">Belgique</SelectItem>
                      <SelectItem value="DE">Allemagne</SelectItem>
                      <SelectItem value="ES">Espagne</SelectItem>
                      <SelectItem value="IT">Italie</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Vous pourrez ajouter d'autres pays plus tard
                  </p>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finaliser mon inscription
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
