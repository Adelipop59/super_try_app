"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect USER to their dashboard
      if (user.role === 'USER') {
        router.push('/dashboard/user')
      }
      // Redirect PRO to their dashboard
      if (user.role === 'PRO') {
        router.push('/dashboard')
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

  // Only render for ADMIN role
  if (user?.role !== 'ADMIN') {
    return null
  }

  return <>{children}</>
}
