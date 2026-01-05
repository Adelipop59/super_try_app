"use client"

import { useState } from "react"
import { Step, StepProgress, api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, CheckCircle2Icon } from "lucide-react"
import { toast } from "sonner"

interface TextStepProps {
  step: Step
  progress?: StepProgress
  sessionId: string
  onComplete: () => void
  canComplete: { canComplete: boolean; reason?: string }
}

export function TextStep({ step, progress, sessionId, onComplete, canComplete }: TextStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleComplete = async () => {
    // Check if step can be completed
    if (!canComplete.canComplete) {
      toast.error(canComplete.reason || "Cette étape ne peut pas encore être complétée")
      return
    }

    try {
      setIsSubmitting(true)
      await api.completeStep(sessionId, step.id, {
        submissionData: {
          response: "Instruction lue et validée",
          comment: step.description || undefined,
        },
      })
      toast.success("Étape validée !")
      onComplete()
    } catch (error: any) {
      toast.error(error.message || "Impossible de valider l'étape")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUndo = async () => {
    if (!progress?.id) return

    try {
      setIsSubmitting(true)
      // Call API to delete the progress
      await api.deleteStepProgress(sessionId, step.id)
      toast.success("Étape réinitialisée")
      onComplete()
    } catch (error: any) {
      toast.error(error.message || "Impossible de réinitialiser l'étape")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (progress?.isCompleted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 mt-3">
        <div className="flex items-start gap-3">
          <CheckCircle2Icon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Validé
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={isSubmitting}
                className="text-xs h-7"
              >
                Modifier
              </Button>
            </div>
            <p className="text-sm text-green-900">
              {step.description || "Instruction lue et validée."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If step is blocked, show a disabled state with reason
  if (!canComplete.canComplete) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 mt-3">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <InfoIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-3">
                {step.description || "Lisez attentivement cette instruction."}
              </p>
              <div className="rounded-md bg-orange-50 border border-orange-200 p-3 mb-3">
                <p className="text-sm text-orange-800">
                  <strong>Étape bloquée :</strong> {canComplete.reason}
                </p>
              </div>
              <Button onClick={handleComplete} disabled size="sm" variant="secondary">
                Étape terminée
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mt-3">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <InfoIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 mb-3">
              {step.description || "Lisez attentivement cette instruction."}
            </p>
            <Button onClick={handleComplete} disabled={isSubmitting} size="sm">
              {isSubmitting ? "Validation..." : "Étape terminée"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
