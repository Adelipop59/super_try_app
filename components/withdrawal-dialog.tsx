"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { api, Wallet } from "@/lib/api"
import { Loader2Icon, BanknoteIcon, GiftIcon } from "lucide-react"
import { toast } from "sonner"

interface WithdrawalDialogProps {
  wallet: Wallet
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function WithdrawalDialog({ wallet, open, onOpenChange, onSuccess }: WithdrawalDialogProps) {
  const [method, setMethod] = useState<"BANK_TRANSFER" | "GIFT_CARD">("BANK_TRANSFER")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Bank transfer fields
  const [iban, setIban] = useState("")
  const [bic, setBic] = useState("")
  const [accountName, setAccountName] = useState("")

  // Gift card fields
  const [provider, setProvider] = useState("")
  const [email, setEmail] = useState("")

  const minWithdrawal = 10
  const maxWithdrawal = wallet.balance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawalAmount = parseFloat(amount)

    if (isNaN(withdrawalAmount) || withdrawalAmount < minWithdrawal) {
      toast.error(`Le montant minimum est de ${minWithdrawal}€`)
      return
    }

    if (withdrawalAmount > maxWithdrawal) {
      toast.error("Solde insuffisant")
      return
    }

    try {
      setIsSubmitting(true)

      const data: any = {
        amount: withdrawalAmount,
        method,
      }

      if (method === "BANK_TRANSFER") {
        if (!iban.trim() || !bic.trim() || !accountName.trim()) {
          toast.error("Veuillez remplir tous les champs bancaires")
          return
        }
        data.bankDetails = {
          iban: iban.trim(),
          bic: bic.trim(),
          accountName: accountName.trim(),
        }
      } else {
        if (!provider.trim() || !email.trim()) {
          toast.error("Veuillez remplir tous les champs de carte cadeau")
          return
        }
        data.giftCardDetails = {
          provider: provider.trim(),
          email: email.trim(),
        }
      }

      await api.createWithdrawal(data)
      toast.success("Demande de retrait créée avec succès !")
      onOpenChange(false)
      onSuccess()

      // Reset form
      setAmount("")
      setIban("")
      setBic("")
      setAccountName("")
      setProvider("")
      setEmail("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de créer la demande de retrait")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Retirer des fonds</DialogTitle>
            <DialogDescription>
              Solde disponible: {wallet.balance.toFixed(2)} {wallet.currency}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Montant à retirer (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={minWithdrawal}
                max={maxWithdrawal}
                placeholder={`Min: ${minWithdrawal}€ - Max: ${maxWithdrawal.toFixed(2)}€`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Montant minimum: {minWithdrawal}€
              </p>
            </div>

            {/* Method Selection */}
            <div className="space-y-3">
              <Label>Méthode de retrait *</Label>
              <RadioGroup value={method} onValueChange={(value: any) => setMethod(value)} disabled={isSubmitting}>
                <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="BANK_TRANSFER" id="bank" />
                  <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                    <BanknoteIcon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Virement bancaire</p>
                      <p className="text-sm text-muted-foreground">Traitement: 3-5 jours ouvrés</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="GIFT_CARD" id="giftcard" />
                  <Label htmlFor="giftcard" className="flex items-center gap-2 cursor-pointer flex-1">
                    <GiftIcon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Carte cadeau</p>
                      <p className="text-sm text-muted-foreground">Traitement: 1-2 jours ouvrés</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Bank Transfer Fields */}
            {method === "BANK_TRANSFER" && (
              <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
                <h4 className="font-medium">Informations bancaires</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN *</Label>
                    <Input
                      id="iban"
                      type="text"
                      placeholder="FR76 1234 5678 9012 3456 7890 123"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      required={method === "BANK_TRANSFER"}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bic">BIC/SWIFT *</Label>
                    <Input
                      id="bic"
                      type="text"
                      placeholder="BNPAFRPP"
                      value={bic}
                      onChange={(e) => setBic(e.target.value)}
                      required={method === "BANK_TRANSFER"}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Nom du compte *</Label>
                    <Input
                      id="accountName"
                      type="text"
                      placeholder="John Doe"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required={method === "BANK_TRANSFER"}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Gift Card Fields */}
            {method === "GIFT_CARD" && (
              <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
                <h4 className="font-medium">Informations carte cadeau</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Fournisseur *</Label>
                    <Input
                      id="provider"
                      type="text"
                      placeholder="Amazon, Fnac, etc."
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      required={method === "GIFT_CARD"}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de réception *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={method === "GIFT_CARD"}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      La carte cadeau sera envoyée à cette adresse
                    </p>
                  </div>
                </div>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Créer la demande"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
