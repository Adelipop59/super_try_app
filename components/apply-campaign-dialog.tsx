"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api, EligibleCampaignFull } from "@/lib/api"
import {
  Loader2Icon,
  RocketIcon,
  PackageIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  ShoppingBagIcon,
  InfoIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ApplyCampaignDialogProps {
  campaign: EligibleCampaignFull | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ApplyCampaignDialog({ campaign, open, onOpenChange, onSuccess }: ApplyCampaignDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!campaign) return null

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await api.applyToCampaign({ campaignId: campaign.id })
      toast.success("Candidature envoyée avec succès !")
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/tester/sessions')
      }
    } catch (error: any) {
      const errorMessage = error.message?.toLowerCase() || ''
      if (errorMessage.includes('déjà postulé') || errorMessage.includes('already applied')) {
        toast.error("Vous avez déjà postulé à cette campagne")
      } else if (error.statusCode === 400) {
        toast.error(error.message || 'Impossible de postuler à cette campagne')
      } else {
        toast.error('Impossible de postuler à cette campagne')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <RocketIcon className="h-6 w-6 text-purple-600" />
            Participer au test
          </DialogTitle>
          <DialogDescription>
            Vérifiez les informations de la campagne avant de confirmer votre participation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Campaign Title & Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">{campaign.title}</h3>
            {campaign.description && (
              <p className="text-muted-foreground">{campaign.description}</p>
            )}
          </div>

          {/* Seller Info */}
          {campaign.seller && (
            <div className="flex items-center gap-2 text-sm">
              <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Vendeur: {campaign.seller.companyName || campaign.seller.email}
              </span>
            </div>
          )}

          {/* Campaign Details */}
          <div className="grid grid-cols-2 gap-4">
            {campaign.availableSlots !== undefined && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Places disponibles</p>
                  <p className="font-semibold">{campaign.availableSlots}</p>
                </div>
              </div>
            )}
            {campaign.startDate && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date de début</p>
                  <p className="font-semibold">
                    {new Date(campaign.startDate).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Products */}
          {campaign.products && campaign.products.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Produits à tester
              </h4>
              <div className="space-y-3">
                {campaign.products.map((item, idx) => (
                  <div key={idx} className="rounded-lg border p-4 space-y-3">
                    <div className="flex gap-4">
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-20 w-20 rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium">{item.product.name}</h5>
                        {item.product.category && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Catégorie: {item.product.category.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="flex flex-wrap gap-2">
                      {parseFloat(item.bonus) > 0 && (
                        <Badge className="bg-green-600">
                          <TrendingUpIcon className="mr-1 h-3 w-3" />
                          Bonus: {item.bonus}€
                        </Badge>
                      )}
                      {item.reimbursedPrice && (
                        <Badge variant="outline" className="border-blue-500 text-blue-600">
                          Prix remboursé
                        </Badge>
                      )}
                      {item.reimbursedShipping && (
                        <Badge variant="outline" className="border-purple-500 text-purple-600">
                          Frais de port remboursés
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Info */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2 text-sm">
              <p className="font-medium text-blue-900">Informations importantes</p>
              <ul className="space-y-1 text-blue-700 list-disc list-inside">
                <li>Votre candidature sera examinée par le vendeur</li>
                <li>Une fois accepté, vous devrez suivre les étapes du test</li>
                <li>Les récompenses seront créditées après validation finale</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <RocketIcon className="mr-2 h-4 w-4" />
                Confirmer ma participation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
