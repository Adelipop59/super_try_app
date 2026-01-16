"use client"

import { useState } from "react"
import { api, Session } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2Icon, CheckCircle2Icon } from "lucide-react"
import { toast } from "sonner"

interface CloseSessionDialogProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CloseSessionDialog({ session, open, onOpenChange, onSuccess }: CloseSessionDialogProps) {
  const [closingMessage, setClosingMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      await api.closeSession(session.id, closingMessage.trim() || undefined)
      toast.success("Session terminée avec succès !")
      onOpenChange(false)
      onSuccess()
      setClosingMessage("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de terminer la session")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-600" />
              Terminer la session
            </DialogTitle>
            <DialogDescription>
              Confirmez que vous souhaitez clôturer définitivement cette session. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Message de clôture */}
            <div className="space-y-2">
              <Label htmlFor="closingMessage">Message de clôture (optionnel)</Label>
              <Textarea
                id="closingMessage"
                placeholder="Merci pour votre excellent travail !"
                value={closingMessage}
                onChange={(e) => setClosingMessage(e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Ajoutez un message de remerciement pour le testeur
              </p>
            </div>

            {/* Informations */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <p className="text-sm font-medium text-blue-900">Ce qui va se passer :</p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>La session passera au statut COMPLETED</li>
                <li>Les paiements en attente seront traités</li>
                <li>Le testeur recevra une notification</li>
                <li>Vous pourrez noter le testeur si ce n'est pas déjà fait</li>
              </ul>
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
                  Clôture...
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="mr-2 h-4 w-4" />
                  Terminer la session
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
