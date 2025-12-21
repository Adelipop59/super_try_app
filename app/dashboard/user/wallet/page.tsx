"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api, DashboardStats } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletIcon, ArrowUpIcon, ArrowDownIcon, BanknoteIcon } from "lucide-react"

export default function UserWalletPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        const dashboardStats = await api.getDashboardStats()
        setStats(dashboardStats)
        // TODO: Implement api.getUserTransactions()
        setTransactions([])
      } catch (error) {
        console.error('Failed to fetch wallet data:', error)
        setStats({
          totalSessions: 0,
          activeSessions: 0,
          completedSessions: 0,
          pendingSessions: 0,
          balance: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
                  <h2 className="text-2xl font-bold tracking-tight">Mon portefeuille</h2>
                  <p className="text-muted-foreground">
                    Gérez vos gains et retraits
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <>
                    {/* Balance Card */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm font-medium">Solde disponible</CardTitle>
                            <CardDescription>
                              Votre solde actuel
                            </CardDescription>
                          </div>
                          <WalletIcon className="h-8 w-8 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">
                          {formatCurrency(stats?.balance || 0)}
                        </div>
                        <Button>
                          <BanknoteIcon className="mr-2 h-4 w-4" />
                          Demander un retrait
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Statistics */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Gains totaux</CardTitle>
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(0)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Depuis votre inscription
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Retraits</CardTitle>
                          <ArrowDownIcon className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(0)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Total des retraits effectués
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Transaction History */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Historique des transactions</CardTitle>
                        <CardDescription>
                          Vos gains et retraits récents
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {transactions.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Aucune transaction pour le moment
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {transactions.map((transaction) => (
                              <div key={transaction.id} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{transaction.description}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
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
