"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api, Session } from "@/lib/api"
import { Loader2Icon, StarIcon, CheckCircle2Icon } from "lucide-react"
import { toast } from "sonner"

interface ValidateTestDialogProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ValidateTestDialog({ session, open, onOpenChange, onSuccess }: ValidateTestDialogProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Veuillez sélectionner une note")
      return
    }

    try {
      setIsSubmitting(true)
      await api.validateSession(session.id, rating, ratingComment.trim() || undefined)
      toast.success("Test validé avec succès ! Le testeur a été payé.")
      onOpenChange(false)
      onSuccess()
      setRating(0)
      setRatingComment("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de valider le test")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-600" />
              Valider le test
            </DialogTitle>
            <DialogDescription>
              {session.tester?.firstName} {session.tester?.lastName} - {session.campaign?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tester Info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="font-medium mb-2">Informations du test</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Testeur: </span>
                  <span className="font-medium">
                    {session.tester?.firstName} {session.tester?.lastName}
                  </span>
                </div>
                {session.actualPrice && (
                  <div>
                    <span className="text-muted-foreground">Prix d'achat: </span>
                    <span className="font-medium">{session.actualPrice}€</span>
                  </div>
                )}
              </div>
              {session.purchaseProof && (
                <div className="mt-3 pt-3 border-t">
                  <a
                    href={session.purchaseProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Voir la preuve d'achat →
                  </a>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label>Note du test *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    disabled={isSubmitting}
                  >
                    <StarIcon
                      className={`h-10 w-10 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-lg font-medium">
                    {rating} / 5
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Cette note reflète la qualité du test soumis par le testeur
              </p>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="ratingComment">Commentaire (optionnel)</Label>
              <Textarea
                id="ratingComment"
                placeholder="Expliquez votre note et donnez des retours au testeur..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Ce commentaire sera visible par le testeur
              </p>
            </div>

            {/* Payment Info */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-900 mb-2">
                <CheckCircle2Icon className="inline h-4 w-4 mr-1" />
                Paiement automatique
              </p>
              <p className="text-sm text-green-800">
                En validant ce test, le testeur recevra automatiquement sa récompense :
              </p>
              <ul className="text-sm text-green-800 mt-2 space-y-1 ml-4 list-disc">
                {session.campaign?.products?.[0] && (
                  <>
                    <li>Remboursement produit: {session.actualPrice || session.campaign.products[0].expectedPrice}€</li>
                    {session.actualShipping !== undefined && (
                      <li>Remboursement frais de port: {session.actualShipping}€</li>
                    )}
                    <li>Bonus: {session.campaign.products[0].bonus}€</li>
                  </>
                )}
              </ul>
              <p className="text-xs text-green-700 mt-2">
                Le paiement sera effectué via Stripe Transfer (si configuré) ou crédité dans le wallet du testeur
              </p>
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
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                "Valider et payer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
