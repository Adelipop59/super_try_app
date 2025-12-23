"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2Icon, XCircleIcon, LoaderIcon, AlertCircleIcon } from "lucide-react"

type VerificationState = 'loading' | 'success' | 'pending' | 'failed' | 'error'

export default function VerificationReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [state, setState] = useState<VerificationState>('loading')
  const [failureReason, setFailureReason] = useState<string>()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = async () => {
    try {
      // Attendre 2 secondes pour laisser le webhook s'exécuter
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await api.getVerificationStatus()

      if (response.status === 'verified') {
        setState('success')
        // Redirection automatique après 5 secondes
        startCountdown()
      } else if (response.status === 'pending') {
        setState('pending')
      } else if (response.status === 'failed') {
        setState('failed')
        setFailureReason(response.failure_reason)
      } else {
        setState('error')
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
      setState('error')
    }
  }

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push('/dashboard/tester/profile')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleRetry = async () => {
    try {
      const response = await api.retryVerification()
      window.location.href = response.verification_url
    } catch (error: any) {
      console.error('Error retrying verification:', error)
    }
  }

  const handleCheckAgain = async () => {
    setState('loading')
    await checkVerificationStatus()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        {/* Loading State */}
        {state === 'loading' && (
          <Card className="border-blue-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <LoaderIcon className="h-8 w-8 text-blue-600 animate-spin" />
                <div>
                  <CardTitle className="text-blue-900">Vérification en cours...</CardTitle>
                  <CardDescription>
                    Nous vérifions votre identité
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Veuillez patienter pendant que nous récupérons le statut de votre vérification.
              </p>
              <div className="mt-4 h-2 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-pulse" style={{ width: '100%' }} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {state === 'success' && (
          <Card className="border-green-500 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2Icon className="h-12 w-12 text-green-600" />
                <div>
                  <CardTitle className="text-green-900 text-2xl">Vérification réussie !</CardTitle>
                  <CardDescription className="text-green-700">
                    Votre identité a été vérifiée avec succès
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-green-900">✅ Compte vérifié</p>
                <p className="text-sm text-muted-foreground">
                  Vous avez maintenant accès à toutes les fonctionnalités :
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Voir les détails complets des campagnes</li>
                  <li>• Postuler aux campagnes</li>
                  <li>• Participer aux sessions de test</li>
                  <li>• Recevoir des récompenses</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm text-center text-muted-foreground">
                  Redirection automatique dans <strong>{countdown}</strong> seconde{countdown > 1 ? 's' : ''}...
                </p>
                <Button
                  onClick={() => router.push('/dashboard/tester/profile')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Aller au profil maintenant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/tester/campaigns')}
                  className="w-full"
                >
                  Voir les campagnes disponibles
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending State */}
        {state === 'pending' && (
          <Card className="border-blue-500 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircleIcon className="h-10 w-10 text-blue-600" />
                <div>
                  <CardTitle className="text-blue-900">Vérification en cours</CardTitle>
                  <CardDescription className="text-blue-700">
                    Votre vérification est en cours de traitement
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  ⏳ La vérification de votre identité est en cours. Cela prend généralement 1 à 2 minutes.
                </p>
                <p className="text-sm text-muted-foreground">
                  Vous pouvez fermer cette page et revenir plus tard. Vous recevrez une notification une fois la vérification terminée.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCheckAgain}
                  variant="outline"
                  className="w-full"
                >
                  Vérifier à nouveau
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/tester/profile')}
                  variant="ghost"
                  className="w-full"
                >
                  Retour au profil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed State */}
        {state === 'failed' && (
          <Card className="border-red-500 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <XCircleIcon className="h-10 w-10 text-red-600" />
                <div>
                  <CardTitle className="text-red-900">Vérification échouée</CardTitle>
                  <CardDescription className="text-red-700">
                    La vérification n'a pas pu être complétée
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-red-900">Raison de l'échec :</p>
                <p className="text-sm text-muted-foreground">
                  {failureReason || "Le document d'identité fourni n'a pas pu être vérifié. Assurez-vous que le document est valide, lisible et non expiré."}
                </p>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Conseils pour réussir la vérification :
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Utilisez un document d'identité valide (CNI, passeport, permis)</li>
                    <li>• Assurez-vous que le document est bien éclairé</li>
                    <li>• Évitez les reflets et les ombres</li>
                    <li>• Le document doit être entièrement visible</li>
                    <li>• Utilisez un document non expiré</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleRetry}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Réessayer la vérification
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/tester/profile')}
                  variant="outline"
                  className="w-full"
                >
                  Retour au profil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {state === 'error' && (
          <Card className="border-orange-500 bg-orange-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircleIcon className="h-10 w-10 text-orange-600" />
                <div>
                  <CardTitle className="text-orange-900">Erreur de connexion</CardTitle>
                  <CardDescription className="text-orange-700">
                    Impossible de vérifier le statut
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Une erreur s'est produite lors de la récupération du statut de vérification.
                  Veuillez vérifier votre connexion internet et réessayer.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCheckAgain}
                  className="w-full"
                >
                  Réessayer
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/tester/profile')}
                  variant="outline"
                  className="w-full"
                >
                  Retour au profil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Vos données sont sécurisées et traitées par Stripe Identity
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Conformément au RGPD et aux normes de sécurité
          </p>
        </div>
      </div>
    </div>
  )
}
