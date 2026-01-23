"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api, Campaign, Session } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import {
  ArrowLeftIcon,
  UsersIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  TrendingUpIcon,
  CalendarIcon,
  EuroIcon,
  PackageIcon,
} from "lucide-react"

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { handleErrorWithRetry } = useErrorHandler()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [applications, setApplications] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!params.id) return

    try {
      setLoading(true)
      const [campaignData, applicationsData] = await Promise.all([
        api.getCampaign(params.id as string),
        api.getCampaignApplications(params.id as string)
      ])
      setCampaign(campaignData)
      setApplications(applicationsData.data || applicationsData)
    } catch (error) {
      handleErrorWithRetry(
        error,
        fetchData,
        'Impossible de charger les détails de la campagne.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Campagne introuvable</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/pro/campaigns')}>
            Retour aux campagnes
          </Button>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalApplications = applications.length
  const pendingApplications = applications.filter(a => a.status === 'PENDING').length
  const acceptedApplications = applications.filter(a => a.status === 'ACCEPTED').length
  const inProgressApplications = applications.filter(a => ['IN_PROGRESS', 'PURCHASE_SUBMITTED', 'SUBMITTED'].includes(a.status)).length
  const completedApplications = applications.filter(a => a.status === 'COMPLETED').length
  const rejectedApplications = applications.filter(a => a.status === 'REJECTED').length

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/pro/campaigns')}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux campagnes
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.title}</h1>
            <p className="text-muted-foreground mt-2">{campaign.description}</p>
          </div>
          <Badge
            className={
              campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' :
              campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 border-gray-200' :
              campaign.status === 'PENDING_PAYMENT' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              'bg-red-100 text-red-800 border-red-200'
            }
          >
            {campaign.status}
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidatures</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {campaign.totalSlots} places totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <ClockIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              À valider
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
            <CheckCircle2Icon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{acceptedApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              + {inProgressApplications} en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complétées</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {rejectedApplications} rejetées
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Campaign Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la campagne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date de début</p>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {campaign.startDate && new Date(campaign.startDate).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
                {campaign.endDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date de fin</p>
                    <p className="font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(campaign.endDate).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Places disponibles</p>
                <p className="font-medium">
                  {campaign.totalSlots - (campaign.usedSlots || 0)} / {campaign.totalSlots}
                </p>
              </div>

              {campaign.marketplace && (
                <div>
                  <p className="text-sm text-muted-foreground">Marketplace</p>
                  <p className="font-medium">
                    {campaign.marketplace === 'FR' && '🇫🇷 France'}
                    {campaign.marketplace === 'DE' && '🇩🇪 Allemagne'}
                    {campaign.marketplace === 'UK' && '🇬🇧 Royaume-Uni'}
                    {campaign.marketplace === 'US' && '🇺🇸 États-Unis'}
                    {campaign.marketplace === 'ES' && '🇪🇸 Espagne'}
                    {campaign.marketplace === 'IT' && '🇮🇹 Italie'}
                    {!['FR', 'DE', 'UK', 'US', 'ES', 'IT'].includes(campaign.marketplace) && campaign.marketplace}
                  </p>
                </div>
              )}

              {campaign.products && campaign.products.length > 0 && (() => {
                const product = campaign.products[0].product;
                const imageUrl = product?.images && Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0].url
                  : null;

                return (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Produit</p>
                    <div className="rounded-lg border p-3">
                      <div className="flex gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product?.name}
                            className="h-16 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                            <PackageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{product?.name}</p>
                          {product?.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Prix: </span>
                          <span className="font-medium">{campaign.products[0].expectedPrice}€</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bonus: </span>
                          <span className="font-medium text-green-600">{campaign.products[0].bonus}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <p className="text-sm text-muted-foreground">Acceptation automatique</p>
                <Badge variant={campaign.autoAcceptApplications ? "default" : "secondary"}>
                  {campaign.autoAcceptApplications ? "Activée" : "Désactivée"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Candidatures</CardTitle>
                  <CardDescription>
                    {totalApplications} candidature(s) au total
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/pro/campaigns/${campaign.id}/applications`)}
                >
                  Voir toutes les candidatures
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune candidature pour le moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/pro/sessions/${application.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <UsersIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {application.tester?.firstName} {application.tester?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(application.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                  ))}
                  {applications.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/pro/campaigns/${campaign.id}/applications`)}
                    >
                      Voir {applications.length - 5} candidature(s) de plus
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EuroIcon className="h-5 w-5" />
                Coût de la campagne
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.products && campaign.products.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prix unitaire:</span>
                    <span className="font-medium">{campaign.products?.[0]?.expectedPrice || 0}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais de port:</span>
                    <span className="font-medium">{campaign.products?.[0]?.shippingCost || 0}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bonus:</span>
                    <span className="font-medium text-green-600">{campaign.products?.[0]?.bonus || 0}€</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Coût par testeur:</span>
                      <span className="font-bold">
                        {((Number(campaign.products?.[0]?.expectedPrice) || 0) + (Number(campaign.products?.[0]?.shippingCost) || 0) + (Number(campaign.products?.[0]?.bonus) || 0)).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Coût total:</span>
                      <span className="font-bold text-lg">
                        {(((Number(campaign.products?.[0]?.expectedPrice) || 0) + (Number(campaign.products?.[0]?.shippingCost) || 0) + (Number(campaign.products?.[0]?.bonus) || 0)) * Number(campaign.totalSlots)).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/pro/campaigns/${campaign.id}/applications?status=PENDING`)}
                disabled={pendingApplications === 0}
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                Candidatures en attente ({pendingApplications})
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/pro/campaigns/${campaign.id}/applications?status=SUBMITTED`)}
                disabled={applications.filter(a => a.status === 'SUBMITTED').length === 0}
              >
                <CheckCircle2Icon className="mr-2 h-4 w-4" />
                Tests à valider ({applications.filter(a => a.status === 'SUBMITTED').length})
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
