"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api, Session } from "@/lib/api"
import { Loader2Icon, BanIcon, AlertCircleIcon } from "lucide-react"
import { toast } from "sonner"

interface CancelSessionDialogProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CancelSessionDialog({ session, open, onOpenChange, onSuccess }: CancelSessionDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error("Veuillez indiquer la raison de l'annulation")
      return
    }

    try {
      setIsSubmitting(true)
      await api.cancelSession(session.id, { reason: reason.trim() })
      toast.success("Session annulée avec succès")
      onOpenChange(false)
      onSuccess()
      setReason("")
    } catch (error: any) {
      toast.error(error.message || "Impossible d'annuler la session")
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
              <BanIcon className="h-5 w-5 text-destructive" />
              Annuler la session
            </DialogTitle>
            <DialogDescription>
              Campagne: {session.campaign?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <AlertCircleIcon className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-orange-900">
                  Action irréversible
                </p>
                <p className="text-sm text-orange-700">
                  Cette action ne peut pas être annulée. Vous ne pourrez plus participer à cette campagne.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Raison de l'annulation *</Label>
              <Textarea
                id="reason"
                placeholder="Expliquez pourquoi vous souhaitez annuler cette session..."
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
              Revenir
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Annulation...
                </>
              ) : (
                "Confirmer l'annulation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
