"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api, Session } from "@/lib/api"
import { Loader2Icon, CheckCircle2Icon, XCircleIcon, PackageIcon, EuroIcon } from "lucide-react"
import { toast } from "sonner"

interface ValidatePurchaseDialogProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ValidatePurchaseDialog({ session, open, onOpenChange, onSuccess }: ValidatePurchaseDialogProps) {
  const [action, setAction] = useState<'validate' | 'reject'>('validate')
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (action === 'reject' && !comment.trim()) {
      toast.error("Veuillez indiquer la raison du refus")
      return
    }

    try {
      setIsSubmitting(true)

      if (action === 'validate') {
        await api.validatePurchase(session.id, comment.trim() || undefined)
        toast.success("Achat validé avec succès !")
      } else {
        await api.rejectPurchase(session.id, comment.trim())
        toast.success("Achat refusé")
      }

      onOpenChange(false)
      onSuccess()
      setComment("")
      setAction('validate')
    } catch (error: any) {
      toast.error(error.message || `Impossible de ${action === 'validate' ? 'valider' : 'refuser'} l'achat`)
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
              <PackageIcon className="h-5 w-5 text-blue-600" />
              Valider l'achat
            </DialogTitle>
            <DialogDescription>
              {session.tester?.firstName} {session.tester?.lastName} - {session.campaign?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Purchase Info */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <p className="font-medium mb-2">Informations de l'achat</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Testeur: </span>
                  <span className="font-medium">
                    {session.tester?.firstName} {session.tester?.lastName}
                  </span>
                </div>

                {session.orderNumber && (
                  <div>
                    <span className="text-muted-foreground">N° de commande: </span>
                    <span className="font-medium font-mono">{session.orderNumber}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {session.actualPrice !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Prix d'achat: </span>
                    <span className="font-medium">{session.actualPrice.toFixed(2)}€</span>
                  </div>
                )}

                {session.actualShipping !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Frais de livraison: </span>
                    <span className="font-medium">{session.actualShipping.toFixed(2)}€</span>
                  </div>
                )}
              </div>

              {(session.actualPrice !== undefined && session.actualShipping !== undefined) && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-sm">Total: </span>
                  <span className="font-bold text-lg">
                    {(session.actualPrice + session.actualShipping).toFixed(2)}€
                  </span>
                </div>
              )}

              {session.purchaseProof && (
                <div className="pt-3 border-t">
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

            {/* Action Selection */}
            <div className="space-y-3">
              <Label>Action</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={action === 'validate' ? 'default' : 'outline'}
                  onClick={() => setAction('validate')}
                  disabled={isSubmitting}
                  className={action === 'validate' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle2Icon className="h-4 w-4 mr-2" />
                  Valider l'achat
                </Button>
                <Button
                  type="button"
                  variant={action === 'reject' ? 'destructive' : 'outline'}
                  onClick={() => setAction('reject')}
                  disabled={isSubmitting}
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Refuser l'achat
                </Button>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">
                {action === 'validate' ? 'Commentaire (optionnel)' : 'Raison du refus *'}
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  action === 'validate'
                    ? "Ex: Numéro de commande vérifié sur Amazon"
                    : "Expliquez pourquoi vous refusez cet achat..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="resize-none"
              />
              {action === 'reject' && (
                <p className="text-xs text-red-600">
                  Le testeur recevra cette raison par notification
                </p>
              )}
            </div>

            {/* Info Box */}
            {action === 'validate' ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-900 mb-2">
                  <CheckCircle2Icon className="inline h-4 w-4 mr-1" />
                  Validation de l'achat
                </p>
                <p className="text-sm text-green-800">
                  En validant cet achat, vous confirmez que le testeur a bien acheté le produit et peut commencer les procédures.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-900 mb-2">
                  <XCircleIcon className="inline h-4 w-4 mr-1" />
                  Refus de l'achat
                </p>
                <p className="text-sm text-red-800">
                  Le testeur devra soumettre à nouveau sa preuve d'achat avec les bonnes informations.
                </p>
              </div>
            )}
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
              disabled={isSubmitting || (action === 'reject' && !comment.trim())}
              className={action === 'validate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  {action === 'validate' ? 'Validation...' : 'Refus...'}
                </>
              ) : (
                action === 'validate' ? 'Valider' : 'Refuser'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
