"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { api, Session } from "@/lib/api"
import { Loader2Icon, StarIcon } from "lucide-react"
import { toast } from "sonner"

interface LeaveReviewDialogProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function LeaveReviewDialog({ session, open, onOpenChange, onSuccess }: LeaveReviewDialogProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Veuillez sélectionner une note")
      return
    }

    try {
      setIsSubmitting(true)
      await api.createReview(session.id, {
        rating,
        comment: comment.trim() || undefined,
        isPublic,
      })
      toast.success("Avis publié avec succès !")
      onOpenChange(false)
      onSuccess()
      setRating(0)
      setComment("")
      setIsPublic(true)
    } catch (error: any) {
      toast.error(error.message || "Impossible de publier l'avis")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Laisser un avis</DialogTitle>
            <DialogDescription>
              Partagez votre expérience avec cette campagne
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Campaign Info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="font-medium">{session.campaign?.title}</p>
              {session.campaign?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {session.campaign.description}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Note *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    disabled={isSubmitting}
                  >
                    <StarIcon
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-medium">
                    {rating} / 5
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire (optionnel)</Label>
              <Textarea
                id="comment"
                placeholder="Partagez votre expérience avec le produit, le vendeur, et le processus de test..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Décrivez votre expérience pour aider les autres testeurs
              </p>
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic" className="text-base cursor-pointer">
                  Rendre cet avis public
                </Label>
                <p className="text-sm text-muted-foreground">
                  Les avis publics peuvent être visibles par d'autres utilisateurs
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={isSubmitting}
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
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Publication...
                </>
              ) : (
                "Publier l'avis"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
