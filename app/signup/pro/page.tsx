"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProSignupRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la nouvelle page signup unifiée
    router.replace("/signup")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirection...</p>
    </div>
  )
}
