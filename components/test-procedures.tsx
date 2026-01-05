"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle2Icon, ChevronDownIcon, ChevronUpIcon, CircleIcon } from "lucide-react"
import { StepProgress, Step, Procedure } from "@/lib/api"
import { StepComponent } from "./step-component"

interface TestProceduresProps {
  procedures: Procedure[]
  sessionId: string
  onStepComplete: () => void
}

export function TestProcedures({ procedures, sessionId, onStepComplete }: TestProceduresProps) {
  const [openProcedures, setOpenProcedures] = useState<string[]>(
    procedures.filter(p => p.isRequired).map(p => p.id)
  )

  const toggleProcedure = (procedureId: string) => {
    setOpenProcedures(prev =>
      prev.includes(procedureId)
        ? prev.filter(id => id !== procedureId)
        : [...prev, procedureId]
    )
  }

  // Check if a step can be completed based on previous required steps
  const canCompleteStep = (currentStep: Step, procedure: Procedure): { canComplete: boolean; reason?: string } => {
    if (!currentStep.isRequired) {
      // Optional steps can always be completed
      return { canComplete: true }
    }

    // Get all steps in order across all procedures
    const allSteps = procedures
      .sort((a, b) => a.order - b.order)
      .flatMap(p => (p.steps || []).sort((a, b) => a.order - b.order))

    // Find the current step index
    const currentStepIndex = allSteps.findIndex(s => s.id === currentStep.id)
    if (currentStepIndex === -1) return { canComplete: true }

    // Check if all previous required steps are completed
    for (let i = 0; i < currentStepIndex; i++) {
      const previousStep = allSteps[i]
      if (previousStep.isRequired && !previousStep.progress?.isCompleted) {
        return {
          canComplete: false,
          reason: `Vous devez d'abord compléter l'étape : "${previousStep.title}"`
        }
      }
    }

    return { canComplete: true }
  }

  const calculateProcedureProgress = (procedure: Procedure) => {
    if (!procedure.steps || procedure.steps.length === 0) return 100

    const requiredSteps = procedure.steps.filter(s => s.isRequired)
    if (requiredSteps.length === 0) return 100

    const completedSteps = requiredSteps.filter(s => s.progress?.isCompleted)
    return Math.round((completedSteps.length / requiredSteps.length) * 100)
  }

  const calculateTotalProgress = () => {
    const allRequiredSteps = procedures
      .filter(p => p.isRequired)
      .flatMap(p => (p.steps || []).filter(s => s.isRequired))

    if (allRequiredSteps.length === 0) return 100

    const completedSteps = allRequiredSteps.filter(s => s.progress?.isCompleted)
    return Math.round((completedSteps.length / allRequiredSteps.length) * 100)
  }

  const totalProgress = calculateTotalProgress()

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progression du test</CardTitle>
          <CardDescription>
            Complétez toutes les étapes obligatoires pour soumettre votre test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression globale</span>
              <span className="font-medium">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Procedures */}
      <div className="space-y-4">
        {procedures
          .sort((a, b) => a.order - b.order)
          .map((procedure) => {
            const progress = calculateProcedureProgress(procedure)
            const isOpen = openProcedures.includes(procedure.id)
            const allStepsCompleted = progress === 100

            return (
              <Card key={procedure.id} className={allStepsCompleted ? "border-green-200 bg-green-50/50" : ""}>
                <Collapsible open={isOpen} onOpenChange={() => toggleProcedure(procedure.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              {procedure.order}. {procedure.title}
                            </CardTitle>
                            {procedure.isRequired && (
                              <Badge variant="secondary" className="text-xs">
                                Obligatoire
                              </Badge>
                            )}
                            {allStepsCompleted && (
                              <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          {procedure.description && (
                            <CardDescription className="mt-2">
                              {procedure.description}
                            </CardDescription>
                          )}
                          <div className="mt-3 flex items-center gap-3">
                            <Progress value={progress} className="h-1.5 flex-1 max-w-xs" />
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-4">
                          {isOpen ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {(procedure.steps || [])
                        .sort((a, b) => a.order - b.order)
                        .map((step) => (
                          <div key={step.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                                step.progress?.isCompleted
                                  ? "border-green-500 bg-green-500"
                                  : "border-gray-300 bg-white"
                              }`}>
                                {step.progress?.isCompleted ? (
                                  <CheckCircle2Icon className="h-5 w-5 text-white" />
                                ) : (
                                  <CircleIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              {procedure.steps && step.order < procedure.steps.length && (
                                <div className="w-0.5 flex-1 min-h-[20px] bg-gray-200 mt-2" />
                              )}
                            </div>

                            <div className="flex-1 pb-4">
                              <StepComponent
                                step={step}
                                progress={step.progress}
                                sessionId={sessionId}
                                onComplete={onStepComplete}
                                canComplete={canCompleteStep(step, procedure)}
                              />
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
