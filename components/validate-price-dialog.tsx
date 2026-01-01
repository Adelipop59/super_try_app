"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, Session } from "@/lib/api"
import { Loader2Icon, PackageIcon } from "lucide-react"
import { toast } from "sonner"

interface ValidatePriceDialogProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ValidatePriceDialog({ session, open, onOpenChange, onSuccess }: ValidatePriceDialogProps) {
  const [productPrice, setProductPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const price = parseFloat(productPrice)
    if (isNaN(price) || price <= 0) {
      toast.error("Veuillez entrer un prix valide")
      return
    }

    try {
      setIsSubmitting(true)
      await api.validatePrice(session.id, { productPrice: price })
      toast.success("Prix validé avec succès !")
      onOpenChange(false)
      onSuccess()
      setProductPrice("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de valider le prix")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5" />
              Valider le prix du produit
            </DialogTitle>
            <DialogDescription>
              Campagne: {session.campaign?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="productPrice">Prix du produit trouvé (€)</Label>
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
              <p className="text-xs text-muted-foreground">
                Indiquez le prix du produit que vous avez trouvé sur Amazon
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                "Valider le prix"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
