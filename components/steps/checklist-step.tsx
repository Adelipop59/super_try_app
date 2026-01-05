"use client"

import { useState } from "react"
import { Step, StepProgress, api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

interface ChecklistItem {
  id: string
  label: string
  required: boolean
}

interface CheckedItem {
  id: string
  checked: boolean
  comment?: string
}

interface ChecklistStepProps {
  step: Step
  progress?: StepProgress
  sessionId: string
  onComplete: () => void
  canComplete: { canComplete: boolean; reason?: string }
}

export function ChecklistStep({ step, progress, sessionId, onComplete, canComplete }: ChecklistStepProps) {
  const checklistItems: ChecklistItem[] = step.checklistItems
    ? JSON.parse(step.checklistItems as any)
    : []

  const existingData = progress?.submissionData as { checkedItems?: CheckedItem[] } | undefined

  const [checkedItems, setCheckedItems] = useState<CheckedItem[]>(
    existingData?.checkedItems || checklistItems.map(item => ({
      id: item.id,
      checked: false,
      comment: "",
    }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckChange = (itemId: string, checked: boolean) => {
    setCheckedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked } : item
      )
    )
  }

  const handleCommentChange = (itemId: string, comment: string) => {
    setCheckedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, comment } : item
      )
    )
  }

  const canSubmit = () => {
    const requiredItems = checklistItems.filter(item => item.required)
    return requiredItems.every(reqItem =>
      checkedItems.find(ci => ci.id === reqItem.id)?.checked
    )
  }

  const handleSubmit = async () => {
    // Check if step can be completed
    if (!canComplete.canComplete) {
      toast.error(canComplete.reason || "Cette étape ne peut pas encore être complétée")
      return
    }

    if (!canSubmit()) {
      toast.error("Veuillez cocher tous les éléments requis")
      return
    }

    try {
      setIsSubmitting(true)
      await api.completeStep(sessionId, step.id, {
        submissionData: {
          response: checkedItems.filter(item => item.checked).map(item => item.id),
          comment: checkedItems.find(item => item.comment)?.comment || undefined,
          attachments: checkedItems.filter(item => item.comment).map(item => `${item.id}: ${item.comment}`),
        },
      })
      toast.success("Liste de vérification enregistrée")
      onComplete()
    } catch (error: any) {
      toast.error(error.message || "Impossible d'enregistrer")
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

      {checklistItems.map((item) => {
        const checkedItem = checkedItems.find(ci => ci.id === item.id)

        return (
          <div key={item.id} className="space-y-2 pb-3 border-b last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <Checkbox
                id={`check-${item.id}`}
                checked={checkedItem?.checked || false}
                onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
                disabled={isSubmitting}
              />
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor={`check-${item.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {item.label}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  placeholder="Commentaire (optionnel)"
                  value={checkedItem?.comment || ""}
                  onChange={(e) => handleCommentChange(item.id, e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )
      })}

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !canSubmit() || !canComplete.canComplete}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : progress?.isCompleted ? (
          "Modifier la liste"
        ) : (
          "Enregistrer"
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
