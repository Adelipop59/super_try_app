"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api, Session } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import { SessionTimeline } from "@/components/session-timeline"
import { SessionChat } from "@/components/session-chat"
import { AcceptRejectDialog } from "@/components/accept-reject-dialog"
import { ValidateTestDialog } from "@/components/validate-test-dialog"
import {
  ArrowLeftIcon,
  UserIcon,
  MailIcon,
  StarIcon,
  CalendarIcon,
  PackageIcon,
  EuroIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react"

export default function ProSessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { handleErrorWithRetry } = useErrorHandler()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [acceptRejectOpen, setAcceptRejectOpen] = useState(false)
  const [acceptRejectAction, setAcceptRejectAction] = useState<'accept' | 'reject'>('accept')
  const [validateOpen, setValidateOpen] = useState(false)

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
          <Button className="mt-4" onClick={() => router.push('/dashboard/pro/sessions')}>
            Retour aux sessions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/pro/sessions')}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux sessions
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Session de {session.tester?.firstName} {session.tester?.lastName}
            </h1>
            <p className="text-muted-foreground mt-2">
              Campagne: {session.campaign?.title}
            </p>
          </div>
          <StatusBadge status={session.status} size="lg" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Progression</CardTitle>
              <CardDescription>
                Suivi de l'avancement de la session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionTimeline currentStatus={session.status} isPro={true} />
            </CardContent>
          </Card>

          {/* Actions */}
          {(session.status === 'PENDING' || session.status === 'SUBMITTED') && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Que souhaitez-vous faire ?
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {session.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => {
                        setAcceptRejectAction('accept')
                        setAcceptRejectOpen(true)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2Icon className="mr-2 h-4 w-4" />
                      Accepter la candidature
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAcceptRejectAction('reject')
                        setAcceptRejectOpen(true)
                      }}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircleIcon className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                  </>
                )}

                {session.status === 'SUBMITTED' && (
                  <Button onClick={() => setValidateOpen(true)}>
                    <CheckCircle2Icon className="mr-2 h-4 w-4" />
                    Valider le test
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
                  <p className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {new Date(session.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {session.acceptedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date d'acceptation</p>
                    <p className="font-medium">
                      {new Date(session.acceptedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {session.applicationMessage && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message de candidature</p>
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-sm">"{session.applicationMessage}"</p>
                  </div>
                </div>
              )}

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

              {session.rating && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Votre note</p>
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{session.rating}/5</span>
                  </div>
                  {session.ratingComment && (
                    <p className="text-sm text-muted-foreground mt-2 italic">"{session.ratingComment}"</p>
                  )}
                </div>
              )}

              {session.rejectionReason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-900 mb-1">Raison du refus</p>
                  <p className="text-sm text-red-700">{session.rejectionReason}</p>
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

          {/* Chat */}
          {session.tester && session.status !== 'REJECTED' && session.status !== 'CANCELLED' && (
            <SessionChat sessionId={session.id} sellerId={session.tester.id} isPro={true} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tester Info */}
          {session.tester && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Testeur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">
                    {session.tester.firstName} {session.tester.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <MailIcon className="h-4 w-4" />
                    {session.tester.email}
                  </p>
                </div>

                {session.tester.averageRating && (
                  <div>
                    <p className="text-sm text-muted-foreground">Note moyenne</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{session.tester.averageRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                )}

                {session.tester.completedSessionsCount !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tests complétés</p>
                    <p className="font-medium">{session.tester.completedSessionsCount}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Campaign Info */}
          {session.campaign && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageIcon className="h-5 w-5" />
                  Campagne
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{session.campaign.title}</p>
                  {session.campaign.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.campaign.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/pro/campaigns/${session.campaign?.id}`)}
                >
                  Voir la campagne
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {session && (
        <>
          <AcceptRejectDialog
            session={session}
            action={acceptRejectAction}
            open={acceptRejectOpen}
            onOpenChange={setAcceptRejectOpen}
            onSuccess={fetchSession}
          />
          <ValidateTestDialog
            session={session}
            open={validateOpen}
            onOpenChange={setValidateOpen}
            onSuccess={fetchSession}
          />
        </>
      )}
    </div>
  )
}
