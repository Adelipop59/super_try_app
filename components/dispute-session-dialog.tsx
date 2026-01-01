"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { api, Session } from "@/lib/api"
import { Loader2Icon, AlertTriangleIcon, InfoIcon } from "lucide-react"
import { toast } from "sonner"

interface DisputeSessionDialogProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DisputeSessionDialog({ session, open, onOpenChange, onSuccess }: DisputeSessionDialogProps) {
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error("Veuillez indiquer la raison du litige")
      return
    }

    if (!description.trim()) {
      toast.error("Veuillez fournir une description détaillée")
      return
    }

    try {
      setIsSubmitting(true)
      await api.disputeSession(session.id, {
        reason: reason.trim(),
        description: description.trim(),
      })
      toast.success("Litige créé avec succès. Un administrateur examinera votre demande.")
      onOpenChange(false)
      onSuccess()
      setReason("")
      setDescription("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de créer le litige")
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
              <AlertTriangleIcon className="h-5 w-5 text-yellow-600" />
              Créer un litige
            </DialogTitle>
            <DialogDescription>
              Campagne: {session.campaign?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  À propos des litiges
                </p>
                <p className="text-sm text-blue-700">
                  Un litige est examiné par un administrateur. Fournissez autant de détails que possible pour faciliter la résolution.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Raison du litige *</Label>
              <Input
                id="reason"
                placeholder="ex: Refus de validation du test"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={isSubmitting}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Résumez brièvement le problème
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez en détail la situation, ce qui s'est passé, et pourquoi vous créez ce litige..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isSubmitting}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Plus vous fournirez de détails, plus vite le litige pourra être résolu
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
                  Création...
                </>
              ) : (
                "Créer le litige"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
