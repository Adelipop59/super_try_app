"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api, DashboardStats, ProOverviewStats, SpendingChartData } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"

import data from "@/lib/data/mock-data.json"

export default function Page() {
  const { user } = useAuth()
  const { handleErrorWithRetry } = useErrorHandler()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [proOverview, setProOverview] = useState<ProOverviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    if (!user) return

    try {
      setLoading(true)

      if (user.role === 'PRO' || user.role === 'ADMIN') {
        // Fetch PRO overview with spending chart
        const overview = await api.getProOverview()
        setProOverview(overview)

        // Also fetch wallet balance for PRO users
        const walletBalance = await api.getWalletBalance().catch(() => ({ balance: 0, currency: 'EUR' }))

        // Convert to DashboardStats format for SectionCards compatibility
        setStats({
          totalSessions: overview.testsInProgress + overview.testsDone,
          activeSessions: overview.testsInProgress,
          completedSessions: overview.testsDone,
          pendingSessions: 0,
          totalCampaigns: overview.totalCampaigns,
          activeCampaigns: undefined,
          totalProducts: overview.totalProducts,
          balance: walletBalance.balance
        })
      } else {
        const dashboardStats = await api.getDashboardStats()
        setStats(dashboardStats)
      }
    } catch (error) {
      // Use the error handler with retry functionality
      handleErrorWithRetry(
        error,
        fetchStats,
        'Impossible de charger les statistiques du tableau de bord.'
      )

      // Set default stats on error
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

  useEffect(() => {
    fetchStats()
  }, [user])

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards
                  stats={stats}
                  userRole={user?.role}
                  loading={loading}
                  proOverview={proOverview}
                />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive
                    spendingData={proOverview?.spendingChart}
                    userRole={user?.role}
                    loading={loading}
                  />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
