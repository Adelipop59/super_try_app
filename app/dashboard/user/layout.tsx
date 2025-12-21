"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect PRO to their dashboard
      if (user.role === 'PRO') {
        router.push('/dashboard')
      }
      // Redirect ADMIN to their dashboard
      if (user.role === 'ADMIN') {
        router.push('/dashboard/admin')
      }
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Don't render content for PRO or ADMIN role
  if (user?.role === 'PRO' || user?.role === 'ADMIN') {
    return null
  }

  return <>{children}</>
}
