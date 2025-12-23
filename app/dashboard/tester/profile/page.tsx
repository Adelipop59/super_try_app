"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, Profile } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { KycVerificationBanner } from "@/components/kyc-verification-banner"
import { UserIcon, MailIcon, PhoneIcon, CalendarIcon, ShieldCheckIcon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user } = useAuth()
  const { handleErrorWithRetry } = useErrorHandler()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.updateProfile(formData)
      toast.success("Profil mis à jour avec succès - Rechargez la page pour voir les changements")
      // Optionally reload the page to refresh user data
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <UserIcon className="h-8 w-8 text-blue-600" />
          Mon Profil
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos informations personnelles et votre vérification
        </p>
      </div>

      {/* Verification Status Banner - Only show if NOT verified */}
      <div className="px-4 lg:px-6">
        <KycVerificationBanner
          verificationStatus={user?.verificationStatus}
          autoFetch={true}
          hideIfVerified={true}
          onStatusChange={() => window.location.reload()}
        />
      </div>

      {/* Profile Information */}
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Mettez à jour vos informations de profil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              L&apos;email ne peut pas être modifié ici
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (user) {
                  setFormData({
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    phone: user.phone || "",
                  })
                }
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Détails de votre compte testeur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Rôle</span>
            <Badge>{user?.role}</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Compte actif</span>
            <Badge variant={user?.isActive ? "default" : "secondary"}>
              {user?.isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Membre depuis</span>
            <span className="text-sm font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              }) : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Dernière mise à jour</span>
            <span className="text-sm font-medium">
              {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              }) : "-"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
