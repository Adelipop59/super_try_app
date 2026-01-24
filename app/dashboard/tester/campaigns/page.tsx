"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, EligibleCampaign, EligibleCampaignFull, PaginationMeta } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { KycVerificationBanner } from "@/components/kyc-verification-banner"
import { ApplyCampaignDialog } from "@/components/apply-campaign-dialog"
import {
  RocketIcon,
  ShieldCheckIcon,
  PackageIcon,
  CalendarIcon,
  LockIcon,
  EuroIcon,
  TruckIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

export default function CampaignsPage() {
  const { user } = useAuth()
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

      {/* KYC Banner */}
      {!isKycVerified && (
        <div className="px-4 lg:px-6">
          <KycVerificationBanner onStatusChange={() => {
            fetchKycStatus()
            fetchCampaigns(currentPage)
          }} />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-purple-200 bg-purple-50/50">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">Campagnes disponibles</p>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {pagination?.total || 0}
              </p>
            </div>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">Page actuelle</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {currentPage} / {pagination?.totalPages || 1}
              </p>
            </div>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">Statut KYC</p>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2 capitalize">
                {kycStatus === 'verified' ? '✓ Vérifié' : kycStatus === 'pending' ? 'En attente' : kycStatus === 'failed' ? 'Échoué' : 'Non vérifié'}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="px-4 lg:px-6">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PackageIcon className="mx-auto h-12 w-12 opacity-20" />
            <p className="mt-4 text-sm">Aucune campagne disponible pour le moment</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Revenez plus tard pour découvrir de nouvelles opportunités
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => {
              const isFullData = isCampaignFull(campaign)
              const imageUrl = isFullData
                ? (campaign.products[0]?.product.imageUrl || '/placeholder-product.jpg')
                : (campaign.imageUrl || '/placeholder-product.jpg')

              const bonus = isFullData
                ? parseFloat(campaign.products[0]?.bonus || '0')
                : parseFloat(campaign.bonus || '0')

              return (
                <Card
                  key={campaign.id}
                  className={`group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                    campaign.requiresKyc ? 'opacity-90' : ''
                  }`}
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
                      {isFullData && (
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
                              <SparklesIcon className="h-4 w-4 text-emerald-600" />
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
                                <EuroIcon className="h-3.5 w-3.5 text-blue-600" />
                                <span className="text-xs text-blue-900">Prix remboursé</span>
                              </div>
                            )}
                            {campaign.products[0]?.reimbursedShipping && (
                              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-purple-50 border border-purple-200">
                                <TruckIcon className="h-3.5 w-3.5 text-purple-600" />
                                <span className="text-xs text-purple-900">Livraison remboursée</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {campaign.reimbursedPrice && (
                              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 border border-blue-200">
                                <EuroIcon className="h-3.5 w-3.5 text-blue-600" />
                                <span className="text-xs text-blue-900">Prix remboursé</span>
                              </div>
                            )}
                            {campaign.reimbursedShipping && (
                              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-purple-50 border border-purple-200">
                                <TruckIcon className="h-3.5 w-3.5 text-purple-600" />
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
                    </div>

                    {/* Apply Button */}
                    <Button
                      onClick={() => handleApply(campaign)}
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
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 lg:px-6 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchCampaigns(currentPage - 1)}
            disabled={!pagination.hasPreviousPage || loading}
          >
            Précédent
          </Button>
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {pagination.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchCampaigns(currentPage + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Apply Dialog */}
      {selectedCampaign && (
        <ApplyCampaignDialog
          open={applyDialogOpen}
          onOpenChange={setApplyDialogOpen}
          campaign={selectedCampaign}
          onSuccess={() => {
            setApplyDialogOpen(false)
            toast.success("Votre candidature a été envoyée avec succès")
          }}
        />
      )}
    </div>
  )
}
