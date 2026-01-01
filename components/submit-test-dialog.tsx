"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api, Session } from "@/lib/api"
import { Loader2Icon, FileTextIcon } from "lucide-react"
import { toast } from "sonner"

interface SubmitTestDialogProps {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SubmitTestDialog({ session, open, onOpenChange, onSuccess }: SubmitTestDialogProps) {
  const [testData, setTestData] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!testData.trim()) {
      toast.error("Veuillez fournir les données du test")
      return
    }

    try {
      setIsSubmitting(true)

      // Parse test data as JSON if possible, otherwise send as-is
      let parsedTestData: Record<string, any>
      try {
        parsedTestData = JSON.parse(testData)
      } catch {
        parsedTestData = { content: testData }
      }

      await api.submitTest(session.id, {
        testData: parsedTestData,
        feedback: feedback.trim() || undefined,
      })
      toast.success("Test soumis avec succès !")
      onOpenChange(false)
      onSuccess()
      setTestData("")
      setFeedback("")
    } catch (error: any) {
      toast.error(error.message || "Impossible de soumettre le test")
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
              <FileTextIcon className="h-5 w-5" />
              Soumettre le test
            </DialogTitle>
            <DialogDescription>
              Campagne: {session.campaign?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="testData">Données du test *</Label>
              <Textarea
                id="testData"
                placeholder="Entrez vos résultats de test (JSON ou texte libre)"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                required
                disabled={isSubmitting}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Vous pouvez fournir un JSON structuré ou du texte libre avec vos observations
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (optionnel)</Label>
              <Textarea
                id="feedback"
                placeholder="Partagez votre expérience globale avec le produit..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Commentaires additionnels sur votre expérience
              </p>
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
                  Soumission...
                </>
              ) : (
                "Soumettre le test"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
