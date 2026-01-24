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
import { ApplyCampaignDialog } from "@/components/apply-campaign-dialog"
import {
  RocketIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  PackageIcon,
  CalendarIcon,
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
  const [selectedCampaign, setSelectedCampaign] = useState<EligibleCampaignFull | null>(null)
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)

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

    // Only show dialog for full campaigns (KYC verified users)
    if (isCampaignFull(campaign)) {
      setSelectedCampaign(campaign)
      setApplyDialogOpen(true)
    }
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

                  // Get image from products[0].product.images JSON array
                  let imageUrl = '/placeholder-product.jpg'
                  if (isFullData && campaign.products[0]?.product?.images) {
                    try {
                      const images = typeof campaign.products[0].product.images === 'string'
                        ? JSON.parse(campaign.products[0].product.images)
                        : campaign.products[0].product.images
                      if (Array.isArray(images) && images.length > 0) {
                        imageUrl = images[0]
                      }
                    } catch (e) {
                      console.error('Error parsing product images:', e)
                    }
                  } else if (!isFullData && campaign.images) {
                    try {
                      const images = typeof campaign.images === 'string'
                        ? JSON.parse(campaign.images)
                        : campaign.images
                      if (Array.isArray(images) && images.length > 0) {
                        imageUrl = images[0]
                      }
                    } catch (e) {
                      console.error('Error parsing campaign images:', e)
                    }
                  }

                  const bonus = isFullData
                    ? parseFloat(campaign.products[0]?.bonus || '0')
                    : parseFloat(campaign.bonus || '0')

                  return (
                    <Card
                      key={campaign.id}
                      className={`group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                        campaign.requiresKyc ? 'opacity-90' : ''
                      }`}
                      onClick={() => handleApply(campaign)}
                    >
                      {/* Image Header with Overlay */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100">
                        <img
                          src={imageUrl}
                          alt={isFullData ? campaign.title : "Produit"}
                          className={`h-full w-full object-cover transition-transform group-hover:scale-110 ${
                            campaign.requiresKyc ? 'blur-lg' : ''
                          }`}
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                          {/* KYC Badge */}
                          {campaign.requiresKyc && (
                            <Badge className="bg-orange-500/90 text-white border-0 shadow-lg backdrop-blur-sm">
                              <LockIcon className="mr-1 h-3 w-3" />
                              KYC Requis
                            </Badge>
                          )}

                          {/* Slots Badge */}
                          {isFullData && campaign.availableSlots !== undefined && (
                            <Badge className="bg-blue-500/90 text-white border-0 shadow-lg backdrop-blur-sm ml-auto">
                              {campaign.availableSlots} places
                            </Badge>
                          )}
                        </div>

                        {/* Lock Icon Overlay for KYC Required */}
                        {campaign.requiresKyc && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-white/20 backdrop-blur-sm p-6">
                              <LockIcon className="h-12 w-12 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-4">
                        {/* Title & Description */}
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg line-clamp-2 text-gray-900">
                            {isFullData ? campaign.title : 'Campagne disponible'}
                          </h3>
                          {isFullData && campaign.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {campaign.description}
                            </p>
                          )}
                        </div>

                        {/* Info Grid */}
                        <div className="space-y-2">
                          {/* Bonus */}
                          {bonus > 0 && (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                              <div className="flex items-center gap-2">
                                <div className="rounded-full bg-emerald-100 p-1.5">
                                  <TrendingUpIcon className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span className="text-xs font-medium text-emerald-900">Bonus</span>
                              </div>
                              <span className="text-sm font-bold text-emerald-600">
                                {bonus.toFixed(2)}€
                              </span>
                            </div>
                          )}

                          {/* Reimbursement Info */}
                          <div className="grid grid-cols-2 gap-2">
                            {isFullData ? (
                              <>
                                {campaign.products[0]?.reimbursedPrice && (
                                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 border border-blue-200">
                                    <ShoppingBagIcon className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-xs text-blue-900">Prix remboursé</span>
                                  </div>
                                )}
                                {campaign.products[0]?.reimbursedShipping && (
                                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-purple-50 border border-purple-200">
                                    <PackageIcon className="h-3.5 w-3.5 text-purple-600" />
                                    <span className="text-xs text-purple-900">Livraison remboursée</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {campaign.reimbursedPrice && (
                                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 border border-blue-200">
                                    <ShoppingBagIcon className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-xs text-blue-900">Prix remboursé</span>
                                  </div>
                                )}
                                {campaign.reimbursedShipping && (
                                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-purple-50 border border-purple-200">
                                    <PackageIcon className="h-3.5 w-3.5 text-purple-600" />
                                    <span className="text-xs text-purple-900">Livraison remboursée</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Seller Info */}
                          {isFullData && campaign.seller && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                              <span className="font-medium">Vendeur:</span>
                              <span className="truncate">
                                {campaign.seller.companyName || campaign.seller.email}
                              </span>
                            </div>
                          )}

                          {/* Start Date */}
                          {isFullData && campaign.startDate && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              <span>Début: {new Date(campaign.startDate).toLocaleDateString("fr-FR")}</span>
                            </div>
                          )}

                          {/* Products List */}
                          {isFullData && campaign.products && campaign.products.length > 0 && (
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground mb-2">Produits:</p>
                              <div className="flex flex-wrap gap-2">
                                {campaign.products.map((prod, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {prod.product.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Apply Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApply(campaign)
                          }}
                          disabled={campaign.requiresKyc}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                        >
                          {campaign.requiresKyc ? (
                            <>
                              <LockIcon className="mr-2 h-4 w-4" />
                              KYC requis
                            </>
                          ) : (
                            <>
                              <RocketIcon className="mr-2 h-4 w-4" />
                              Postuler
                            </>
                          )}
                        </Button>
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

      {/* Apply Campaign Dialog */}
      <ApplyCampaignDialog
        campaign={selectedCampaign}
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        onSuccess={fetchCampaigns}
      />
    </div>
  )
}
