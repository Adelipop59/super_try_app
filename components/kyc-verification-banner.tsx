"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheckIcon, AlertCircleIcon, CheckCircle2Icon, XCircleIcon, RefreshCwIcon } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface KycVerificationBannerProps {
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'failed'
  failureReason?: string
  onStatusChange?: () => void
  compact?: boolean
  autoFetch?: boolean // Fetch status from backend on mount
  hideIfVerified?: boolean // Hide banner completely if verified (for campaigns page)
}

export function KycVerificationBanner({
  verificationStatus: initialStatus = 'unverified',
  failureReason: initialFailureReason,
  onStatusChange,
  compact = false,
  autoFetch = false,
  hideIfVerified = false
}: KycVerificationBannerProps) {
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(initialStatus)
  const [failureReason, setFailureReason] = useState(initialFailureReason)
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)

  // Auto-fetch status from backend on mount if enabled
  useEffect(() => {
    if (autoFetch && !fetched) {
      fetchStatus()
    }
  }, [autoFetch])

  // Update local state when props change
  useEffect(() => {
    if (!autoFetch) {
      setVerificationStatus(initialStatus)
      setFailureReason(initialFailureReason)
      setFetched(true)
    }
  }, [initialStatus, initialFailureReason, autoFetch])

  const fetchStatus = async () => {
    try {
      setFetching(true)
      const response = await api.getVerificationStatus()
      setVerificationStatus(response.status as any)
      setFailureReason(response.failure_reason)
      setFetched(true)
    } catch (error) {
      console.error('Error fetching verification status:', error)
      setFetched(true)
    } finally {
      setFetching(false)
    }
  }

  // Don't render anything until we have the real status from backend
  if (autoFetch && !fetched) {
    return null
  }

  // Hide banner if verified and hideIfVerified is true (for campaigns page)
  if (hideIfVerified && verificationStatus === 'verified') {
    return null
  }

  // Unified handler: initiates new OR continues existing verification
  const handleInitiateVerification = async () => {
    try {
      setLoading(true)
      // Backend automatically returns existing URL if session in progress
      const response = await api.initiateVerification()
      window.location.href = response.verification_url
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'initialisation de la vérification")
    } finally {
      setLoading(false)
    }
  }

  const handleRetryVerification = async () => {
    try {
      setLoading(true)
      const response = await api.retryVerification()
      window.location.href = response.verification_url
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la réinitialisation de la vérification")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    try {
      setCheckingStatus(true)
      const response = await api.getVerificationStatus()

      // Update local state
      setVerificationStatus(response.status as any)
      setFailureReason(response.failure_reason)

      // Show status message
      const statusMessages = {
        verified: '✅ Vérifié avec succès !',
        pending: '⏳ En cours de traitement',
        failed: '❌ Échec de la vérification',
        unverified: 'ℹ️ Non vérifié'
      }
      toast.success(statusMessages[response.status as keyof typeof statusMessages] || `Statut: ${response.status}`)

      if (onStatusChange) {
        setTimeout(() => {
          onStatusChange()
        }, 1000)
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la vérification du statut")
    } finally {
      setCheckingStatus(false)
    }
  }

  // Verified status - success banner
  if (verificationStatus === 'verified') {
    return (
      <Card className={`border-green-500 bg-green-50 ${compact ? 'p-3' : ''}`}>
        <CardHeader className={compact ? 'p-0 pb-2' : ''}>
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : ''}`}>
            <CheckCircle2Icon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-green-600`} />
            <span className="text-green-900">Compte vérifié</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? 'p-0' : ''}>
          <p className="text-sm text-green-700">
            ✅ Votre identité a été vérifiée avec succès. Vous avez accès à toutes les campagnes.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Pending status - info banner
  if (verificationStatus === 'pending') {
    return (
      <Card className={`border-blue-500 bg-blue-50 ${compact ? 'p-3' : ''}`}>
        <CardHeader className={compact ? 'p-0 pb-2' : ''}>
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : ''}`}>
            <AlertCircleIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
            <span className="text-blue-900">Vérification en cours</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? 'p-0' : ''}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                ⏳ Votre vérification est en cours de traitement (généralement 1-2 minutes).
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Vous pouvez continuer votre vérification ou actualiser le statut.
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                onClick={handleInitiateVerification}
                disabled={loading}
                variant="default"
                size={compact ? "sm" : "default"}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ShieldCheckIcon className={`${compact ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />
                {loading ? "Chargement..." : "Continuer"}
              </Button>
              <Button
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                variant="outline"
                size={compact ? "sm" : "default"}
                className="border-blue-600 text-blue-600 hover:bg-blue-100"
              >
                <RefreshCwIcon className={`${compact ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />
                {checkingStatus ? "..." : "Actualiser"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Failed status - error banner
  if (verificationStatus === 'failed') {
    return (
      <Card className={`border-red-500 bg-red-50 ${compact ? 'p-3' : ''}`}>
        <CardHeader className={compact ? 'p-0 pb-2' : ''}>
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : ''}`}>
            <XCircleIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-red-600`} />
            <span className="text-red-900">Vérification échouée</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? 'p-0' : ''}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-red-700">
                ❌ La vérification a échoué. Veuillez réessayer avec un document d'identité valide.
              </p>
              {failureReason && (
                <p className="text-sm text-red-600 mt-1">
                  <strong>Raison:</strong> {failureReason}
                </p>
              )}
            </div>
            <Button
              onClick={handleRetryVerification}
              disabled={loading}
              variant="destructive"
              size={compact ? "sm" : "default"}
              className="ml-4"
            >
              <RefreshCwIcon className={`${compact ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />
              {loading ? "Chargement..." : "Réessayer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Unverified status - warning banner (default)
  return (
    <Card className={`border-orange-500 bg-orange-50 ${compact ? 'p-3' : ''}`}>
      <CardHeader className={compact ? 'p-0 pb-2' : ''}>
        <CardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : ''}`}>
          <AlertCircleIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-orange-600`} />
          <span className="text-orange-900">Vérification KYC requise</span>
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? 'p-0' : ''}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-orange-700">
              🔒 Complétez votre vérification KYC pour voir les détails complets des campagnes et pouvoir postuler.
            </p>
            {!compact && (
              <p className="text-sm text-orange-600 mt-1">
                Sans vérification, vous pouvez seulement voir un aperçu limité (maximum 50 campagnes).
              </p>
            )}
          </div>
          <Button
            onClick={handleInitiateVerification}
            disabled={loading}
            size={compact ? "sm" : "default"}
            className="ml-4 bg-orange-600 hover:bg-orange-700"
          >
            <ShieldCheckIcon className={`${compact ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />
            {loading ? "Chargement..." : "Vérifier mon identité"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
