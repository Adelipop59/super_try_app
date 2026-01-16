"use client"

import { Step, StepProgress } from "@/lib/api"
import { PhotoStep } from "./steps/photo-step"
import { VideoStep } from "./steps/video-step"
import { ChecklistStep } from "./steps/checklist-step"
import { RatingStep } from "./steps/rating-step"
import { TextStep } from "./steps/text-step"
import { Badge } from "@/components/ui/badge"

interface StepComponentProps {
  step: Step
  progress?: StepProgress
  sessionId: string
  onComplete: () => void
  canComplete: { canComplete: boolean; reason?: string }
}

export function StepComponent({ step, progress, sessionId, onComplete, canComplete }: StepComponentProps) {
  const renderStepContent = () => {
    switch (step.type) {
      case "TEXT":
        return (
          <TextStep
            step={step}
            progress={progress}
            sessionId={sessionId}
            onComplete={onComplete}
            canComplete={canComplete}
          />
        )

      case "PHOTO":
        return (
          <PhotoStep
            step={step}
            progress={progress}
            sessionId={sessionId}
            onComplete={onComplete}
            canComplete={canComplete}
          />
        )

      case "VIDEO":
        return (
          <VideoStep
            step={step}
            progress={progress}
            sessionId={sessionId}
            onComplete={onComplete}
            canComplete={canComplete}
          />
        )

      case "CHECKLIST":
        return (
          <ChecklistStep
            step={step}
            progress={progress}
            sessionId={sessionId}
            onComplete={onComplete}
            canComplete={canComplete}
          />
        )

      case "RATING":
        return (
          <RatingStep
            step={step}
            progress={progress}
            sessionId={sessionId}
            onComplete={onComplete}
            canComplete={canComplete}
          />
        )

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Type d'étape non supporté: {step.type}
          </div>
        )
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">
              {step.order}. {step.title}
            </h4>
            {step.isRequired && (
              <Badge variant="outline" className="text-xs">
                Requis
              </Badge>
            )}
            {progress?.isCompleted && (
              <Badge variant="default" className="text-xs bg-green-600">
                Complété
              </Badge>
            )}
          </div>
          {step.description && (
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
          )}
        </div>
      </div>

      {renderStepContent()}
    </div>
  )
}
