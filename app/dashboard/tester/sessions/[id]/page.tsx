"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api, Session } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SessionTimeline } from "@/components/session-timeline"
import { StatusBadge } from "@/components/status-badge"
import { ValidatePriceDialog } from "@/components/validate-price-dialog"
import { SubmitPurchaseDialog } from "@/components/submit-purchase-dialog"
import { SubmitTestDialog } from "@/components/submit-test-dialog"
import { CancelSessionDialog } from "@/components/cancel-session-dialog"
import { DisputeSessionDialog } from "@/components/dispute-session-dialog"
import { LeaveReviewDialog } from "@/components/leave-review-dialog"
import { SessionChat } from "@/components/session-chat"
import {
  ArrowLeftIcon,
  PackageIcon,
  ShoppingCartIcon,
  FileTextIcon,
  BanIcon,
  AlertTriangleIcon,
  CalendarIcon,
  UserIcon,
  StoreIcon,
  StarIcon,
} from "lucide-react"

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { handleErrorWithRetry } = useErrorHandler()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [validatePriceOpen, setValidatePriceOpen] = useState(false)
  const [submitPurchaseOpen, setSubmitPurchaseOpen] = useState(false)
  const [submitTestOpen, setSubmitTestOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const fetchSession = async () => {
    if (!params.id) return

    try {
      setLoading(true)
      const data = await api.getSession(params.id as string)
      setSession(data)
    } catch (error) {
      handleErrorWithRetry(
        error,
        fetchSession,
        'Impossible de charger les détails de la session.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [params.id])

  const getNextAction = () => {
    if (!session) return null

    switch (session.status) {
      case "ACCEPTED":
        return {
          label: "Valider le prix",
          icon: PackageIcon,
          onClick: () => setValidatePriceOpen(true),
          variant: "default" as const,
        }
      case "PRICE_VALIDATED":
        return {
          label: "Soumettre l'achat",
          icon: ShoppingCartIcon,
          onClick: () => setSubmitPurchaseOpen(true),
          variant: "default" as const,
        }
      case "IN_PROGRESS":
        return {
          label: "Soumettre le test",
          icon: FileTextIcon,
          onClick: () => setSubmitTestOpen(true),
          variant: "default" as const,
        }
      default:
        return null
    }
  }

  const canCancel = () => {
    if (!session) return false
    return ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(session.status)
  }

  const canDispute = () => {
    if (!session) return false
    return !["CANCELLED", "COMPLETED"].includes(session.status)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Session introuvable</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/tester/sessions')}>
            Retour aux sessions
          </Button>
        </div>
      </div>
    )
  }

  const nextAction = getNextAction()

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/tester/sessions')}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux sessions
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {session.campaign?.title || "Session"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {session.campaign?.description}
            </p>
          </div>
          <StatusBadge status={session.status} size="lg" />
        </div>
      </div>

      <div className="grid gap-6 px-4 lg:px-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Progression</CardTitle>
              <CardDescription>
                Suivez l'avancement de votre session de test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionTimeline currentStatus={session.status} />
            </CardContent>
          </Card>

          {/* Actions */}
          {(nextAction || canCancel() || canDispute()) && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Que souhaitez-vous faire ?
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {nextAction && (
                  <Button onClick={nextAction.onClick} variant={nextAction.variant}>
                    <nextAction.icon className="mr-2 h-4 w-4" />
                    {nextAction.label}
                  </Button>
                )}
                {session.status === "COMPLETED" && (
                  <Button onClick={() => setReviewOpen(true)}>
                    <StarIcon className="mr-2 h-4 w-4" />
                    Laisser un avis
                  </Button>
                )}
                {canCancel() && (
                  <Button variant="outline" onClick={() => setCancelOpen(true)}>
                    <BanIcon className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                )}
                {canDispute() && (
                  <Button variant="outline" onClick={() => setDisputeOpen(true)}>
                    <AlertTriangleIcon className="mr-2 h-4 w-4" />
                    Créer un litige
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date de candidature</p>
                  <p className="font-medium">
                    {new Date(session.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                  <p className="font-medium">
                    {new Date(session.updatedAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {session.productPrice && (
                <div>
                  <p className="text-sm text-muted-foreground">Prix validé</p>
                  <p className="font-medium">{session.productPrice}€</p>
                </div>
              )}

              {session.actualPrice && (
                <div>
                  <p className="text-sm text-muted-foreground">Prix d'achat</p>
                  <p className="font-medium">
                    {session.actualPrice}€
                    {session.actualShipping && ` (+ ${session.actualShipping}€ de frais de port)`}
                  </p>
                </div>
              )}

              {session.purchaseProof && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Preuve d'achat</p>
                  <a
                    href={session.purchaseProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Voir la preuve d'achat
                  </a>
                </div>
              )}

              {session.cancelReason && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-medium text-orange-900 mb-1">Raison d'annulation</p>
                  <p className="text-sm text-orange-700">{session.cancelReason}</p>
                </div>
              )}

              {session.disputeReason && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Litige</p>
                  <p className="text-sm text-yellow-700">{session.disputeReason}</p>
                  {session.disputeDescription && (
                    <p className="text-sm text-yellow-700 mt-2">{session.disputeDescription}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Section */}
          {session.seller && (
            <SessionChat sessionId={session.id} sellerId={session.seller.id} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Campagne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">{session.campaign?.title}</p>
                {session.campaign?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {session.campaign.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          {session.seller && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StoreIcon className="h-5 w-5" />
                  Vendeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {session.seller.companyName || session.seller.email}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tester Info */}
          {session.tester && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Testeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {session.tester.firstName && session.tester.lastName
                    ? `${session.tester.firstName} ${session.tester.lastName}`
                    : session.tester.email}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {session && (
        <>
          <ValidatePriceDialog
            session={session}
            open={validatePriceOpen}
            onOpenChange={setValidatePriceOpen}
            onSuccess={fetchSession}
          />
          <SubmitPurchaseDialog
            session={session}
            open={submitPurchaseOpen}
            onOpenChange={setSubmitPurchaseOpen}
            onSuccess={fetchSession}
          />
          <SubmitTestDialog
            session={session}
            open={submitTestOpen}
            onOpenChange={setSubmitTestOpen}
            onSuccess={fetchSession}
          />
          <CancelSessionDialog
            session={session}
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            onSuccess={fetchSession}
          />
          <DisputeSessionDialog
            session={session}
            open={disputeOpen}
            onOpenChange={setDisputeOpen}
            onSuccess={fetchSession}
          />
          <LeaveReviewDialog
            session={session}
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            onSuccess={fetchSession}
          />
        </>
      )}
    </div>
  )
}
