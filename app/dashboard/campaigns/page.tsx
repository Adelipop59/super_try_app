"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api, Campaign, Product, CampaignProduct, CreateDistributionData, DistributionType, ProcedureTemplate, StepType, CreateStepTemplateData, Distribution, Procedure, CampaignCriteria, CriteriaTemplate } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, PencilIcon, Trash2Icon, AlertTriangleIcon, PackageIcon, XIcon, CalendarIcon, CheckIcon, ListChecksIcon, ChevronUpIcon, ChevronDownIcon, GripVerticalIcon, ClipboardListIcon, EyeIcon, CreditCardIcon, FilterIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { toast } from "sonner"
import { CampaignsDataTable } from "@/components/campaigns-data-table"
import { PaymentDialog } from "@/components/payment-dialog"
import { CampaignProductConfig } from "@/components/campaign-product-config"
import { CampaignCriteriaConfig } from "@/components/campaign-criteria-config"

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="default" className="bg-green-500">Active</Badge>
    case 'DRAFT':
      return <Badge variant="secondary">Brouillon</Badge>
    case 'PENDING_PAYMENT':
      return <Badge variant="outline" className="border-orange-500 text-orange-600">En attente de paiement</Badge>
    case 'PAUSED':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">En pause</Badge>
    case 'COMPLETED':
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Terminée</Badge>
    case 'CANCELLED':
      return <Badge variant="outline" className="border-red-500 text-red-600">Annulée</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function CampaignsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [procedureTemplates, setProcedureTemplates] = useState<ProcedureTemplate[]>([])
  const [criteriaTemplates, setCriteriaTemplates] = useState<CriteriaTemplate[]>([])
  const [loading, setLoading] = useState(true)

  // Edit state
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editStep, setEditStep] = useState(1)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalSlots: 0,
  })
  const [editProduct, setEditProduct] = useState<{
    productId: string
    quantity: number
    expectedPrice: number
    shippingCost: number
    reimbursedPrice: boolean
    reimbursedShipping: boolean
    bonus: number
  } | null>(null)
  const [editDistributions, setEditDistributions] = useState<{
    id?: string
    type: DistributionType
    dayOfWeek?: number
    specificDate?: string
    maxUnits: number
    isActive: boolean
  }[]>([])
  const [editProcedures, setEditProcedures] = useState<Procedure[]>([])
  const [editSelectedTemplateId, setEditSelectedTemplateId] = useState<string>('')
  const [editProcedureMode, setEditProcedureMode] = useState<'existing' | 'template' | 'create'>('existing')
  const [editInlineProcedure, setEditInlineProcedure] = useState({
    title: '',
    description: '',
  })
  const [editInlineSteps, setEditInlineSteps] = useState<{
    title: string
    description: string
    type: StepType
    isRequired: boolean
    checklistItems: string[]
  }[]>([])
  const [editCriteria, setEditCriteria] = useState<Partial<CampaignCriteria>>({})
  const [editHasExistingCriteria, setEditHasExistingCriteria] = useState(false)
  const [editCriteriaMode, setEditCriteriaMode] = useState<'manual' | 'template'>('manual')
  const [editSelectedCriteriaTemplateId, setEditSelectedCriteriaTemplateId] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEditData, setIsLoadingEditData] = useState(false)

  // Details state
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [detailsDistributions, setDetailsDistributions] = useState<Distribution[]>([])
  const [detailsProcedures, setDetailsProcedures] = useState<Procedure[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Create state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalSlots: 10,
  })
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: string
    quantity: number
    expectedPrice: number
    shippingCost: number
    reimbursedPrice: boolean
    reimbursedShipping: boolean
    bonus: number
  } | null>(null)
  const [distributions, setDistributions] = useState<{
    type: DistributionType
    dayOfWeek?: number
    specificDate?: string
    maxUnits: number
    isActive: boolean
  }[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [procedureMode, setProcedureMode] = useState<'template' | 'create'>('template')
  const [inlineProcedure, setInlineProcedure] = useState({
    title: '',
    description: '',
  })
  const [inlineSteps, setInlineSteps] = useState<{
    title: string
    description: string
    type: StepType
    isRequired: boolean
    checklistItems: string[]
  }[]>([])
  const [createCriteria, setCreateCriteria] = useState<Partial<CampaignCriteria>>({})
  const [createCriteriaMode, setCreateCriteriaMode] = useState<'manual' | 'template'>('manual')
  const [createSelectedCriteriaTemplateId, setCreateSelectedCriteriaTemplateId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)

  const STEP_TYPES: { value: StepType; label: string }[] = [
    { value: 'TEXT', label: 'Texte' },
    { value: 'PHOTO', label: 'Photo' },
    { value: 'VIDEO', label: 'Vidéo' },
    { value: 'CHECKLIST', label: 'Checklist' },
    { value: 'RATING', label: 'Note' },
    { value: 'PRICE_VALIDATION', label: 'Validation prix' },
  ]

  const DAYS_OF_WEEK = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
  ]

  // Delete state
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Payment state
  const [payingCampaign, setPayingCampaign] = useState<Campaign | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [user])

  // Handle payment return from Stripe
  useEffect(() => {
    const payment = searchParams.get('payment')
    const campaignId = searchParams.get('campaign')

    if (payment === 'success' && campaignId) {
      toast.success('Paiement réussi !', {
        description: 'Votre campagne a été activée avec succès.',
      })
      // Refresh campaigns to show updated status
      fetchData()
      // Remove query params from URL
      router.replace('/dashboard/campaigns')
    } else if (payment === 'cancelled' && campaignId) {
      toast.info('Paiement annulé', {
        description: 'Le paiement a été annulé. Vous pouvez réessayer quand vous voulez.',
      })
      // Remove query params from URL
      router.replace('/dashboard/campaigns')
    }
  }, [searchParams])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [campaignsData, productsData, templatesData, criteriaTemplatesData] = await Promise.all([
        api.getMyCampaigns(),
        api.getMyProducts(),
        api.getProcedureTemplates(),
        api.getCriteriaTemplates()
      ])
      setCampaigns(campaignsData)
      setProducts(productsData)
      setProcedureTemplates(templatesData)
      setCriteriaTemplates(criteriaTemplatesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setCampaigns([])
      setProducts([])
      setProcedureTemplates([])
      setCriteriaTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    if (!user) return

    try {
      const data = await api.getMyCampaigns()
      setCampaigns(data)
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
      setCampaigns([])
    }
  }

  const handleEditClick = async (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setEditForm({
      title: campaign.title,
      description: campaign.description || '',
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      totalSlots: campaign.totalSlots,
    })

    // Set product from campaign
    if (campaign.products && campaign.products.length > 0) {
      const cp = campaign.products[0]
      setEditProduct({
        productId: cp.productId,
        quantity: cp.quantity || 1,
        expectedPrice: cp.expectedPrice || cp.product?.price || 0,
        shippingCost: cp.shippingCost || cp.product?.shippingCost || 0,
        reimbursedPrice: cp.reimbursedPrice ?? true,
        reimbursedShipping: cp.reimbursedShipping ?? true,
        bonus: cp.bonus || 0,
      })
    } else {
      setEditProduct(null)
    }

    setEditStep(1)
    setIsEditSheetOpen(true)

    // Load distributions, procedures, and criteria
    setIsLoadingEditData(true)
    try {
      const [distributionsData, proceduresData, criteriaData] = await Promise.all([
        api.getDistributions(campaign.id),
        api.getProcedures(campaign.id),
        api.getCampaignCriteria(campaign.id)
      ])

      setEditDistributions(distributionsData.map(d => ({
        id: d.id,
        type: d.type,
        dayOfWeek: d.dayOfWeek ?? undefined,
        specificDate: d.specificDate ? d.specificDate.split('T')[0] : undefined,
        maxUnits: d.maxUnits,
        isActive: d.isActive
      })))

      setEditProcedures(proceduresData)
      setEditProcedureMode('existing')
      setEditSelectedTemplateId('')
      setEditInlineProcedure({ title: '', description: '' })
      setEditInlineSteps([])

      // Load existing criteria if any
      if (criteriaData) {
        setEditCriteria({
          minAge: criteriaData.minAge,
          maxAge: criteriaData.maxAge,
          minRating: criteriaData.minRating ? Number(criteriaData.minRating) : null,
          maxRating: criteriaData.maxRating ? Number(criteriaData.maxRating) : null,
          minCompletedSessions: criteriaData.minCompletedSessions,
          requiredGender: criteriaData.requiredGender,
          requiredCountries: criteriaData.requiredCountries || [],
          requiredLocations: criteriaData.requiredLocations || [],
          excludedLocations: criteriaData.excludedLocations || [],
          requiredCategories: criteriaData.requiredCategories || [],
          noActiveSessionWithSeller: criteriaData.noActiveSessionWithSeller,
          maxSessionsPerWeek: criteriaData.maxSessionsPerWeek,
          maxSessionsPerMonth: criteriaData.maxSessionsPerMonth,
          minCompletionRate: criteriaData.minCompletionRate ? Number(criteriaData.minCompletionRate) : null,
          maxCancellationRate: criteriaData.maxCancellationRate ? Number(criteriaData.maxCancellationRate) : null,
          minAccountAge: criteriaData.minAccountAge,
          lastActiveWithinDays: criteriaData.lastActiveWithinDays,
          requireVerified: criteriaData.requireVerified,
          requirePrime: criteriaData.requirePrime,
        })
        setEditHasExistingCriteria(true)
        setEditCriteriaMode('manual')
      } else {
        setEditCriteria({})
        setEditHasExistingCriteria(false)
        setEditCriteriaMode('manual')
      }
      setEditSelectedCriteriaTemplateId('')
    } catch (error) {
      console.error('Failed to load campaign data:', error)
      setEditDistributions([])
      setEditProcedures([])
    } finally {
      setIsLoadingEditData(false)
    }
  }

  const handleViewDetails = async (campaign: Campaign) => {
    setViewingCampaign(campaign)
    setIsDetailsDialogOpen(true)
    setIsLoadingDetails(true)

    try {
      const [distributionsData, proceduresData] = await Promise.all([
        api.getDistributions(campaign.id),
        api.getProcedures(campaign.id)
      ])

      setDetailsDistributions(distributionsData)
      setDetailsProcedures(proceduresData)
    } catch (error) {
      console.error('Failed to load campaign details:', error)
      setDetailsDistributions([])
      setDetailsProcedures([])
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Product handlers for Edit
  const handleEditSelectProduct = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setEditProduct({
        productId,
        expectedPrice: product.price,
        shippingCost: product.shippingCost || 0,
        reimbursedPrice: true,
        reimbursedShipping: true,
        bonus: 0
      })
    }
  }

  const handleEditUpdateProduct = (updates: Partial<{
    expectedPrice: number
    shippingCost: number
    reimbursedPrice: boolean
    reimbursedShipping: boolean
    bonus: number
  }>) => {
    if (editProduct) {
      setEditProduct({ ...editProduct, ...updates })
    }
  }

  const handleEditRemoveProduct = () => {
    setEditProduct(null)
  }

  // Product handlers for Create
  const handleSelectProduct = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setSelectedProduct({
        productId,
        quantity: 1,
        expectedPrice: product.price,
        shippingCost: product.shippingCost || 0,
        reimbursedPrice: true,
        reimbursedShipping: true,
        bonus: 0
      })
    }
  }

  const handleUpdateProduct = (updates: Partial<{
    expectedPrice: number
    shippingCost: number
    reimbursedPrice: boolean
    reimbursedShipping: boolean
    bonus: number
  }>) => {
    if (selectedProduct) {
      setSelectedProduct({ ...selectedProduct, ...updates })
    }
  }

  const handleRemoveProduct = () => {
    setSelectedProduct(null)
  }

  const handleEditSave = async () => {
    if (!editingCampaign) return

    try {
      setIsSaving(true)

      // Step 1: Update campaign basic info with products
      const updateData: {
        title: string
        description: string
        totalSlots: number
        startDate?: string
        endDate?: string
        products?: {
          productId: string
          quantity: number
          expectedPrice: number
        }[]
      } = {
        title: editForm.title,
        description: editForm.description,
        totalSlots: editProduct?.quantity || 0,  // Synchronisé avec quantity du produit
      }

      // Only include dates if they are set
      if (editForm.startDate) {
        updateData.startDate = new Date(editForm.startDate).toISOString()
      }
      if (editForm.endDate) {
        updateData.endDate = new Date(editForm.endDate).toISOString()
      }

      // Include product
      if (editProduct) {
        updateData.products = [editProduct]
      }

      await api.updateCampaign(editingCampaign.id, updateData)

      // Step 2: Handle criteria separately
      const hasActiveCriteria = Object.entries(editCriteria).some(([key, value]) => {
        if (key === 'id' || key === 'campaignId') return false
        if (value === null || value === undefined) return false
        if (Array.isArray(value) && value.length === 0) return false
        return true
      })

      if (hasActiveCriteria) {
        // Check if criteria already exist
        if (editHasExistingCriteria) {
          // Update existing criteria
          await api.updateCampaignCriteria(editingCampaign.id, editCriteria)
        } else {
          // Create new criteria
          await api.createCampaignCriteria(editingCampaign.id, editCriteria)
        }
      } else if (editHasExistingCriteria) {
        // Delete criteria if they exist but no active criteria set
        await api.deleteCampaignCriteria(editingCampaign.id)
      }

      // Handle distributions - delete existing and create new ones
      const existingDistributions = await api.getDistributions(editingCampaign.id)
      for (const dist of existingDistributions) {
        await api.deleteDistribution(editingCampaign.id, dist.id)
      }

      if (editDistributions.length > 0) {
        const distributionData: CreateDistributionData[] = editDistributions.map(d => ({
          type: d.type,
          dayOfWeek: d.dayOfWeek,
          specificDate: d.specificDate,
          maxUnits: d.maxUnits,
          isActive: d.isActive,
        }))
        await api.createDistributions(editingCampaign.id, distributionData)
      }

      // Handle procedures based on mode
      if (editProcedureMode === 'template' && editSelectedTemplateId) {
        // Delete existing procedures and copy template
        for (const proc of editProcedures) {
          await api.deleteProcedure(editingCampaign.id, proc.id)
        }
        await api.copyTemplateToCampaign(editSelectedTemplateId, editingCampaign.id, 1)
      } else if (editProcedureMode === 'create' && editInlineProcedure.title.trim()) {
        // Delete existing procedures and create new one
        for (const proc of editProcedures) {
          await api.deleteProcedure(editingCampaign.id, proc.id)
        }
        const procedureData = {
          title: editInlineProcedure.title,
          description: editInlineProcedure.description,
          order: 1,
          isRequired: true,
        }
        await api.createProcedure(editingCampaign.id, procedureData)
      }
      // If mode is 'existing', keep the current procedures

      toast.success('Campagne mise à jour avec succès')
      setIsEditSheetOpen(false)
      setEditingCampaign(null)
      setEditStep(1)
      fetchCampaigns()
    } catch (error) {
      console.error('Failed to update campaign:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la campagne'
      toast.error(errorMessage, {
        duration: 5000,
      })
      // Ne pas fermer la modal - l'utilisateur doit corriger les erreurs
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateSave = async () => {
    if (!createForm.title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    try {
      setIsCreating(true)

      const createData: {
        title: string
        description?: string
        totalSlots: number
        startDate?: string
        endDate?: string
        products?: {
          productId: string
          quantity: number
          expectedPrice: number
        }[]
      } = {
        title: createForm.title,
        description: createForm.description || undefined,
        totalSlots: selectedProduct?.quantity || 0,  // Synchronisé avec quantity du produit
      }

      if (createForm.startDate) {
        createData.startDate = new Date(createForm.startDate).toISOString()
      }
      if (createForm.endDate) {
        createData.endDate = new Date(createForm.endDate).toISOString()
      }
      if (selectedProduct) {
        createData.products = [selectedProduct]
      }

      // Step 1: Create campaign (without criteria)
      const campaign = await api.createCampaign(createData)

      // Step 2: Create criteria if any are set
      const hasActiveCriteria = Object.entries(createCriteria).some(([key, value]) => {
        if (key === 'id' || key === 'campaignId') return false
        if (value === null || value === undefined) return false
        if (Array.isArray(value) && value.length === 0) return false
        return true
      })
      if (hasActiveCriteria) {
        await api.createCampaignCriteria(campaign.id, createCriteria)
      }

      // Create distributions if any
      if (distributions.length > 0) {
        const distributionData: CreateDistributionData[] = distributions.map(d => ({
          type: d.type,
          dayOfWeek: d.dayOfWeek,
          specificDate: d.specificDate,
          maxUnits: d.maxUnits,
          isActive: d.isActive,
        }))
        await api.createDistributions(campaign.id, distributionData)
      }

      // Handle procedure - either copy template or create inline procedure
      if (procedureMode === 'template' && selectedTemplateId) {
        await api.copyTemplateToCampaign(selectedTemplateId, campaign.id, 1)
      } else if (procedureMode === 'create' && inlineProcedure.title.trim()) {
        // Create inline procedure with steps
        const procedureData = {
          title: inlineProcedure.title,
          description: inlineProcedure.description,
          order: 1,
          isRequired: true,
        }

        const procedure = await api.createProcedure(campaign.id, procedureData)

        // Note: Steps would need to be created separately if the API supports it
        // For now, we create the main procedure
        // The steps would be part of the procedure template system
      }

      toast.success('Campagne créée avec succès')
      setIsCreateDialogOpen(false)
      setCreateStep(1)
      setCreateForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        totalSlots: 10,
      })
      setSelectedProduct(null)
      setDistributions([])
      setSelectedTemplateId('')
      setProcedureMode('template')
      setInlineProcedure({ title: '', description: '' })
      setInlineSteps([])
      setCreateCriteria({})
      setCreateCriteriaMode('manual')
      setCreateSelectedCriteriaTemplateId('')
      fetchCampaigns()
    } catch (error) {
      console.error('Failed to create campaign:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la campagne'
      toast.error(errorMessage, {
        duration: 5000,
      })
      // Ne pas fermer la modal - l'utilisateur doit corriger les erreurs
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteClick = (campaign: Campaign) => {
    setDeletingCampaign(campaign)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCampaign) return

    try {
      setIsDeleting(true)
      await api.deleteCampaign(deletingCampaign.id)

      toast.success('Campagne supprimée avec succès')
      setIsDeleteDialogOpen(false)
      setDeletingCampaign(null)
      fetchCampaigns()
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      toast.error('Erreur lors de la suppression de la campagne')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePaymentClick = (campaign: Campaign) => {
    setPayingCampaign(campaign)
    setIsPaymentDialogOpen(true)
  }

  const handlePaymentSuccess = () => {
    setPayingCampaign(null)
    setIsPaymentDialogOpen(false)
    fetchCampaigns()
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Campagnes</h2>
                  <p className="text-muted-foreground">
                    Gérez vos campagnes de test produit
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        Vous n'avez pas encore de campagne
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Créer votre première campagne
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <CampaignsDataTable
                    data={campaigns}
                    onView={handleViewDetails}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onAdd={() => setIsCreateDialogOpen(true)}
                    onPayment={handlePaymentClick}
                  />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Create Campaign Dialog - Multi-step Wizard */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open)
        if (!open) {
          setCreateStep(1)
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PlusIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Nouvelle campagne</DialogTitle>
                <DialogDescription>
                  {createStep === 1 ? 'Informations generales et produits' : createStep === 2 ? 'Configuration des distributions' : createStep === 3 ? 'Criteres d\'eligibilite' : 'Selection de la procedure'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Step Indicators - Clickable for navigation */}
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              type="button"
              onClick={() => setCreateStep(1)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                createStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {createStep > 1 ? <CheckIcon className="h-4 w-4" /> : '1'}
              </div>
              <span className={`text-sm hidden sm:inline ${createStep >= 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Infos
              </span>
            </button>
            <div className={`h-px w-4 ${createStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <button
              type="button"
              onClick={() => {
                if (!createForm.title.trim()) {
                  toast.error('Le titre est requis pour passer a l\'etape suivante')
                  return
                }
                setCreateStep(2)
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                createStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {createStep > 2 ? <CheckIcon className="h-4 w-4" /> : '2'}
              </div>
              <span className={`text-sm hidden sm:inline ${createStep >= 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Distribution
              </span>
            </button>
            <div className={`h-px w-4 ${createStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <button
              type="button"
              onClick={() => {
                if (!createForm.title.trim()) {
                  toast.error('Le titre est requis pour passer a l\'etape suivante')
                  return
                }
                setCreateStep(3)
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                createStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {createStep > 3 ? <CheckIcon className="h-4 w-4" /> : '3'}
              </div>
              <span className={`text-sm hidden sm:inline ${createStep >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Criteres
              </span>
            </button>
            <div className={`h-px w-4 ${createStep >= 4 ? 'bg-primary' : 'bg-muted'}`} />
            <button
              type="button"
              onClick={() => {
                if (!createForm.title.trim()) {
                  toast.error('Le titre est requis pour passer a l\'etape suivante')
                  return
                }
                setCreateStep(4)
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                createStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                4
              </div>
              <span className={`text-sm hidden sm:inline ${createStep >= 4 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Procedure
              </span>
            </button>
          </div>

          {/* Step 1: Basic Info + Products */}
          {createStep === 1 && (
            <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="create-title" className="text-sm font-medium">
                  Titre de la campagne <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-title"
                  placeholder="Ex: Test produit été 2024"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="create-description"
                  placeholder="Décrivez votre campagne..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-startDate" className="text-sm font-medium">
                    Date de début
                  </Label>
                  <Input
                    id="create-startDate"
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-endDate" className="text-sm font-medium">
                    Date de fin
                  </Label>
                  <Input
                    id="create-endDate"
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">
                  Produits associés
                </Label>
                {products.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-muted/50 rounded-md">
                    <PackageIcon className="h-4 w-4" />
                    <span>Aucun produit disponible.</span>
                    <Link href="/dashboard/products" className="text-primary hover:underline font-medium">
                      Créer un produit
                    </Link>
                  </div>
                ) : (
                  <CampaignProductConfig
                    products={products}
                    selectedProduct={selectedProduct}
                    onSelectProduct={handleSelectProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onRemoveProduct={handleRemoveProduct}
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Distributions */}
          {createStep === 2 && (
            <div className="grid gap-5 py-4">
              {/* Validation quantity vs distributions - Sticky en haut */}
              <Card className="border-primary/20 bg-primary/5 sticky top-0 z-10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        {selectedProduct 
                          ? `Produits: ${selectedProduct.quantity}` 
                          : 'Aucun produit sélectionné'}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Distributions créées: {distributions.length} ligne(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedProduct && (() => {
                        const totalDistributed = distributions.reduce((sum, d) => sum + (d.maxUnits || 0), 0)
                        return totalDistributed === selectedProduct.quantity ? (
                          <Badge variant="default" className="bg-green-600">✓ Complet</Badge>
                        ) : totalDistributed > selectedProduct.quantity ? (
                          <Badge variant="destructive">
                            Dépassement: +{totalDistributed - selectedProduct.quantity}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {selectedProduct.quantity - totalDistributed} manquant(s)
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                  
                  {selectedProduct && distributions.length > 0 && (() => {
                    const totalDistributed = distributions.reduce((sum, d) => sum + (d.maxUnits || 0), 0)
                    const remaining = selectedProduct.quantity - totalDistributed
                    return (
                      <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                        <span className="text-muted-foreground">Produits distribués:</span>
                        <span className="font-medium">{totalDistributed}</span>
                        {remaining < 0 ? (
                          <span className="font-bold text-destructive">
                            ⚠️ Dépassement de {Math.abs(remaining)} produit{Math.abs(remaining) > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className={`font-bold ${remaining === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                            Restants: {remaining}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Dates de distribution
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDistributions([...distributions, {
                        type: 'SPECIFIC_DATE',
                        specificDate: '',
                        maxUnits: 1,
                        isActive: true,
                      }])
                    }}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Définissez quand et combien de produits seront distribués
                </p>
              </div>

              {distributions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune distribution configurée
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vous pouvez ajouter des distributions plus tard
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[100px]">Quantité</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributions.map((dist, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              type="date"
                              value={dist.specificDate || ''}
                              onChange={(e) => {
                                const newDist = [...distributions]
                                newDist[index].specificDate = e.target.value
                                setDistributions(newDist)
                              }}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={dist.maxUnits}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                const newDist = [...distributions]
                                newDist[index].maxUnits = parseInt(value) || 0
                                setDistributions(newDist)
                              }}
                              className="h-8 w-20 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setDistributions(distributions.filter((_, i) => i !== index))
                              }}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Criteria */}
          {createStep === 3 && (
            <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Criteres d'eligibilite</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choisissez un template ou configurez manuellement
                  </p>
                </div>
                <Link href="/dashboard/criteria-templates">
                  <Button type="button" variant="outline" size="sm">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Gerer les templates
                  </Button>
                </Link>
              </div>

              <Tabs value={createCriteriaMode} onValueChange={(v) => setCreateCriteriaMode(v as 'manual' | 'template')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="template">Template</TabsTrigger>
                  <TabsTrigger value="manual">Manuel</TabsTrigger>
                </TabsList>

                <TabsContent value="template" className="mt-4">
                  {criteriaTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md">
                      <FilterIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Aucun template de criteres disponible
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vous pouvez en creer dans la section Criteres
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Template</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {criteriaTemplates.map((template) => (
                            <TableRow
                              key={template.id}
                              className={createSelectedCriteriaTemplateId === template.id ? 'bg-primary/5' : ''}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <FilterIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{template.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant={createSelectedCriteriaTemplateId === template.id ? "default" : "ghost"}
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    if (createSelectedCriteriaTemplateId === template.id) {
                                      setCreateSelectedCriteriaTemplateId('')
                                      setCreateCriteria({})
                                    } else {
                                      setCreateSelectedCriteriaTemplateId(template.id)
                                      // Load criteria from template
                                      setCreateCriteria({
                                        minAge: template.minAge,
                                        maxAge: template.maxAge,
                                        minRating: template.minRating ? Number(template.minRating) : null,
                                        maxRating: template.maxRating ? Number(template.maxRating) : null,
                                        minCompletedSessions: template.minCompletedSessions,
                                        requiredGender: template.requiredGender,
                                        requiredCountries: template.requiredCountries,
                                        requiredLocations: template.requiredLocations,
                                        excludedLocations: template.excludedLocations,
                                        requiredCategories: template.requiredCategories,
                                        noActiveSessionWithSeller: template.noActiveSessionWithSeller,
                                        maxSessionsPerWeek: template.maxSessionsPerWeek,
                                        maxSessionsPerMonth: template.maxSessionsPerMonth,
                                        minCompletionRate: template.minCompletionRate ? Number(template.minCompletionRate) : null,
                                        maxCancellationRate: template.maxCancellationRate ? Number(template.maxCancellationRate) : null,
                                        minAccountAge: template.minAccountAge,
                                        lastActiveWithinDays: template.lastActiveWithinDays,
                                        requireVerified: template.requireVerified,
                                        requirePrime: template.requirePrime,
                                      })
                                    }
                                  }}
                                >
                                  {createSelectedCriteriaTemplateId === template.id ? (
                                    <CheckIcon className="h-4 w-4" />
                                  ) : (
                                    <PlusIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manual" className="mt-4">
                  <CampaignCriteriaConfig
                    criteria={createCriteria}
                    onUpdateCriteria={(updates) => setCreateCriteria({ ...createCriteria, ...updates })}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Step 4: Procedure Selection or Creation */}
          {createStep === 4 && (
            <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Procedure de test</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choisissez un template existant ou ignorez cette etape
                  </p>
                </div>
                <Link href="/dashboard/procedures">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Creer une procedure
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4">

                    {procedureTemplates.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md">
                        <ListChecksIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Aucun template de procedure disponible
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vous pouvez en creer dans la section Procedures
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Template</TableHead>
                              <TableHead className="w-[80px]">Etapes</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {procedureTemplates.map((template) => (
                              <TableRow
                                key={template.id}
                                className={selectedTemplateId === template.id ? 'bg-primary/5' : ''}
                              >
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{template.name}</div>
                                    <div className="text-xs text-muted-foreground">{template.title}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {template.steps.length}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant={selectedTemplateId === template.id ? "default" : "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setSelectedTemplateId(
                                      selectedTemplateId === template.id ? '' : template.id
                                    )}
                                  >
                                    {selectedTemplateId === template.id ? (
                                      <CheckIcon className="h-4 w-4" />
                                    ) : (
                                      <PlusIcon className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {createStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    if (!createForm.title.trim()) {
                      toast.error('Le titre est requis')
                      return
                    }
                    setCreateStep(2)
                  }}
                >
                  Suivant
                </Button>
              </>
            ) : createStep === 2 ? (
              <>
                <Button variant="outline" onClick={() => setCreateStep(1)}>
                  Retour
                </Button>
                <Button onClick={() => setCreateStep(3)}>
                  Suivant
                </Button>
              </>
            ) : createStep === 3 ? (
              <>
                <Button variant="outline" onClick={() => setCreateStep(2)}>
                  Retour
                </Button>
                <Button onClick={() => setCreateStep(4)}>
                  Suivant
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCreateStep(3)}>
                  Retour
                </Button>
                <Button onClick={handleCreateSave} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creation...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Creer la campagne
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog - Multi-step Wizard */}
      <Dialog open={isEditSheetOpen} onOpenChange={(open) => {
        setIsEditSheetOpen(open)
        if (!open) {
          setEditStep(1)
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PencilIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Modifier la campagne</DialogTitle>
                <DialogDescription>
                  {editStep === 1 ? 'Informations generales et produits' : editStep === 2 ? 'Configuration des distributions' : editStep === 3 ? 'Criteres d\'eligibilite' : 'Gestion des procedures'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              type="button"
              onClick={() => setEditStep(1)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                editStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {editStep > 1 ? <CheckIcon className="h-4 w-4" /> : '1'}
              </div>
              <span className={`text-sm hidden sm:inline ${editStep >= 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Infos
              </span>
            </button>
            <div className={`h-px w-4 ${editStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <button
              type="button"
              onClick={() => setEditStep(2)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                editStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {editStep > 2 ? <CheckIcon className="h-4 w-4" /> : '2'}
              </div>
              <span className={`text-sm hidden sm:inline ${editStep >= 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Distribution
              </span>
            </button>
            <div className={`h-px w-4 ${editStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <button
              type="button"
              onClick={() => setEditStep(3)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                editStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {editStep > 3 ? <CheckIcon className="h-4 w-4" /> : '3'}
              </div>
              <span className={`text-sm hidden sm:inline ${editStep >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Criteres
              </span>
            </button>
            <div className={`h-px w-4 ${editStep >= 4 ? 'bg-primary' : 'bg-muted'}`} />
            <button
              type="button"
              onClick={() => setEditStep(4)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                editStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                4
              </div>
              <span className={`text-sm hidden sm:inline ${editStep >= 4 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Procedure
              </span>
            </button>
          </div>

          {isLoadingEditData ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Step 1: Basic Info + Products */}
              {editStep === 1 && (
                <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title" className="text-sm font-medium">
                      Titre de la campagne <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-title"
                      placeholder="Ex: Test produit été 2024"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Décrivez votre campagne..."
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-startDate" className="text-sm font-medium">
                        Date de début
                      </Label>
                      <Input
                        id="edit-startDate"
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-endDate" className="text-sm font-medium">
                        Date de fin
                      </Label>
                      <Input
                        id="edit-endDate"
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">
                      Produits associés
                    </Label>
                    {products.length === 0 ? (
                      <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-muted/50 rounded-md">
                        <PackageIcon className="h-4 w-4" />
                        <span>Aucun produit disponible.</span>
                        <Link href="/dashboard/products" className="text-primary hover:underline font-medium">
                          Créer un produit
                        </Link>
                      </div>
                    ) : (
                      <CampaignProductConfig
                        products={products}
                        selectedProduct={editProduct}
                        onSelectProduct={handleEditSelectProduct}
                        onUpdateProduct={handleEditUpdateProduct}
                        onRemoveProduct={handleEditRemoveProduct}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Distributions */}
              {editStep === 2 && (
                <div className="grid gap-5 py-4">
                  {/* Validation quantity vs distributions - Sticky en haut */}
                  <Card className="border-primary/20 bg-primary/5 sticky top-0 z-10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            {editProduct 
                              ? `Produits: ${editProduct.quantity}` 
                              : 'Aucun produit sélectionné'}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Distributions créées: {editDistributions.length} ligne(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {editProduct && (() => {
                            const totalDistributed = editDistributions.reduce((sum, d) => sum + (d.maxUnits || 0), 0)
                            return totalDistributed === editProduct.quantity ? (
                              <Badge variant="default" className="bg-green-600">✓ Complet</Badge>
                            ) : totalDistributed > editProduct.quantity ? (
                              <Badge variant="destructive">
                                Dépassement: +{totalDistributed - editProduct.quantity}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                {editProduct.quantity - totalDistributed} manquant(s)
                              </Badge>
                            )
                          })()}
                        </div>
                      </div>
                      
                      {editProduct && editDistributions.length > 0 && (() => {
                        const totalDistributed = editDistributions.reduce((sum, d) => sum + (d.maxUnits || 0), 0)
                        const remaining = editProduct.quantity - totalDistributed
                        return (
                          <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                            <span className="text-muted-foreground">Produits distribués:</span>
                            <span className="font-medium">{totalDistributed}</span>
                            {remaining < 0 ? (
                              <span className="font-bold text-destructive">
                                ⚠️ Dépassement de {Math.abs(remaining)} produit{Math.abs(remaining) > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className={`font-bold ${remaining === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                                Restants: {remaining}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Dates de distribution
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditDistributions([...editDistributions, {
                            type: 'SPECIFIC_DATE',
                            specificDate: '',
                            maxUnits: 1,
                            isActive: true,
                          }])
                        }}
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Ajouter
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Définissez quand et combien de produits seront distribués
                    </p>
                  </div>

                  {editDistributions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Aucune distribution configurée
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border max-h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[100px]">Quantité</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editDistributions.map((dist, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input
                                  type="date"
                                  value={dist.specificDate || ''}
                                  onChange={(e) => {
                                    const newDist = [...editDistributions]
                                    newDist[index].specificDate = e.target.value
                                    setEditDistributions(newDist)
                                  }}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={dist.maxUnits}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '')
                                    const newDist = [...editDistributions]
                                    newDist[index].maxUnits = parseInt(value) || 0
                                    setEditDistributions(newDist)
                                  }}
                                  className="h-8 w-20 text-center"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setEditDistributions(editDistributions.filter((_, i) => i !== index))
                                  }}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Criteria */}
              {editStep === 3 && (
                <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Criteres d'eligibilite</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Choisissez un template ou configurez manuellement
                      </p>
                    </div>
                    <Link href="/dashboard/criteria-templates">
                      <Button type="button" variant="outline" size="sm">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Gerer les templates
                      </Button>
                    </Link>
                  </div>

                  <Tabs value={editCriteriaMode} onValueChange={(v) => setEditCriteriaMode(v as 'manual' | 'template')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="template">Template</TabsTrigger>
                      <TabsTrigger value="manual">Manuel</TabsTrigger>
                    </TabsList>

                    <TabsContent value="template" className="mt-4">
                      {criteriaTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md">
                          <FilterIcon className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Aucun template de criteres disponible
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Template</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {criteriaTemplates.map((template) => (
                                <TableRow
                                  key={template.id}
                                  className={editSelectedCriteriaTemplateId === template.id ? 'bg-primary/5' : ''}
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <FilterIcon className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">{template.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant={editSelectedCriteriaTemplateId === template.id ? "default" : "ghost"}
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        if (editSelectedCriteriaTemplateId === template.id) {
                                          setEditSelectedCriteriaTemplateId('')
                                        } else {
                                          setEditSelectedCriteriaTemplateId(template.id)
                                          setEditCriteria({
                                            minAge: template.minAge,
                                            maxAge: template.maxAge,
                                            minRating: template.minRating ? Number(template.minRating) : null,
                                            maxRating: template.maxRating ? Number(template.maxRating) : null,
                                            minCompletedSessions: template.minCompletedSessions,
                                            requiredGender: template.requiredGender,
                                            requiredCountries: template.requiredCountries,
                                            requiredLocations: template.requiredLocations,
                                            excludedLocations: template.excludedLocations,
                                            requiredCategories: template.requiredCategories,
                                            noActiveSessionWithSeller: template.noActiveSessionWithSeller,
                                            maxSessionsPerWeek: template.maxSessionsPerWeek,
                                            maxSessionsPerMonth: template.maxSessionsPerMonth,
                                            minCompletionRate: template.minCompletionRate ? Number(template.minCompletionRate) : null,
                                            maxCancellationRate: template.maxCancellationRate ? Number(template.maxCancellationRate) : null,
                                            minAccountAge: template.minAccountAge,
                                            lastActiveWithinDays: template.lastActiveWithinDays,
                                            requireVerified: template.requireVerified,
                                            requirePrime: template.requirePrime,
                                          })
                                        }
                                      }}
                                    >
                                      {editSelectedCriteriaTemplateId === template.id ? (
                                        <CheckIcon className="h-4 w-4" />
                                      ) : (
                                        <PlusIcon className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="manual" className="mt-4">
                      <CampaignCriteriaConfig
                        criteria={editCriteria}
                        onUpdateCriteria={(updates) => setEditCriteria({ ...editCriteria, ...updates })}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Step 4: Procedures */}
              {editStep === 4 && (
                <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
                  <div className="flex items-center justify-end mb-2">
                    <Link href="/dashboard/procedures">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Creer une procedure
                      </Button>
                    </Link>
                  </div>
                  <Tabs value={editProcedureMode} onValueChange={(v) => setEditProcedureMode(v as 'existing' | 'template' | 'create')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="existing">Existant</TabsTrigger>
                      <TabsTrigger value="template">Template</TabsTrigger>
                    </TabsList>

                    {/* Existing Procedures Tab */}
                    <TabsContent value="existing" className="mt-4">
                      <div className="grid gap-4">
                        <p className="text-xs text-muted-foreground">
                          Procedures actuellement associees a cette campagne
                        </p>

                        {editProcedures.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md">
                            <ListChecksIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Aucune procedure associee
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Utilisez un template ou creez une nouvelle procedure
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-lg border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Titre</TableHead>
                                  <TableHead>Requis</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {editProcedures.map((proc) => (
                                  <TableRow key={proc.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{proc.title}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={proc.isRequired ? "default" : "outline"}>
                                        {proc.isRequired ? 'Oui' : 'Non'}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Template Selection Tab */}
                    <TabsContent value="template" className="mt-4">
                      <div className="grid gap-4">
                        <p className="text-xs text-muted-foreground">
                          Remplacer les procedures existantes par un template
                        </p>

                        {procedureTemplates.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md">
                            <ListChecksIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Aucun template disponible
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-lg border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Template</TableHead>
                                  <TableHead className="w-[80px]">Etapes</TableHead>
                                  <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {procedureTemplates.map((template) => (
                                  <TableRow
                                    key={template.id}
                                    className={editSelectedTemplateId === template.id ? 'bg-primary/5' : ''}
                                  >
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-xs text-muted-foreground">{template.title}</div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {template.steps.length}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        type="button"
                                        variant={editSelectedTemplateId === template.id ? "default" : "ghost"}
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setEditSelectedTemplateId(
                                          editSelectedTemplateId === template.id ? '' : template.id
                                        )}
                                      >
                                        {editSelectedTemplateId === template.id ? (
                                          <CheckIcon className="h-4 w-4" />
                                        ) : (
                                          <PlusIcon className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {editStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setEditStep(2)}>
                  Suivant
                </Button>
              </>
            ) : editStep === 2 ? (
              <>
                <Button variant="outline" onClick={() => setEditStep(1)}>
                  Retour
                </Button>
                <Button onClick={() => setEditStep(3)}>
                  Suivant
                </Button>
              </>
            ) : editStep === 3 ? (
              <>
                <Button variant="outline" onClick={() => setEditStep(2)}>
                  Retour
                </Button>
                <Button onClick={() => setEditStep(4)}>
                  Suivant
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditStep(3)}>
                  Retour
                </Button>
                <Button onClick={handleEditSave} disabled={isSaving || isLoadingEditData}>
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <EyeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{viewingCampaign?.title}</DialogTitle>
                <DialogDescription>
                  Détails de la campagne
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-6 py-4 max-h-[500px] overflow-y-auto">
              {/* Campaign Info */}
              <div className="grid gap-3">
                <h4 className="text-sm font-semibold">Informations générales</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2">{getStatusBadge(viewingCampaign?.status || '')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Slots:</span>
                    <span className="ml-2">{viewingCampaign?.usedSlots}/{viewingCampaign?.totalSlots}</span>
                  </div>
                  {viewingCampaign?.startDate && (
                    <div>
                      <span className="text-muted-foreground">Début:</span>
                      <span className="ml-2">{new Date(viewingCampaign.startDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {viewingCampaign?.endDate && (
                    <div>
                      <span className="text-muted-foreground">Fin:</span>
                      <span className="ml-2">{new Date(viewingCampaign.endDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
                {viewingCampaign?.description && (
                  <p className="text-sm text-muted-foreground">{viewingCampaign.description}</p>
                )}
              </div>

              {/* Products */}
              <div className="grid gap-3">
                <h4 className="text-sm font-semibold">Produits ({viewingCampaign?.products?.length || 0})</h4>
                {viewingCampaign?.products && viewingCampaign.products.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead className="w-[60px]">Qté</TableHead>
                          <TableHead className="w-[80px]">Prix</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingCampaign.products.map((cp, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <PackageIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{cp.product?.name || 'Produit'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{cp.quantity}</TableCell>
                            <TableCell>
                              {cp.expectedPrice ? `${cp.expectedPrice}€` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun produit associé</p>
                )}
              </div>

              {/* Distributions */}
              <div className="grid gap-3">
                <h4 className="text-sm font-semibold">Distributions ({detailsDistributions.length})</h4>
                {detailsDistributions.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Jour/Date</TableHead>
                          <TableHead className="w-[60px]">Max</TableHead>
                          <TableHead className="w-[60px]">Actif</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailsDistributions.map((dist) => (
                          <TableRow key={dist.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {dist.type === 'RECURRING' ? 'Récurrent' : 'Date'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {dist.type === 'RECURRING'
                                ? DAYS_OF_WEEK.find(d => d.value === dist.dayOfWeek)?.label || '-'
                                : dist.specificDate ? new Date(dist.specificDate).toLocaleDateString('fr-FR') : '-'
                              }
                            </TableCell>
                            <TableCell>{dist.maxUnits}</TableCell>
                            <TableCell>
                              <Badge variant={dist.isActive ? "default" : "secondary"}>
                                {dist.isActive ? 'Oui' : 'Non'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune distribution configuree</p>
                )}
              </div>

              {/* Criteria */}
              {viewingCampaign?.criteria && (
                <div className="grid gap-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <FilterIcon className="h-4 w-4" />
                    Criteres d'eligibilite
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {viewingCampaign.criteria.minAge && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age min:</span>
                        <span className="font-medium">{viewingCampaign.criteria.minAge} ans</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.maxAge && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age max:</span>
                        <span className="font-medium">{viewingCampaign.criteria.maxAge} ans</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.minRating && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Note min:</span>
                        <span className="font-medium">{viewingCampaign.criteria.minRating}/5</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.maxRating && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Note max:</span>
                        <span className="font-medium">{viewingCampaign.criteria.maxRating}/5</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.minCompletedSessions && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tests min:</span>
                        <span className="font-medium">{viewingCampaign.criteria.minCompletedSessions}</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.requiredGender && viewingCampaign.criteria.requiredGender !== 'ALL' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Genre:</span>
                        <span className="font-medium">{viewingCampaign.criteria.requiredGender === 'M' ? 'Homme' : 'Femme'}</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.minAccountAge && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Anciennete:</span>
                        <span className="font-medium">{viewingCampaign.criteria.minAccountAge} jours</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.minCompletionRate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taux completion:</span>
                        <span className="font-medium">{viewingCampaign.criteria.minCompletionRate}%</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.maxCancellationRate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taux annulation max:</span>
                        <span className="font-medium">{viewingCampaign.criteria.maxCancellationRate}%</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.lastActiveWithinDays && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actif dans:</span>
                        <span className="font-medium">{viewingCampaign.criteria.lastActiveWithinDays} jours</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.maxSessionsPerWeek && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max/semaine:</span>
                        <span className="font-medium">{viewingCampaign.criteria.maxSessionsPerWeek}</span>
                      </div>
                    )}
                    {viewingCampaign.criteria.maxSessionsPerMonth && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max/mois:</span>
                        <span className="font-medium">{viewingCampaign.criteria.maxSessionsPerMonth}</span>
                      </div>
                    )}
                  </div>
                  {(viewingCampaign.criteria.requireVerified || viewingCampaign.criteria.requirePrime || viewingCampaign.criteria.noActiveSessionWithSeller) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viewingCampaign.criteria.requireVerified && (
                        <Badge variant="secondary">Compte verifie</Badge>
                      )}
                      {viewingCampaign.criteria.requirePrime && (
                        <Badge variant="secondary">Premium</Badge>
                      )}
                      {viewingCampaign.criteria.noActiveSessionWithSeller && (
                        <Badge variant="secondary">Pas de session active</Badge>
                      )}
                    </div>
                  )}
                  {viewingCampaign.criteria.requiredCountries && viewingCampaign.criteria.requiredCountries.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Pays acceptes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {viewingCampaign.criteria.requiredCountries.map((country, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{country}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingCampaign.criteria.requiredLocations && viewingCampaign.criteria.requiredLocations.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Localisations acceptees:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {viewingCampaign.criteria.requiredLocations.map((loc, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{loc}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingCampaign.criteria.excludedLocations && viewingCampaign.criteria.excludedLocations.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Localisations exclues:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {viewingCampaign.criteria.excludedLocations.map((loc, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">{loc}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Procedures */}
              <div className="grid gap-3">
                <h4 className="text-sm font-semibold">Procedures ({detailsProcedures.length})</h4>
                {detailsProcedures.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead className="w-[60px]">Ordre</TableHead>
                          <TableHead className="w-[60px]">Requis</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailsProcedures.map((proc) => (
                          <TableRow key={proc.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{proc.title}</div>
                                  {proc.description && (
                                    <div className="text-xs text-muted-foreground line-clamp-1">{proc.description}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{proc.order}</TableCell>
                            <TableCell>
                              <Badge variant={proc.isRequired ? "default" : "outline"}>
                                {proc.isRequired ? 'Oui' : 'Non'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune procédure associée</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setIsDetailsDialogOpen(false)
              if (viewingCampaign) {
                handleEditClick(viewingCampaign)
              }
            }}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-xl">Supprimer la campagne</DialogTitle>
                <DialogDescription>
                  Cette action est irréversible
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer la campagne{' '}
              <span className="font-semibold text-foreground">"{deletingCampaign?.title}"</span> ?
              Toutes les données associées seront définitivement supprimées.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        campaign={payingCampaign}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </ProtectedRoute>
  )
}
