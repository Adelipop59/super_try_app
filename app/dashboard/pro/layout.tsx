"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function ProLayout({
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
    }
  }, [user, loading, router])

  // Show nothing while checking auth or if wrong role
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Don't render content for USER role
  if (user?.role === 'USER') {
    return null
  }

  return <>{children}</>
}
