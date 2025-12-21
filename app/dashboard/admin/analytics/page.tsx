"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUpIcon, UsersIcon, MegaphoneIcon, DollarSignIcon } from "lucide-react"

export default function AdminAnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    newUsersThisMonth: 0,
    newCampaignsThisMonth: 0,
    revenueThisMonth: 0,
    growthRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return

      try {
        setLoading(true)
        // TODO: Implement api.getAdminAnalytics()
        setStats({
          newUsersThisMonth: 0,
          newCampaignsThisMonth: 0,
          revenueThisMonth: 0,
          growthRate: 0
        })
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Statistiques</h2>
                  <p className="text-muted-foreground">
                    Analysez les performances de la plateforme
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Nouveaux utilisateurs</CardTitle>
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
                          <p className="text-xs text-muted-foreground">
                            Ce mois-ci
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Nouvelles campagnes</CardTitle>
                          <MegaphoneIcon className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.newCampaignsThisMonth}</div>
                          <p className="text-xs text-muted-foreground">
                            Ce mois-ci
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                          <DollarSignIcon className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(stats.revenueThisMonth)}</div>
                          <p className="text-xs text-muted-foreground">
                            Ce mois-ci
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Croissance</CardTitle>
                          <TrendingUpIcon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.growthRate}%</div>
                          <p className="text-xs text-muted-foreground">
                            vs mois dernier
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Placeholder for charts */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Graphiques</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px] flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                          Les graphiques d'analyse seront affichés ici.
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
