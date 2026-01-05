"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { api, Session, SessionStatus } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/status-badge"
import { AcceptRejectDialog } from "@/components/accept-reject-dialog"
import {
  ArrowLeftIcon,
  UsersIcon,
  FilterIcon,
} from "lucide-react"

export default function CampaignApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleErrorWithRetry } = useErrorHandler()

  const [applications, setApplications] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Session | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<'accept' | 'reject'>('accept')

  const statusFilter = searchParams.get('status') as SessionStatus | null

  const fetchApplications = async () => {
    if (!params.id) return

    try {
      setLoading(true)
      const data = await api.getCampaignApplications(params.id as string, statusFilter || undefined)
      setApplications(data.data || data)
    } catch (error) {
      handleErrorWithRetry(
        error,
        fetchApplications,
        'Impossible de charger les candidatures.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [params.id, statusFilter])

  const handleAction = (application: Session, action: 'accept' | 'reject') => {
    setSelectedApplication(application)
    setDialogAction(action)
    setDialogOpen(true)
  }

  const filterByStatus = (status: SessionStatus | null) => {
    const url = new URL(window.location.href)
    if (status) {
      url.searchParams.set('status', status)
    } else {
      url.searchParams.delete('status')
    }
    router.push(url.pathname + url.search)
  }

  const statusCounts = {
    all: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    ACCEPTED: applications.filter(a => a.status === 'ACCEPTED').length,
    IN_PROGRESS: applications.filter(a => ['IN_PROGRESS', 'PURCHASE_SUBMITTED', 'SUBMITTED'].includes(a.status)).length,
    COMPLETED: applications.filter(a => a.status === 'COMPLETED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
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
          onClick={() => router.push(`/dashboard/pro/campaigns/${params.id}`)}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à la campagne
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Candidatures</h1>
            <p className="text-muted-foreground mt-2">
              Gérez les candidatures pour cette campagne
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {applications.length} candidature(s)
          </Badge>
        </div>
      </div>

      {/* Filters Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            <CardTitle>Filtrer par statut</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter || 'all'} onValueChange={(value) => filterByStatus(value === 'all' ? null : value as SessionStatus)}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">
                Toutes ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="PENDING">
                En attente ({statusCounts.PENDING})
              </TabsTrigger>
              <TabsTrigger value="ACCEPTED">
                Acceptées ({statusCounts.ACCEPTED})
              </TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">
                En cours ({statusCounts.IN_PROGRESS})
              </TabsTrigger>
              <TabsTrigger value="COMPLETED">
                Complétées ({statusCounts.COMPLETED})
              </TabsTrigger>
              <TabsTrigger value="REJECTED">
                Rejetées ({statusCounts.REJECTED})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardContent className="pt-6">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {statusFilter ? `Aucune candidature avec le statut ${statusFilter}` : 'Aucune candidature pour cette campagne'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <UsersIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {application.tester?.firstName} {application.tester?.lastName}
                        </p>
                        {(application.tester as any)?.averageRating && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {Number((application.tester as any).averageRating).toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {application.tester?.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Postulé le {new Date(application.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                      {(application as any).applicationMessage && (
                        <p className="text-sm mt-2 line-clamp-2">
                          "{(application as any).applicationMessage}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <StatusBadge status={application.status} />

                    {application.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleAction(application, 'accept')}
                        >
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleAction(application, 'reject')}
                        >
                          Refuser
                        </Button>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/dashboard/pro/sessions/${application.id}`)}
                    >
                      Voir détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accept/Reject Dialog */}
      {selectedApplication && (
        <AcceptRejectDialog
          session={selectedApplication}
          action={dialogAction}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchApplications}
        />
      )}
    </div>
  )
}
