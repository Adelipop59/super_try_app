"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api, Session } from "@/lib/api"
import { Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { toast } from "sonner"

interface AcceptRejectDialogProps {
  session: Session
  action: 'accept' | 'reject'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AcceptRejectDialog({ session, action, open, onOpenChange, onSuccess }: AcceptRejectDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error("Veuillez indiquer une raison de refus")
      return
    }

    try {
      setIsSubmitting(true)

      if (action === 'accept') {
        await api.acceptSession(session.id)
        toast.success("Candidature acceptée avec succès !")
      } else {
        await api.rejectSession(session.id, rejectionReason.trim())
        toast.success("Candidature refusée")
      }

      onOpenChange(false)
      onSuccess()
      setRejectionReason("")
    } catch (error: any) {
      toast.error(error.message || `Impossible de ${action === 'accept' ? 'accepter' : 'refuser'} la candidature`)
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
              {action === 'accept' ? (
                <>
                  <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  Accepter la candidature
                </>
              ) : (
                <>
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                  Refuser la candidature
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {session.tester?.firstName} {session.tester?.lastName} ({session.tester?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tester Info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="font-medium mb-2">Informations du testeur</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {session.tester?.averageRating && (
                  <div>
                    <span className="text-muted-foreground">Note moyenne: </span>
                    <span className="font-medium">⭐ {session.tester.averageRating.toFixed(1)}/5</span>
                  </div>
                )}
                {session.tester?.completedSessionsCount !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Tests complétés: </span>
                    <span className="font-medium">{session.tester.completedSessionsCount}</span>
                  </div>
                )}
              </div>
              {session.applicationMessage && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Message de candidature:</p>
                  <p className="text-sm italic">"{session.applicationMessage}"</p>
                </div>
              )}
            </div>

            {action === 'accept' && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-900">
                  <strong>Cette action va :</strong>
                </p>
                <ul className="text-sm text-green-800 mt-2 space-y-1 ml-4 list-disc">
                  <li>Accepter la candidature du testeur</li>
                  <li>Décrémenter les places disponibles</li>
                  <li>Calculer une date d'achat selon vos distributions</li>
                  <li>Notifier le testeur par email et notification</li>
                  <li>Permettre au testeur de commencer le processus de test</li>
                </ul>
              </div>
            )}

            {action === 'reject' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Raison du refus *</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Expliquez pourquoi vous refusez cette candidature..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    disabled={isSubmitting}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cette raison sera communiquée au testeur
                  </p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-900">
                    <strong>Cette action va :</strong>
                  </p>
                  <ul className="text-sm text-red-800 mt-2 space-y-1 ml-4 list-disc">
                    <li>Refuser la candidature du testeur</li>
                    <li>Notifier le testeur avec la raison du refus</li>
                    <li>Ne pas décrémenter les places disponibles</li>
                  </ul>
                </div>
              </>
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
              disabled={isSubmitting || (action === 'reject' && !rejectionReason.trim())}
              className={action === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                action === 'accept' ? 'Accepter la candidature' : 'Refuser la candidature'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
