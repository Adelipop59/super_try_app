import { SessionStatus } from "@/lib/api"
import { CheckCircle2Icon, CircleIcon, XCircleIcon } from "lucide-react"

interface TimelineStep {
  status: SessionStatus
  label: string
  labelPro?: string
  description: string
  descriptionPro?: string
}

const timelineSteps: TimelineStep[] = [
  {
    status: "PENDING",
    label: "Candidature envoyée",
    labelPro: "Candidature reçue",
    description: "En attente de validation",
    descriptionPro: "En attente de votre validation",
  },
  {
    status: "ACCEPTED",
    label: "Procédures de test",
    labelPro: "Procédures de test",
    description: "Complétez toutes les étapes obligatoires",
    descriptionPro: "Le testeur complète les procédures",
  },
  {
    status: "PROCEDURES_COMPLETED",
    label: "Validation du prix",
    labelPro: "Validation du prix",
    description: "Vérifiez le prix du produit",
    descriptionPro: "En attente de validation du prix",
  },
  {
    status: "PRICE_VALIDATED",
    label: "Commande du produit",
    labelPro: "Commande en attente",
    description: "Commandez et envoyez le n° de commande",
    descriptionPro: "En attente de la commande",
  },
  {
    status: "PURCHASE_SUBMITTED",
    label: "Validation commande",
    labelPro: "Commande à valider",
    description: "En attente de validation",
    descriptionPro: "Validez la commande",
  },
  {
    status: "PURCHASE_VALIDATED",
    label: "Test en cours",
    labelPro: "Test en cours",
    description: "Réalisez votre test du produit",
    descriptionPro: "Testeur réalise son test",
  },
  {
    status: "SUBMITTED",
    label: "Test soumis",
    labelPro: "Test à valider",
    description: "En attente de validation du vendeur",
    descriptionPro: "Validez le test du testeur",
  },
  {
    status: "COMPLETED",
    label: "Test validé",
    labelPro: "Test validé",
    description: "Récompense versée",
    descriptionPro: "Testeur payé",
  },
]

interface SessionTimelineProps {
  currentStatus: SessionStatus
  className?: string
  isPro?: boolean
}

export function SessionTimeline({ currentStatus, className = "", isPro = false }: SessionTimelineProps) {
  // Handle special statuses
  if (currentStatus === "REJECTED") {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Candidature rejetée</h3>
            <p className="text-sm text-red-700 mt-1">
              Votre candidature n'a pas été retenue pour cette campagne.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (currentStatus === "CANCELLED") {
    return (
      <div className={`rounded-lg border border-gray-200 bg-gray-50 p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <XCircleIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Session annulée</h3>
            <p className="text-sm text-gray-700 mt-1">
              Cette session a été annulée.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (currentStatus === "DISPUTED") {
    return (
      <div className={`rounded-lg border border-yellow-200 bg-yellow-50 p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
            <XCircleIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-900">Litige en cours</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Un litige a été créé. Un administrateur va examiner votre cas.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Find current step index in timeline
  // Map IN_PROGRESS to ACCEPTED since they represent the same timeline step
  const mappedStatus = currentStatus === "IN_PROGRESS" ? "ACCEPTED" : currentStatus
  const currentStepIndex = timelineSteps.findIndex((step) => step.status === mappedStatus)

  return (
    <div className={`space-y-6 ${className}`}>
      {timelineSteps.map((step, index) => {
        const isCompleted = index < currentStepIndex
        const isCurrent = index === currentStepIndex
        const isFuture = index > currentStepIndex

        return (
          <div key={`${step.status}-${index}`} className="flex gap-4">
            {/* Icon */}
            <div className="relative flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? "border-green-500 bg-green-500"
                    : isCurrent
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2Icon className="h-6 w-6 text-white" />
                ) : (
                  <CircleIcon
                    className={`h-5 w-5 ${
                      isCurrent ? "fill-white text-white" : "text-gray-400"
                    }`}
                  />
                )}
              </div>

              {/* Vertical line */}
              {index < timelineSteps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[40px] mt-2 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-8 ${isFuture ? "opacity-50" : ""}`}>
              <h3
                className={`font-semibold ${
                  isCurrent
                    ? "text-blue-900"
                    : isCompleted
                    ? "text-green-900"
                    : "text-gray-600"
                }`}
              >
                {isPro ? (step.labelPro || step.label) : step.label}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isPro ? (step.descriptionPro || step.description) : step.description}
              </p>
              {isCurrent && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    Étape actuelle
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
