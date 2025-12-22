"use client"

import { useEffect, useState } from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { useAuth } from "@/contexts/auth-context"
import { api, DashboardStats, ProOverviewStats } from "@/lib/api"
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

      // ✅ OPTIMIZED: Single unified request for all dashboard data
      const dashboardStats = await api.getDashboardStats()
      setStats(dashboardStats)

      // For PRO users, set proOverview from the unified response
      if (user.role === 'PRO' || user.role === 'ADMIN') {
        setProOverview({
          totalProducts: dashboardStats.totalProducts || 0,
          totalCampaigns: dashboardStats.totalCampaigns || 0,
          testsInProgress: dashboardStats.testsInProgress || 0,
          testsDone: dashboardStats.testsDone || 0,
          totalSpent: dashboardStats.totalSpent || 0,
          spendingChart: dashboardStats.spendingChart || []
        })
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
  )
}
