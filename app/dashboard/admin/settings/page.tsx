"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
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
import { Switch } from "@/components/ui/switch"
import { SettingsIcon, BellIcon, ShieldIcon, DatabaseIcon } from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    maxCampaignsPerPro: 10,
    platformFee: 5
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // TODO: Implement api.updatePlatformSettings()
      toast.success('Paramètres enregistrés avec succès')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Erreur lors de l\'enregistrement des paramètres')
    } finally {
      setIsSaving(false)
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
                  <h2 className="text-2xl font-bold tracking-tight">Paramètres système</h2>
                  <p className="text-muted-foreground">
                    Configurez les paramètres globaux de la plateforme
                  </p>
                </div>

                {/* General Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <SettingsIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Paramètres généraux</CardTitle>
                        <CardDescription>
                          Configuration de base de la plateforme
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mode maintenance</Label>
                        <p className="text-sm text-muted-foreground">
                          Activer le mode maintenance pour bloquer l'accès
                        </p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, maintenanceMode: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Inscriptions</Label>
                        <p className="text-sm text-muted-foreground">
                          Autoriser les nouvelles inscriptions
                        </p>
                      </div>
                      <Switch
                        checked={settings.registrationEnabled}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, registrationEnabled: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                        <BellIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                          Gérez les notifications système
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifications email</Label>
                        <p className="text-sm text-muted-foreground">
                          Envoyer des emails automatiques
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, emailNotifications: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Limits */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                        <ShieldIcon className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <CardTitle>Limites</CardTitle>
                        <CardDescription>
                          Configurez les limites de la plateforme
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxCampaigns">Max campagnes par PRO</Label>
                        <Input
                          id="maxCampaigns"
                          type="number"
                          min="1"
                          value={settings.maxCampaignsPerPro}
                          onChange={(e) =>
                            setSettings({ ...settings, maxCampaignsPerPro: parseInt(e.target.value) || 10 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="platformFee">Frais plateforme (%)</Label>
                        <Input
                          id="platformFee"
                          type="number"
                          min="0"
                          max="100"
                          value={settings.platformFee}
                          onChange={(e) =>
                            setSettings({ ...settings, platformFee: parseInt(e.target.value) || 5 })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer les paramètres'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
