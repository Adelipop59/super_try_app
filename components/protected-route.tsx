"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('USER' | 'PRO' | 'ADMIN')[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect based on role if user doesn't have permission
      if (user.role === 'USER') {
        router.push('/dashboard/tester')
      } else if (user.role === 'PRO') {
        router.push('/dashboard/pro')
      } else if (user.role === 'ADMIN') {
        router.push('/dashboard/admin')
      }
    }
  }, [user, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check role permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Accès refusé</p>
          <p className="mt-2 text-muted-foreground">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
