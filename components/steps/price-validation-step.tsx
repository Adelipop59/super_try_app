"use client"

import { useState } from "react"
import { Step, StepProgress, api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2Icon, AlertCircleIcon, EuroIcon } from "lucide-react"
import { toast } from "sonner"

interface PriceValidationStepProps {
  step: Step
  progress?: StepProgress
  sessionId: string
  onComplete: () => void
  canComplete: { canComplete: boolean; reason?: string }
}

export function PriceValidationStep({ step, progress, sessionId, onComplete, canComplete }: PriceValidationStepProps) {
  const [price, setPrice] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Check if step can be completed
    if (!canComplete.canComplete) {
      toast.error(canComplete.reason || "Cette étape ne peut pas encore être complétée")
      return
    }

    const priceNumber = parseFloat(price)

    // Validation
    if (!price || isNaN(priceNumber)) {
      toast.error("Veuillez entrer un prix valide")
      return
    }

    if (priceNumber <= 0) {
      toast.error("Le prix doit être supérieur à 0")
      return
    }

    // Check if price is within range
    if (step.minPrice !== undefined && priceNumber < step.minPrice) {
      toast.error(`Le prix doit être au minimum ${step.minPrice.toFixed(2)}€`)
      return
    }

    if (step.maxPrice !== undefined && priceNumber > step.maxPrice) {
      toast.error(`Le prix doit être au maximum ${step.maxPrice.toFixed(2)}€`)
      return
    }

    try {
      setIsSubmitting(true)
      await api.completeStep(sessionId, step.id, {
        submissionData: {
          response: priceNumber,
          comment: `Prix validé : ${priceNumber}€`,
        },
      })
      toast.success("Prix validé avec succès ! Vous pouvez maintenant acheter le produit.")
      onComplete()
    } catch (error: any) {
      toast.error(error.message || "Impossible de valider le prix")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (progress?.isCompleted) {
    const submittedPrice = progress.submissionData?.price

    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 mt-3">
        <div className="flex items-start gap-3">
          <CheckCircle2Icon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-green-900">{step.title}</h4>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Validé
              </Badge>
            </div>
            {step.description && (
              <p className="text-sm text-green-800 mb-3">{step.description}</p>
            )}
            <div className="bg-white rounded-md p-3 border border-green-200">
              <p className="text-sm text-muted-foreground mb-1">Prix validé :</p>
              <p className="text-lg font-bold text-green-900">{submittedPrice?.toFixed(2)}€</p>
            </div>
            <p className="text-xs text-green-700 mt-2">
              ✓ Prix validé - Vous pouvez maintenant acheter le produit
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mt-3">
      <div className="space-y-4">
        {!canComplete.canComplete && (
          <div className="rounded-md bg-orange-50 border border-orange-200 p-3">
            <p className="text-sm text-orange-800">
              <strong>Étape bloquée :</strong> {canComplete.reason}
            </p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <AlertCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">{step.title}</h4>
            {step.description && (
              <p className="text-sm text-blue-800 mb-3">{step.description}</p>
            )}
          </div>
        </div>

        {/* Price Range Display */}
        {step.minPrice !== undefined && step.maxPrice !== undefined && (
          <div className="bg-white rounded-md p-3 border border-blue-300">
            <div className="flex items-center gap-2 mb-1">
              <EuroIcon className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Tranche de prix attendue :</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {step.minPrice.toFixed(2)}€ - {step.maxPrice.toFixed(2)}€
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Le prix du produit doit se situer dans cette tranche pour valider que vous avez trouvé le bon produit.
            </p>
          </div>
        )}

        {/* Price Input */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium text-blue-900">
            Entrez le prix exact du produit
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 49.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pr-8"
                disabled={isSubmitting}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !price || !canComplete.canComplete}
              className="min-w-[100px]"
            >
              {isSubmitting ? "Validation..." : "Valider"}
            </Button>
          </div>
          <p className="text-xs text-blue-700">
            💡 Assurez-vous d'avoir trouvé le bon produit avant de valider le prix
          </p>
        </div>
      </div>
    </div>
  )
}
