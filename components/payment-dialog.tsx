"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { api, Campaign, CheckoutSessionResponse, ApiError, CampaignCostResponse } from "@/lib/api"
import { CreditCardIcon, Loader2Icon, AlertCircleIcon, ExternalLinkIcon, PackageIcon } from "lucide-react"

interface PaymentDialogProps {
  campaign: Campaign | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentSuccess: () => void
}

export function PaymentDialog({
  campaign,
  open,
  onOpenChange,
}: PaymentDialogProps) {
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSessionResponse | null>(null)
  const [costDetails, setCostDetails] = useState<CampaignCostResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string[]>([])

  useEffect(() => {
    if (open && campaign) {
      loadCostDetailsAndCreateSession()
    } else {
      // Reset state when dialog closes
      setCheckoutSession(null)
      setCostDetails(null)
      setError(null)
      setErrorDetails([])
      setIsRedirecting(false)
    }
  }, [open, campaign])

  const loadCostDetailsAndCreateSession = async () => {
    if (!campaign) return

    setIsLoading(true)
    setError(null)
    setErrorDetails([])

    try {
      // Charger les détails du coût
      const costResponse = await api.getCampaignCost(campaign.id)
      setCostDetails(costResponse)

      // Construire les URLs complètes
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
      const successUrl = `${baseUrl}/dashboard/pro/campaigns?payment=success&campaign=${campaign.id}`
      const cancelUrl = `${baseUrl}/dashboard/pro/campaigns?payment=cancelled&campaign=${campaign.id}`

      const response = await api.createCheckoutSession(campaign.id, {
        successUrl,
        cancelUrl,
      })
      setCheckoutSession(response)
    } catch (err) {
      console.error("Failed to create checkout session:", err)

      // Check if it's an ApiError (has errors array)
      const apiErr = err as ApiError
      if (apiErr && apiErr.errors && Array.isArray(apiErr.errors) && apiErr.errors.length > 0) {
        setError(apiErr.message || "Validation échouée")
        setErrorDetails(apiErr.errors)
      } else {
        const errorMessage = err instanceof Error ? err.message : "Impossible de créer le paiement"
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePay = () => {
    if (checkoutSession?.checkoutUrl) {
      setIsRedirecting(true)
      window.location.href = checkoutSession.checkoutUrl
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Activer la campagne
          </DialogTitle>
          <DialogDescription>
            Finalisez le paiement pour activer votre campagne et la rendre visible aux testeurs.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Préparation du paiement...
            </p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-6 px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircleIcon className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="mt-4 font-semibold text-destructive">Impossible d'activer la campagne</h3>

            {errorDetails.length > 0 ? (
              <div className="mt-4 w-full max-w-sm">
                <p className="text-sm text-muted-foreground mb-2">Veuillez corriger les éléments suivants :</p>
                <ul className="space-y-2">
                  {errorDetails.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive mt-0.5">•</span>
                      <span className="text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-2 text-sm text-center text-muted-foreground max-w-sm">{error}</p>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}

        {checkoutSession && costDetails && !isLoading && !error && (
          <div className="space-y-6">
            {/* Campagne info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Campagne</span>
                <span className="font-medium">{costDetails.campaignTitle}</span>
              </div>
            </div>

            {/* Détails par produit/offre */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Détails du coût</h4>
              {costDetails.offers.map((offer, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <PackageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{offer.productName}</span>
                    <span className="text-xs text-muted-foreground">× {offer.quantity}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix produit :</span>
                      <span>{formatAmount(offer.expectedPrice * 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frais de livraison :</span>
                      <span>{formatAmount(offer.shippingCost * 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bonus testeur :</span>
                      <span className="text-green-600">+{formatAmount(offer.bonus * 100)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-medium">
                      <span>Coût unitaire :</span>
                      <span>{formatAmount(offer.costPerUnit * 100)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total ({offer.quantity} × {formatAmount(offer.costPerUnit * 100)}) :</span>
                      <span className="text-primary">{formatAmount(offer.totalCost * 100)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total campagne */}
            <div className="rounded-lg border bg-primary/5 p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Coût total de la campagne</span>
                <span className="text-2xl font-bold text-primary">{formatAmount(costDetails.totalCampaignCostCents)}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Vous allez être redirigé vers la page de paiement sécurisée Stripe.
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isRedirecting}
              >
                Annuler
              </Button>
              <Button
                onClick={handlePay}
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                    Payer {formatAmount(costDetails.totalCampaignCostCents)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
