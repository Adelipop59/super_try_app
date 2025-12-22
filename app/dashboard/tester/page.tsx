"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, DashboardStats } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { TesterSectionCards } from "@/components/tester-section-cards"
import { TesterEarningsChart } from "@/components/tester-earnings-chart"
import { TesterSessionsTable } from "@/components/tester-sessions-table"

export default function TesterDashboardPage() {
  const { user } = useAuth()
  const { handleErrorWithRetry } = useErrorHandler()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    if (!user) return

    try {
      setLoading(true)

      // ✅ OPTIMIZED: Single unified request for all dashboard data
      const dashboardStats = await api.getDashboardStats()
      setStats(dashboardStats)
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
      {/* Stats Cards for Testers */}
      <TesterSectionCards
        stats={stats}
        loading={loading}
      />

      {/* Earnings Chart */}
      <div className="px-4 lg:px-6">
        <TesterEarningsChart
          loading={loading}
        />
      </div>

      {/* Recent Sessions Table */}
      <TesterSessionsTable />
    </div>
  )
}
