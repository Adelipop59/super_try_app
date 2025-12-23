"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, EligibleCampaign, EligibleCampaignFull, EligibleCampaignLimited, PaginationMeta } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { KycVerificationBanner } from "@/components/kyc-verification-banner"
import {
  RocketIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  PackageIcon,
  CalendarIcon,
  UsersIcon,
  ShoppingBagIcon,
  LockIcon
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function CampaignsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { handleErrorWithRetry } = useErrorHandler()
  const [campaigns, setCampaigns] = useState<EligibleCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [kycStatus, setKycStatus] = useState<'unverified' | 'pending' | 'verified' | 'failed'>()

  const isKycVerified = kycStatus === 'verified'

  useEffect(() => {
    fetchKycStatus()
    fetchCampaigns(1)
  }, [user])

  const fetchKycStatus = async () => {
    try {
      const response = await api.getVerificationStatus()
      setKycStatus(response.status as any)
    } catch (error) {
      console.error('Error fetching KYC status:', error)
    }
  }

  const fetchCampaigns = async (page: number = 1) => {
    if (!user) return

    try {
      setLoading(true)
      const response = await api.getEligibleCampaigns(page, 20)
      setCampaigns(response.data)
      setPagination(response.meta)
      setCurrentPage(page)
    } catch (error) {
      handleErrorWithRetry(
        error,
        () => fetchCampaigns(page),
        'Impossible de charger les campagnes.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (campaign: EligibleCampaign) => {
    if (campaign.requiresKyc) {
      toast.error("Veuillez compléter votre vérification KYC pour postuler")
      return
    }
    // TODO: Implement application logic
    toast.info("Fonctionnalité de candidature en cours de développement")
  }

  const isCampaignFull = (campaign: EligibleCampaign): campaign is EligibleCampaignFull => {
    return !campaign.requiresKyc
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <RocketIcon className="h-8 w-8 text-purple-600" />
          Campagnes disponibles
        </h1>
        <p className="text-muted-foreground mt-2">
          Découvrez et participez aux campagnes de test
        </p>
      </div>

      {/* KYC Status Banner - Auto-fetches from backend, hides if verified */}
      <div className="px-4 lg:px-6">
        <KycVerificationBanner
          verificationStatus={user?.verificationStatus}
          autoFetch={true}
          hideIfVerified={true}
          onStatusChange={() => window.location.reload()}
        />
      </div>

      {/* Campaigns Stats */}
      {pagination && (
        <div className="grid gap-4 px-4 md:grid-cols-3 lg:px-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campagnes disponibles</CardTitle>
              <PackageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
              <p className="text-xs text-muted-foreground">
                {!kycStatus ? "" : isKycVerified ? "Toutes les campagnes" : "Limité à 50 campagnes"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page actuelle</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentPage} / {pagination.totalPages}
              </div>
              <p className="text-xs text-muted-foreground">
                {campaigns.length} campagne(s) affichée(s)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statut KYC</CardTitle>
              <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {!kycStatus ? (
                  <Badge variant="outline">Chargement...</Badge>
                ) : kycStatus === 'verified' ? (
                  <Badge className="bg-green-600">Vérifié</Badge>
                ) : kycStatus === 'pending' ? (
                  <Badge className="bg-blue-600">En cours</Badge>
                ) : kycStatus === 'failed' ? (
                  <Badge className="bg-red-600">Échec</Badge>
                ) : (
                  <Badge className="bg-orange-600">Non vérifié</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {!kycStatus ? "Vérification du statut..." : isKycVerified ? "Accès complet" : "Accès limité"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns List */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Liste des campagnes</CardTitle>
            <CardDescription>
              {!kycStatus
                ? "Chargement des campagnes..."
                : isKycVerified
                ? "Toutes les campagnes éligibles pour vous"
                : "Aperçu des campagnes - Vérifiez votre identité pour voir plus de détails"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg border">
                    <Skeleton className="h-24 w-24 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PackageIcon className="mx-auto h-12 w-12 opacity-20" />
                  <p className="mt-4 text-sm">Aucune campagne disponible pour le moment</p>
                  <p className="mt-1 text-xs">
                    Revenez plus tard pour découvrir de nouvelles opportunités
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const isFullData = isCampaignFull(campaign)

                  return (
                    <Card
                      key={campaign.id}
                      className={`overflow-hidden transition-all hover:shadow-md ${
                        campaign.requiresKyc ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex gap-4 p-4">
                        {/* Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={campaign.imageUrl}
                            alt={isFullData ? campaign.title : "Product"}
                            className={`h-24 w-24 rounded-md object-cover ${
                              campaign.requiresKyc ? 'blur-md' : ''
                            }`}
                          />
                          {campaign.requiresKyc && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <LockIcon className="h-8 w-8 text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          {/* Title and KYC Badge */}
                          <div className="flex items-start justify-between">
                            <div>
                              {isFullData ? (
                                <>
                                  <h3 className="font-semibold text-lg">{campaign.title}</h3>
                                  {campaign.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {campaign.description}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <h3 className="font-semibold text-lg text-gray-400">
                                    Campagne masquée
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Complétez votre vérification KYC pour voir les détails
                                  </p>
                                </>
                              )}
                            </div>
                            {campaign.requiresKyc && (
                              <Badge variant="outline" className="border-orange-500 text-orange-600">
                                <LockIcon className="mr-1 h-3 w-3" />
                                KYC requis
                              </Badge>
                            )}
                          </div>

                          {/* Campaign Info */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {isFullData ? (
                              <>
                                {campaign.seller && (
                                  <div className="flex items-center gap-1">
                                    <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      {campaign.seller.companyName || campaign.seller.email}
                                    </span>
                                  </div>
                                )}
                                {campaign.availableSlots !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      {campaign.availableSlots} place(s) disponible(s)
                                    </span>
                                  </div>
                                )}
                                {campaign.startDate && (
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      Début: {new Date(campaign.startDate).toLocaleDateString("fr-FR")}
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center gap-1">
                                <AlertCircleIcon className="h-4 w-4 text-orange-600" />
                                <span className="text-orange-600">
                                  Informations masquées
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Rewards */}
                          <div className="flex flex-wrap gap-3 pt-2">
                            {(isFullData ? campaign.products : [{ bonus: campaign.bonus, reimbursedPrice: campaign.reimbursedPrice, reimbursedShipping: campaign.reimbursedShipping }]).map((item, idx) => (
                              <div key={idx} className="flex gap-2">
                                {parseFloat(item.bonus) > 0 && (
                                  <Badge className="bg-green-600">
                                    <TrendingUpIcon className="mr-1 h-3 w-3" />
                                    Bonus: {item.bonus}€
                                  </Badge>
                                )}
                                {item.reimbursedPrice && (
                                  <Badge variant="outline" className="border-blue-500 text-blue-600">
                                    Prix remboursé
                                  </Badge>
                                )}
                                {item.reimbursedShipping && (
                                  <Badge variant="outline" className="border-purple-500 text-purple-600">
                                    Frais de port remboursés
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Products (for full data) */}
                          {isFullData && campaign.products && campaign.products.length > 0 && (
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground mb-2">Produits:</p>
                              <div className="flex flex-wrap gap-2">
                                {campaign.products.map((prod, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {prod.product.name}
                                    {prod.product.category && ` - ${prod.product.category.name}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-2">
                            <Button
                              onClick={() => handleApply(campaign)}
                              disabled={campaign.requiresKyc}
                              variant={campaign.requiresKyc ? "outline" : "default"}
                              size="sm"
                            >
                              {campaign.requiresKyc ? (
                                <>
                                  <LockIcon className="mr-2 h-4 w-4" />
                                  Vérifiez votre KYC
                                </>
                              ) : (
                                <>
                                  <RocketIcon className="mr-2 h-4 w-4" />
                                  Postuler
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => fetchCampaigns(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage || loading}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} sur {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchCampaigns(currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Suivant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
