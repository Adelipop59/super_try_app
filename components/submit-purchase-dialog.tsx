"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, Session } from "@/lib/api"
import { Loader2Icon, ShoppingCartIcon } from "lucide-react"
import { toast } from "sonner"

interface SubmitPurchaseDialogProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SubmitPurchaseDialog({ session, open, onOpenChange, onSuccess }: SubmitPurchaseDialogProps) {
  const [purchaseProofUrl, setPurchaseProofUrl] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [shippingCost, setShippingCost] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const price = parseFloat(productPrice)
    const shipping = parseFloat(shippingCost)

    if (isNaN(price) || price <= 0) {
      toast.error("Veuillez entrer un prix valide")
      return
    }

    if (isNaN(shipping) || shipping < 0) {
      toast.error("Veuillez entrer des frais de port valides")
      return
    }

    if (!purchaseProofUrl.trim()) {
      toast.error("Veuillez fournir une preuve d'achat (URL)")
      return
    }

    if (!orderNumber.trim()) {
      toast.error("Veuillez entrer le numéro de commande")
      return
    }

    try {
      setIsSubmitting(true)
      await api.submitPurchase(session.id, {
        purchaseProofUrl: purchaseProofUrl.trim(),
        orderNumber: orderNumber.trim(),
        productPrice: price,
        shippingCost: shipping,
      })
      toast.success("Achat soumis avec succès !")
      onOpenChange(false)
      onSuccess()
      setPurchaseProofUrl("")
      setOrderNumber("")
      setProductPrice("")
      setShippingCost("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de soumettre l'achat")
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
              <ShoppingCartIcon className="h-5 w-5" />
              Soumettre la preuve d'achat
            </DialogTitle>
            <DialogDescription>
              Campagne: {session.campaign?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseProofUrl">Preuve d'achat (URL) *</Label>
              <Input
                id="purchaseProofUrl"
                type="url"
                placeholder="https://..."
                value={purchaseProofUrl}
                onChange={(e) => setPurchaseProofUrl(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Lien vers votre capture d'écran ou reçu d'achat
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNumber">Numéro de commande *</Label>
              <Input
                id="orderNumber"
                type="text"
                placeholder="AMZ-12345-FR"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Le numéro de votre commande (requis pour validation)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productPrice">Prix payé (€) *</Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="99.99"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingCost">Frais de port (€) *</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="5.99"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Soumission...
                </>
              ) : (
                "Soumettre l'achat"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
