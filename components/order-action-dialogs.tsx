"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2Icon, AlertCircleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { toast } from "sonner"

// Dialog pour rejeter une commande (USER)
interface RejectOrderDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RejectOrderDialog({ orderId, open, onOpenChange, onSuccess }: RejectOrderDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error("Veuillez indiquer une raison")
      return
    }

    try {
      setIsSubmitting(true)
      await api.rejectChatOrder(orderId, { rejectionReason: reason.trim() })
      toast.success("Commande refusée")
      onOpenChange(false)
      onSuccess()
      setReason("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de refuser la commande")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircleIcon className="h-5 w-5 text-red-600" />
              Refuser la commande
            </DialogTitle>
            <DialogDescription>
              Expliquez pourquoi vous refusez cette commande. Le vendeur sera remboursé.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Raison du refus *</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Le délai est trop court, le montant ne correspond pas au travail demandé..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={isSubmitting}
                rows={4}
              />
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
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Refus...
                </>
              ) : (
                "Refuser"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Dialog pour livrer une commande (USER)
interface DeliverOrderDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeliverOrderDialog({ orderId, open, onOpenChange, onSuccess }: DeliverOrderDialogProps) {
  const [files, setFiles] = useState<Array<{ url: string; filename: string; size: number; type: string }>>([])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddFile = () => {
    const newFile = {
      url: "",
      filename: "",
      size: 0,
      type: "",
    }
    setFiles([...files, newFile])
  }

  const handleFileChange = (index: number, field: string, value: string | number) => {
    const newFiles = [...files]
    newFiles[index] = { ...newFiles[index], [field]: value }
    setFiles(newFiles)
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error("Veuillez ajouter au moins un fichier")
      return
    }

    // Validation des fichiers
    for (let i = 0; i < files.length; i++) {
      if (!files[i].url.trim() || !files[i].filename.trim()) {
        toast.error(`Le fichier ${i + 1} est incomplet`)
        return
      }
    }

    try {
      setIsSubmitting(true)
      await api.deliverChatOrder(orderId, {
        deliveryProof: {
          files: files.map(f => ({
            url: f.url.trim(),
            filename: f.filename.trim(),
            size: f.size || 0,
            type: f.type.trim() || "application/octet-stream",
          })),
          notes: notes.trim() || undefined,
        },
      })
      toast.success("Commande livrée avec succès !")
      onOpenChange(false)
      onSuccess()
      setFiles([])
      setNotes("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de livrer la commande")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Livrer la commande</DialogTitle>
            <DialogDescription>
              Ajoutez les fichiers demandés (photos, vidéos, etc.) et des notes si nécessaire
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Fichiers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Fichiers *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFile}
                  disabled={isSubmitting}
                >
                  Ajouter un fichier
                </Button>
              </div>

              {files.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun fichier ajouté. Cliquez sur "Ajouter un fichier" pour commencer.
                </p>
              )}

              {files.map((file, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Fichier {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isSubmitting}
                    >
                      Supprimer
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`url-${index}`} className="text-xs">URL du fichier *</Label>
                    <Input
                      id={`url-${index}`}
                      placeholder="https://..."
                      value={file.url}
                      onChange={(e) => handleFileChange(index, "url", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor={`filename-${index}`} className="text-xs">Nom du fichier *</Label>
                      <Input
                        id={`filename-${index}`}
                        placeholder="video.mp4"
                        value={file.filename}
                        onChange={(e) => handleFileChange(index, "filename", e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`type-${index}`} className="text-xs">Type MIME</Label>
                      <Input
                        id={`type-${index}`}
                        placeholder="video/mp4"
                        value={file.type}
                        onChange={(e) => handleFileChange(index, "type", e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`size-${index}`} className="text-xs">Taille (octets)</Label>
                    <Input
                      id={`size-${index}`}
                      type="number"
                      placeholder="0"
                      value={file.size}
                      onChange={(e) => handleFileChange(index, "size", parseInt(e.target.value) || 0)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes additionnelles (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des commentaires sur la livraison..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
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
                  Livraison...
                </>
              ) : (
                "Livrer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Dialog pour valider une livraison (PRO)
interface ValidateOrderDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ValidateOrderDialog({ orderId, open, onOpenChange, onSuccess }: ValidateOrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      await api.validateChatOrder(orderId)
      toast.success("Livraison validée ! Le testeur va recevoir son paiement.")
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Impossible de valider la livraison")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-600" />
              Valider la livraison
            </DialogTitle>
            <DialogDescription>
              Confirmez que la livraison correspond à vos attentes. Le paiement sera capturé sur votre carte et transféré au testeur.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">⚠️ Action irréversible</p>
              <p className="text-sm text-muted-foreground">
                Une fois validée, le montant sera prélevé sur votre carte bleue et transféré au testeur.
                Si la livraison ne vous convient pas, cliquez sur "Annuler" et utilisez "Déclarer un litige" à la place.
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
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="mr-2 h-4 w-4" />
                  Valider la livraison
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Dialog pour déclarer un litige (PRO)
interface DisputeOrderDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DisputeOrderDialog({ orderId, open, onOpenChange, onSuccess }: DisputeOrderDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error("Veuillez indiquer une raison")
      return
    }

    try {
      setIsSubmitting(true)
      await api.disputeChatOrder(orderId, { disputeReason: reason.trim() })
      toast.success("Litige déclaré. Un administrateur examinera la situation.")
      onOpenChange(false)
      onSuccess()
      setReason("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de déclarer le litige")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5 text-orange-600" />
              Déclarer un litige
            </DialogTitle>
            <DialogDescription>
              Expliquez pourquoi la livraison ne correspond pas à vos attentes. L'argent restera bloqué et le testeur pourra re-livrer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="disputeReason">Raison du litige *</Label>
              <Textarea
                id="disputeReason"
                placeholder="Ex: Le contenu livré ne correspond pas à la description, la qualité est insuffisante..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={isSubmitting}
                rows={5}
              />
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
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Déclaration...
                </>
              ) : (
                "Déclarer le litige"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
