"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect to the appropriate dashboard based on role
      switch (user.role) {
        case 'ADMIN':
          router.replace('/dashboard/admin')
          break
        case 'USER':
          router.replace('/dashboard/user')
          break
        case 'PRO':
        default:
          router.replace('/dashboard/pro')
          break
      }
    }
  }, [user, loading, router])

  // Show loading while redirecting
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
