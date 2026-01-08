"use client"

import { useState } from "react"
import { Step, StepProgress, api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StarIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

interface RatingStepProps {
  step: Step
  progress?: StepProgress
  sessionId: string
  onComplete: () => void
  canComplete: { canComplete: boolean; reason?: string }
}

export function RatingStep({ step, progress, sessionId, onComplete, canComplete }: RatingStepProps) {
  const existingData = progress?.submissionData as { rating?: number; comment?: string } | undefined

  const [rating, setRating] = useState(existingData?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(existingData?.comment || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Check if step can be completed
    if (!canComplete.canComplete) {
      toast.error(canComplete.reason || "Cette étape ne peut pas encore être complétée")
      return
    }

    if (rating === 0) {
      toast.error("Veuillez sélectionner une note")
      return
    }

    try {
      setIsSubmitting(true)
      await api.completeStep(sessionId, step.id, {
        submissionData: {
          response: rating,
          comment: comment.trim() || undefined,
        },
      })
      toast.success("Note enregistrée avec succès")
      onComplete()
    } catch (error: any) {
      toast.error(error.message || "Impossible d'enregistrer la note")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 mt-3 space-y-4">
      {!canComplete.canComplete && (
        <div className="rounded-md bg-orange-50 border border-orange-200 p-3">
          <p className="text-sm text-orange-800">
            <strong>Étape bloquée :</strong> {canComplete.reason}
          </p>
        </div>
      )}

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
            <span className="ml-2 text-lg font-medium">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`comment-${step.id}`}>Commentaire (optionnel)</Label>
        <Textarea
          id={`comment-${step.id}`}
          placeholder="Ajoutez un commentaire pour expliquer votre note..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0 || !canComplete.canComplete}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : progress?.isCompleted ? (
          "Modifier la note"
        ) : (
          "Enregistrer la note"
        )}
      </Button>

      {progress?.isCompleted && progress.completedAt && (
        <p className="text-xs text-muted-foreground text-center">
          Complété le {new Date(progress.completedAt).toLocaleDateString("fr-FR")}
        </p>
      )}
    </div>
  )
}
