"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api, UpdateProfileData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { UserIcon, KeyIcon, MailIcon, BuildingIcon } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, updateUser } = useAuth()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
    siret: user?.siret || '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Email form state
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: '',
  })
  const [isSavingEmail, setIsSavingEmail] = useState(false)

  const handleProfileSave = async () => {
    try {
      setIsSavingProfile(true)

      const updateData: UpdateProfileData = {
        firstName: profileForm.firstName || undefined,
        lastName: profileForm.lastName || undefined,
        phone: profileForm.phone || undefined,
        companyName: profileForm.companyName || undefined,
        siret: profileForm.siret || undefined,
      }

      await updateUser(updateData)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Failed to update profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil'
      toast.error(errorMessage)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      setIsSavingPassword(true)

      await api.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })

      toast.success('Mot de passe modifié avec succès')
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Failed to change password:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe'
      toast.error(errorMessage)
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleEmailChange = async () => {
    if (!emailForm.email || !emailForm.password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (!emailForm.email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide')
      return
    }

    try {
      setIsSavingEmail(true)

      await api.updateEmail({
        email: emailForm.email,
        password: emailForm.password,
      })

      toast.success('Email mis à jour avec succès')
      setEmailForm({
        email: '',
        password: '',
      })
    } catch (error) {
      console.error('Failed to update email:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'email'
      toast.error(errorMessage)
    } finally {
      setIsSavingEmail(false)
    }
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
                  <p className="text-muted-foreground">
                    Gérez vos informations personnelles et vos préférences
                  </p>
                </div>

                {/* Profile Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Informations personnelles</CardTitle>
                        <CardDescription>
                          Mettez à jour vos informations de profil
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          placeholder="Jean"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          placeholder="Dupont"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>

                    {/* Pro fields */}
                    {(user?.role === 'PRO' || user?.role === 'ADMIN') && (
                      <>
                        <Separator className="my-4" />
                        <div className="flex items-center gap-2 mb-4">
                          <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Informations entreprise</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Nom de l'entreprise</Label>
                            <Input
                              id="companyName"
                              placeholder="ACME Corp"
                              value={profileForm.companyName}
                              onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="siret">SIRET</Label>
                            <Input
                              id="siret"
                              placeholder="12345678901234"
                              value={profileForm.siret}
                              onChange={(e) => setProfileForm({ ...profileForm, siret: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleProfileSave} disabled={isSavingProfile}>
                        {isSavingProfile ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Enregistrement...
                          </>
                        ) : (
                          'Enregistrer les modifications'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                        <MailIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle>Adresse email</CardTitle>
                        <CardDescription>
                          Email actuel : <span className="font-medium">{user?.email}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">Nouvelle adresse email</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        placeholder="nouveau@email.com"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailPassword">Mot de passe actuel</Label>
                      <Input
                        id="emailPassword"
                        type="password"
                        placeholder="Confirmez votre mot de passe"
                        value={emailForm.password}
                        onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleEmailChange} disabled={isSavingEmail}>
                        {isSavingEmail ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Mise à jour...
                          </>
                        ) : (
                          'Modifier l\'email'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Password Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                        <KeyIcon className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <CardTitle>Mot de passe</CardTitle>
                        <CardDescription>
                          Changez votre mot de passe pour sécuriser votre compte
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Mot de passe actuel</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        placeholder="Votre mot de passe actuel"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Minimum 6 caractères"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Répétez le nouveau mot de passe"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={handlePasswordChange} disabled={isSavingPassword}>
                        {isSavingPassword ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Modification...
                          </>
                        ) : (
                          'Changer le mot de passe'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
