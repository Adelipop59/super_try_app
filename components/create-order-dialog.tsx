"use client"

import { useState } from "react"
import { api, ChatOrderType } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2Icon, VideoIcon, ImageIcon, CoinsIcon } from "lucide-react"
import { toast } from "sonner"

interface CreateOrderDialogProps {
  sessionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ORDER_TYPE_CONFIG = {
  UGC_REQUEST: {
    label: "Vidéo UGC",
    icon: VideoIcon,
    description: "Commander une vidéo de contenu généré par l'utilisateur",
    placeholder: "Ex: Vidéo de 30 secondes présentant les fonctionnalités principales...",
  },
  PHOTO_REQUEST: {
    label: "Photos supplémentaires",
    icon: ImageIcon,
    description: "Commander des photos supplémentaires du produit",
    placeholder: "Ex: 5 photos haute résolution sous différents angles...",
  },
  TIP: {
    label: "Pourboire",
    icon: CoinsIcon,
    description: "Envoyer un pourboire au testeur",
    placeholder: "Merci pour votre excellent travail !",
  },
}

export function CreateOrderDialog({ sessionId, open, onOpenChange, onSuccess }: CreateOrderDialogProps) {
  const [type, setType] = useState<ChatOrderType>("UGC_REQUEST")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [deliveryDeadline, setDeliveryDeadline] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const config = ORDER_TYPE_CONFIG[type]
  const Icon = config.icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount)

    // Validation du montant selon le type
    const minAmount = type === "TIP" ? 1 : 10 // UGC et Photos minimum 10€
    if (isNaN(amountNum) || amountNum < minAmount || amountNum > 10000) {
      toast.error(`Le montant doit être entre ${minAmount}€ et 10 000€`)
      return
    }

    if (!description.trim()) {
      toast.error("Veuillez fournir une description")
      return
    }

    // Validation de la deadline (si fournie, doit être au moins demain)
    if (deliveryDeadline) {
      const deadlineDate = new Date(deliveryDeadline)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      if (deadlineDate < tomorrow) {
        toast.error("La deadline doit être au moins demain")
        return
      }
    }

    try {
      setIsSubmitting(true)
      await api.createChatOrder(sessionId, {
        type,
        amount: amountNum,
        description: description.trim(),
        deliveryDeadline: deliveryDeadline || undefined,
      })

      toast.success("Commande envoyée au testeur !")
      onOpenChange(false)
      onSuccess()

      // Reset form
      setType("UGC_REQUEST")
      setAmount("")
      setDescription("")
      setDeliveryDeadline("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de créer la commande")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Commander une prestation</DialogTitle>
            <DialogDescription>
              Demandez au testeur de fournir du contenu supplémentaire ou envoyez un pourboire
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Type de commande */}
            <div className="space-y-2">
              <Label htmlFor="type">Type de prestation *</Label>
              <Select value={type} onValueChange={(value) => setType(value as ChatOrderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_TYPE_CONFIG).map(([key, config]) => {
                    const TypeIcon = config.icon
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>

            {/* Montant */}
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€) *</Label>
              <Input
                id="amount"
                type="number"
                min={type === "TIP" ? "1" : "10"}
                max="10000"
                step="0.01"
                placeholder={type === "TIP" ? "10.00" : "50.00"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                {type === "TIP"
                  ? "Le montant sera versé immédiatement au testeur"
                  : "Montant minimum 10€. L'argent sera bloqué sur votre carte bleue jusqu'à validation de la livraison"}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder={config.placeholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isSubmitting}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Décrivez en détail ce que vous attendez du testeur
              </p>
            </div>

            {/* Date limite (optionnel, sauf pour TIP) */}
            {type !== "TIP" && (
              <div className="space-y-2">
                <Label htmlFor="deadline">Date limite de livraison (optionnel)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deliveryDeadline}
                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                  disabled={isSubmitting}
                  min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                />
                <p className="text-xs text-muted-foreground">
                  Deadline minimum : demain. Si dépassée sans livraison, la commande sera annulée automatiquement
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Icon className="mr-2 h-4 w-4" />
                  Envoyer la commande
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
