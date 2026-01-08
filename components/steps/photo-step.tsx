"use client"

import { useState } from "react"
import { Step, StepProgress, api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2Icon, PlusIcon, XIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface PhotoStepProps {
  step: Step
  progress?: StepProgress
  sessionId: string
  onComplete: () => void
  canComplete: { canComplete: boolean; reason?: string }
}

export function PhotoStep({ step, progress, sessionId, onComplete, canComplete }: PhotoStepProps) {
  const existingData = progress?.submissionData as { urls?: string[]; comment?: string } | undefined

  const [urls, setUrls] = useState<string[]>(existingData?.urls || [""])
  const [comment, setComment] = useState(existingData?.comment || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addUrlField = () => {
    setUrls([...urls, ""])
  }

  const removeUrlField = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index))
  }

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const handleSubmit = async () => {
    // Check if step can be completed
    if (!canComplete.canComplete) {
      toast.error(canComplete.reason || "Cette étape ne peut pas encore être complétée")
      return
    }

    const validUrls = urls.filter(url => url.trim() !== "")

    if (validUrls.length === 0) {
      toast.error("Veuillez ajouter au moins une photo")
      return
    }

    // Validate URLs
    const urlPattern = /^https?:\/\/.+/
    const invalidUrls = validUrls.filter(url => !urlPattern.test(url))
    if (invalidUrls.length > 0) {
      toast.error("Certaines URLs ne sont pas valides")
      return
    }

    try {
      setIsSubmitting(true)
      await api.completeStep(sessionId, step.id, {
        submissionData: {
          response: validUrls[0], // First URL as main response
          comment: comment.trim() || undefined,
          attachments: validUrls.length > 1 ? validUrls.slice(1) : undefined,
        },
      })
      toast.success("Photos enregistrées avec succès")
      onComplete()
    } catch (error: any) {
      toast.error(error.message || "Impossible d'enregistrer les photos")
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

      <div className="space-y-3">
        <Label>URLs des photos *</Label>
        <p className="text-xs text-muted-foreground">
          Uploadez vos photos sur un service (Imgur, Cloudinary, etc.) et collez les URLs ici
        </p>

        {urls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="https://example.com/photo.jpg"
              value={url}
              onChange={(e) => updateUrl(index, e.target.value)}
              disabled={isSubmitting}
              className="flex-1"
            />
            {urls.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeUrlField(index)}
                disabled={isSubmitting}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addUrlField}
          disabled={isSubmitting}
          className="w-full"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter une photo
        </Button>
      </div>

      {existingData?.urls && existingData.urls.length > 0 && (
        <div className="space-y-2">
          <Label>Aperçu des photos</Label>
          <div className="grid grid-cols-2 gap-2">
            {existingData.urls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = ""
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement!.innerHTML = `<div class="flex items-center justify-center h-full"><ImageIcon class="h-8 w-8 text-muted-foreground" /></div>`
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`comment-${step.id}`}>Commentaire (optionnel)</Label>
        <Textarea
          id={`comment-${step.id}`}
          placeholder="Ajoutez un commentaire sur ces photos..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
          rows={2}
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !canComplete.canComplete}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : progress?.isCompleted ? (
          "Modifier les photos"
        ) : (
          "Enregistrer les photos"
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
