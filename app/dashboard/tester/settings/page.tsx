"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { SettingsIcon, BellIcon, ShieldIcon, KeyIcon, LogOutIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    try {
      setChangingPassword(true)
      await api.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success("Mot de passe modifié avec succès")
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du changement de mot de passe")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/signin")
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-gray-600" />
          Paramètres
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos préférences et votre sécurité
        </p>
      </div>

      {/* Notifications Settings */}
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Gérez vos préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications par email pour les nouvelles sessions
              </p>
            </div>
            <Switch id="email-notifications" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="session-updates">Mises à jour de sessions</Label>
              <p className="text-sm text-muted-foreground">
                Notifications sur l&apos;état de vos sessions
              </p>
            </div>
            <Switch id="session-updates" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="payment-notifications">Paiements</Label>
              <p className="text-sm text-muted-foreground">
                Notifications pour les paiements et retraits
              </p>
            </div>
            <Switch id="payment-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <KeyIcon className="h-4 w-4" />
              Changer le mot de passe
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old-password">Ancien mot de passe</Label>
                <Input
                  id="old-password"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword || !passwordData.oldPassword || !passwordData.newPassword}
              >
                {changingPassword ? "Modification..." : "Changer le mot de passe"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="mx-4 lg:mx-6 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
          <CardDescription>
            Actions irréversibles sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Déconnexion</p>
              <p className="text-sm text-muted-foreground">
                Se déconnecter de votre compte
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Supprimer mon compte</p>
              <p className="text-sm text-muted-foreground">
                Supprimer définitivement votre compte (non disponible)
              </p>
            </div>
            <Button variant="destructive" disabled>
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
