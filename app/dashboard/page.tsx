"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      if (user.role === 'USER') {
        router.replace('/dashboard/tester')
      } else if (user.role === 'PRO') {
        router.replace('/dashboard/pro')
      } else if (user.role === 'ADMIN') {
        router.replace('/dashboard/admin')
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirection...</p>
      </div>
    </div>
  )
}
