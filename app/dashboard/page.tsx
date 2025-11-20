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
import { api, DashboardStats } from "@/lib/api"

import data from "./data.json"

export default function Page() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        setLoading(true)
        let dashboardStats: DashboardStats

        if (user.role === 'PRO' || user.role === 'ADMIN') {
          dashboardStats = await api.getProDashboardStats()
        } else {
          dashboardStats = await api.getDashboardStats()
        }

        setStats(dashboardStats)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
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
                />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
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
