"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TesterSidebar } from "@/components/tester-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  // Choose sidebar based on role
  const SidebarComponent = user?.role === 'USER' ? TesterSidebar : AppSidebar

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <SidebarComponent variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
