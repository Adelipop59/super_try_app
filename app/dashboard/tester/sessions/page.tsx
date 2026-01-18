"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { api, Session, SessionStatus } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import {
  TestTubeIcon,
  ClockIcon,
  CheckCircle2Icon,
  PlayCircleIcon,
  AlertCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  PackageIcon,
  ShoppingCartIcon,
  FileTextIcon,
  BanIcon,
  EyeIcon,
} from "lucide-react"
import { ValidatePriceDialog } from "@/components/validate-price-dialog"
import { SubmitPurchaseDialog } from "@/components/submit-purchase-dialog"
import { SubmitTestDialog } from "@/components/submit-test-dialog"
import { CancelSessionDialog } from "@/components/cancel-session-dialog"
import { DisputeSessionDialog } from "@/components/dispute-session-dialog"

const statusConfig: Record<SessionStatus, { label: string; icon: any; color: string }> = {
  PENDING: { label: "En attente", icon: ClockIcon, color: "bg-orange-100 text-orange-800" },
  ACCEPTED: { label: "Acceptée", icon: CheckCircle2Icon, color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejetée", icon: XCircleIcon, color: "bg-red-100 text-red-800" },
  IN_PROGRESS: { label: "En cours", icon: PlayCircleIcon, color: "bg-blue-100 text-blue-800" },
  PROCEDURES_COMPLETED: { label: "Procédures terminées", icon: CheckCircle2Icon, color: "bg-blue-100 text-blue-800" },
  PRICE_VALIDATED: { label: "Prix validé", icon: CheckCircle2Icon, color: "bg-blue-100 text-blue-800" },
  PURCHASE_SUBMITTED: { label: "Achat soumis", icon: ShoppingCartIcon, color: "bg-purple-100 text-purple-800" },
  PURCHASE_VALIDATED: { label: "Achat validé", icon: CheckCircle2Icon, color: "bg-purple-100 text-purple-800" },
  SUBMITTED: { label: "Test soumis", icon: FileTextIcon, color: "bg-indigo-100 text-indigo-800" },
  UGC_REQUESTED: { label: "Contenu demandé", icon: AlertCircleIcon, color: "bg-yellow-100 text-yellow-800" },
  UGC_SUBMITTED: { label: "Contenu soumis", icon: FileTextIcon, color: "bg-yellow-100 text-yellow-800" },
  PENDING_CLOSURE: { label: "En attente de clôture", icon: ClockIcon, color: "bg-gray-100 text-gray-800" },
  COMPLETED: { label: "Terminée", icon: CheckCircle2Icon, color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Annulée", icon: BanIcon, color: "bg-gray-100 text-gray-800" },
  DISPUTED: { label: "Litige", icon: AlertTriangleIcon, color: "bg-yellow-100 text-yellow-800" },
}

export default function SessionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { handleErrorWithRetry } = useErrorHandler()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  // Dialog states
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [validatePriceOpen, setValidatePriceOpen] = useState(false)
  const [submitPurchaseOpen, setSubmitPurchaseOpen] = useState(false)
  const [submitTestOpen, setSubmitTestOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)

  const fetchSessions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await api.getMySessions()
      setSessions(data)
    } catch (error) {
      handleErrorWithRetry(
        error,
        fetchSessions,
        'Impossible de charger vos sessions.'
      )
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [user])

  const filteredSessions = sessions.filter(session => {
    if (filter === "all") return true
    if (filter === "active") return ["ACCEPTED", "IN_PROGRESS", "PROCEDURES_COMPLETED", "PRICE_VALIDATED", "PURCHASE_SUBMITTED", "PURCHASE_VALIDATED"].includes(session.status)
    if (filter === "completed") return session.status === "COMPLETED"
    if (filter === "pending") return session.status === "PENDING"
    return true
  })

  const stats = {
    total: sessions.length,
    active: sessions.filter(s => ["ACCEPTED", "IN_PROGRESS", "PROCEDURES_COMPLETED", "PRICE_VALIDATED", "PURCHASE_SUBMITTED", "PURCHASE_VALIDATED"].includes(s.status)).length,
    completed: sessions.filter(s => s.status === "COMPLETED").length,
    pending: sessions.filter(s => s.status === "PENDING").length,
  }

  const getNextAction = (session: Session) => {
    switch (session.status) {
      case "ACCEPTED":
        return {
          label: "Valider le prix",
          icon: PackageIcon,
          onClick: () => {
            setSelectedSession(session)
            setValidatePriceOpen(true)
          },
          variant: "default" as const,
        }
      case "PRICE_VALIDATED":
        return {
          label: "Soumettre l'achat",
          icon: ShoppingCartIcon,
          onClick: () => {
            setSelectedSession(session)
            setSubmitPurchaseOpen(true)
          },
          variant: "default" as const,
        }
      case "IN_PROGRESS":
        return {
          label: "Soumettre le test",
          icon: FileTextIcon,
          onClick: () => {
            setSelectedSession(session)
            setSubmitTestOpen(true)
          },
          variant: "default" as const,
        }
      default:
        return null
    }
  }

  const canCancel = (status: SessionStatus) => {
    return ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(status)
  }

  const canDispute = (status: SessionStatus) => {
    return !["CANCELLED", "COMPLETED"].includes(status)
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <TestTubeIcon className="h-8 w-8 text-blue-600" />
          Mes Sessions
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez et suivez toutes vos sessions de test
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <TestTubeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <PlayCircleIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle2Icon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <ClockIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 lg:px-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Toutes
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          En cours
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Terminées
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          En attente
        </Button>
      </div>

      {/* Sessions List */}
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle>Liste des sessions</CardTitle>
          <CardDescription>
            {filteredSessions.length} session(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="h-6 w-64 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TestTubeIcon className="mx-auto h-12 w-12 opacity-20" />
                <p className="mt-4 text-sm">Aucune session trouvée</p>
                <p className="mt-1 text-xs">
                  {filter === "all"
                    ? "Vos sessions apparaîtront ici une fois que vous aurez commencé"
                    : "Aucune session ne correspond à ce filtre"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const config = statusConfig[session.status]
                const StatusIcon = config.icon
                const nextAction = getNextAction(session)

                return (
                  <div
                    key={session.id}
                    className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                          {session.campaign?.title || "Campagne sans titre"}
                        </h3>
                        {session.campaign?.description && (
                          <p className="text-sm text-muted-foreground">
                            {session.campaign.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Créée le {new Date(session.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <Badge className={config.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>

                    {/* Session Details */}
                    {session.productPrice && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Prix validé: {session.productPrice}€
                      </p>
                    )}
                    {session.actualPrice && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Prix d'achat: {session.actualPrice}€
                        {session.actualShipping && ` (+ ${session.actualShipping}€ de frais de port)`}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/tester/sessions/${session.id}`)}
                      >
                        <EyeIcon className="mr-2 h-4 w-4" />
                        Voir les détails
                      </Button>
                      {nextAction && (
                        <Button
                          size="sm"
                          variant={nextAction.variant}
                          onClick={nextAction.onClick}
                        >
                          <nextAction.icon className="mr-2 h-4 w-4" />
                          {nextAction.label}
                        </Button>
                      )}
                      {canCancel(session.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSession(session)
                            setCancelOpen(true)
                          }}
                        >
                          <BanIcon className="mr-2 h-4 w-4" />
                          Annuler
                        </Button>
                      )}
                      {canDispute(session.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSession(session)
                            setDisputeOpen(true)
                          }}
                        >
                          <AlertTriangleIcon className="mr-2 h-4 w-4" />
                          Litige
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedSession && (
        <>
          <ValidatePriceDialog
            session={selectedSession}
            open={validatePriceOpen}
            onOpenChange={setValidatePriceOpen}
            onSuccess={fetchSessions}
          />
          <SubmitPurchaseDialog
            session={selectedSession}
            open={submitPurchaseOpen}
            onOpenChange={setSubmitPurchaseOpen}
            onSuccess={fetchSessions}
          />
          <SubmitTestDialog
            session={selectedSession}
            open={submitTestOpen}
            onOpenChange={setSubmitTestOpen}
            onSuccess={fetchSessions}
          />
          <CancelSessionDialog
            session={selectedSession}
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            onSuccess={fetchSessions}
          />
          <DisputeSessionDialog
            session={selectedSession}
            open={disputeOpen}
            onOpenChange={setDisputeOpen}
            onSuccess={fetchSessions}
          />
        </>
      )}
    </div>
  )
}
