"use client"

import { useState } from "react"
import { Step, StepProgress, api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2Icon, VideoIcon } from "lucide-react"
import { toast } from "sonner"

interface VideoStepProps {
  step: Step
  progress?: StepProgress
  sessionId: string
  onComplete: () => void
  canComplete: { canComplete: boolean; reason?: string }
}

export function VideoStep({ step, progress, sessionId, onComplete, canComplete }: VideoStepProps) {
  const existingData = progress?.submissionData as { url?: string; duration?: number; comment?: string } | undefined

  const [url, setUrl] = useState(existingData?.url || "")
  const [duration, setDuration] = useState(existingData?.duration?.toString() || "")
  const [comment, setComment] = useState(existingData?.comment || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Check if step can be completed
    if (!canComplete.canComplete) {
      toast.error(canComplete.reason || "Cette étape ne peut pas encore être complétée")
      return
    }

    if (!url.trim()) {
      toast.error("Veuillez ajouter l'URL de la vidéo")
      return
    }

    // Validate URL
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(url)) {
      toast.error("URL de vidéo invalide")
      return
    }

    try {
      setIsSubmitting(true)
      await api.completeStep(sessionId, step.id, {
        submissionData: {
          response: url.trim(),
          comment: comment.trim() || undefined,
          attachments: duration ? [duration] : undefined,
        },
      })
      toast.success("Vidéo enregistrée avec succès")
      onComplete()
    } catch (error: any) {
      toast.error(error.message || "Impossible d'enregistrer la vidéo")
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
        <Label htmlFor={`url-${step.id}`}>URL de la vidéo *</Label>
        <p className="text-xs text-muted-foreground">
          Uploadez votre vidéo sur un service (YouTube, Vimeo, etc.) et collez l'URL ici
        </p>
        <Input
          id={`url-${step.id}`}
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`duration-${step.id}`}>Durée (secondes, optionnel)</Label>
        <Input
          id={`duration-${step.id}`}
          type="number"
          placeholder="180"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {existingData?.url && (
        <div className="space-y-2">
          <Label>Aperçu</Label>
          <div className="rounded-lg border bg-muted p-4 flex items-center gap-3">
            <VideoIcon className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{existingData.url}</p>
              {existingData.duration && (
                <p className="text-xs text-muted-foreground">
                  Durée: {Math.floor(existingData.duration / 60)}:{(existingData.duration % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(existingData.url, '_blank')}
            >
              Voir
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`comment-${step.id}`}>Commentaire (optionnel)</Label>
        <Textarea
          id={`comment-${step.id}`}
          placeholder="Ajoutez un commentaire sur cette vidéo..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
          rows={2}
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !url.trim() || !canComplete.canComplete}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : progress?.isCompleted ? (
          "Modifier la vidéo"
        ) : (
          "Enregistrer la vidéo"
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
