"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api, Campaign, Product, CampaignProduct, CreateDistributionData, DistributionType, ProcedureTemplate, StepType, CreateStepTemplateData, Distribution, Procedure } from "@/lib/api"
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
import { MoreHorizontalIcon, PlusIcon, PencilIcon, Trash2Icon, AlertTriangleIcon, PackageIcon, XIcon, CalendarIcon, CheckIcon, ListChecksIcon, ChevronUpIcon, ChevronDownIcon, GripVerticalIcon, EyeIcon, ClipboardListIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { toast } from "sonner"

export default function CampaignsPage() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [procedureTemplates, setProcedureTemplates] = useState<ProcedureTemplate[]>([])
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
  const [editProducts, setEditProducts] = useState<{
    productId: string
    quantity: number
    expectedPrice: number
  }[]>([])
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
  const [selectedProducts, setSelectedProducts] = useState<{
    productId: string
    quantity: number
    expectedPrice: number
  }[]>([])
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

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [campaignsData, productsData, templatesData] = await Promise.all([
        api.getMyCampaigns(),
        api.getMyProducts(),
        api.getProcedureTemplates()
      ])
      setCampaigns(campaignsData)
      setProducts(productsData)
      setProcedureTemplates(templatesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setCampaigns([])
      setProducts([])
      setProcedureTemplates([])
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

    // Set products from campaign
    if (campaign.products && campaign.products.length > 0) {
      setEditProducts(campaign.products.map(cp => ({
        productId: cp.productId,
        quantity: cp.quantity,
        expectedPrice: cp.expectedPrice || cp.product?.price || 0
      })))
    } else {
      setEditProducts([])
    }

    setEditStep(1)
    setIsEditSheetOpen(true)

    // Load distributions and procedures
    setIsLoadingEditData(true)
    try {
      const [distributionsData, proceduresData] = await Promise.all([
        api.getDistributions(campaign.id),
        api.getProcedures(campaign.id)
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

  const handleEditSave = async () => {
    if (!editingCampaign) return

    try {
      setIsSaving(true)

      // Update campaign basic info with products
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
        totalSlots: editForm.totalSlots,
      }

      // Only include dates if they are set
      if (editForm.startDate) {
        updateData.startDate = new Date(editForm.startDate).toISOString()
      }
      if (editForm.endDate) {
        updateData.endDate = new Date(editForm.endDate).toISOString()
      }

      // Include products
      if (editProducts.length > 0) {
        updateData.products = editProducts
      }

      await api.updateCampaign(editingCampaign.id, updateData)

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
      toast.error('Erreur lors de la mise à jour de la campagne')
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
        totalSlots: createForm.totalSlots,
      }

      if (createForm.startDate) {
        createData.startDate = new Date(createForm.startDate).toISOString()
      }
      if (createForm.endDate) {
        createData.endDate = new Date(createForm.endDate).toISOString()
      }
      if (selectedProducts.length > 0) {
        createData.products = selectedProducts
      }

      const campaign = await api.createCampaign(createData)

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
      setSelectedProducts([])
      setDistributions([])
      setSelectedTemplateId('')
      setProcedureMode('template')
      setInlineProcedure({ title: '', description: '' })
      setInlineSteps([])
      fetchCampaigns()
    } catch (error) {
      console.error('Failed to create campaign:', error)
      toast.error('Erreur lors de la création de la campagne')
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-500">Actif</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Brouillon</Badge>
      case 'PAUSED':
        return <Badge variant="outline">En pause</Badge>
      case 'COMPLETED':
        return <Badge variant="default">Terminé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Campagnes</h2>
                    <p className="text-muted-foreground">
                      Gérez vos campagnes de test produit
                    </p>
                  </div>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Nouvelle campagne
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Toutes les campagnes</CardTitle>
                    <CardDescription>
                      {campaigns.length} campagne{campaigns.length !== 1 ? 's' : ''} au total
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    ) : campaigns.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-muted-foreground mb-4">
                          Vous n'avez pas encore de campagne
                        </p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Créer votre première campagne
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Campagne</TableHead>
                              <TableHead>Produits</TableHead>
                              <TableHead>Période</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {campaigns.map((campaign) => (
                              <TableRow key={campaign.id} className="h-[72px]">
                                <TableCell className="py-3">
                                  <div className="space-y-1">
                                    <div className="font-medium">{campaign.title}</div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span>{campaign.usedSlots}/{campaign.totalSlots} slots</span>
                                      <span>Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-3">
                                  {campaign.products && campaign.products.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                      {campaign.products.slice(0, 2).map((cp, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                          <PackageIcon className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-sm truncate max-w-[150px]">
                                            {cp.product?.name || 'Produit'}
                                          </span>
                                          <Badge variant="outline" className="text-xs px-1">
                                            x{cp.quantity}
                                          </Badge>
                                        </div>
                                      ))}
                                      {campaign.products.length > 2 && (
                                        <span className="text-xs text-muted-foreground">
                                          +{campaign.products.length - 2} autre(s)
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">Aucun produit</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className="flex flex-col gap-1 text-sm">
                                    {campaign.startDate ? (
                                      <span>Du {new Date(campaign.startDate).toLocaleDateString('fr-FR')}</span>
                                    ) : (
                                      <span className="text-muted-foreground">Non défini</span>
                                    )}
                                    {campaign.endDate && (
                                      <span className="text-xs text-muted-foreground">
                                        Au {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="py-3">
                                  {getStatusBadge(campaign.status)}
                                </TableCell>
                                <TableCell className="py-3">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontalIcon className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleViewDetails(campaign)}>
                                        Voir détails
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEditClick(campaign)}>
                                        Modifier
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>Voir sessions</DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => handleDeleteClick(campaign)}
                                      >
                                        Supprimer
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                  {createStep === 1 ? 'Informations générales et produits' : createStep === 2 ? 'Configuration des distributions' : 'Sélection de la procédure'}
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
            <div className={`h-px w-6 ${createStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <button
              type="button"
              onClick={() => {
                if (!createForm.title.trim()) {
                  toast.error('Le titre est requis pour passer à l\'étape suivante')
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
            <div className={`h-px w-6 ${createStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <button
              type="button"
              onClick={() => {
                if (!createForm.title.trim()) {
                  toast.error('Le titre est requis pour passer à l\'étape suivante')
                  return
                }
                setCreateStep(3)
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                createStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className={`text-sm hidden sm:inline ${createStep >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Procédure
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
                <Label htmlFor="create-totalSlots" className="text-sm font-medium">
                  Nombre de slots
                </Label>
                <Input
                  id="create-totalSlots"
                  type="number"
                  min="1"
                  placeholder="10"
                  value={createForm.totalSlots}
                  onChange={(e) => setCreateForm({ ...createForm, totalSlots: parseInt(e.target.value) || 1 })}
                  className="h-10"
                />
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
                  <div className="space-y-3">
                    {selectedProducts.length > 0 && (
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produit</TableHead>
                              <TableHead className="w-[80px]">Qté</TableHead>
                              <TableHead className="w-[100px]">Prix</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedProducts.map((sp, index) => {
                              const product = products.find(p => p.id === sp.productId)
                              return (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <PackageIcon className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium truncate">{product?.name || 'Produit inconnu'}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={sp.quantity}
                                      onChange={(e) => {
                                        const newProducts = [...selectedProducts]
                                        newProducts[index].quantity = parseInt(e.target.value) || 1
                                        setSelectedProducts(newProducts)
                                      }}
                                      className="h-8 w-16 text-sm"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={sp.expectedPrice}
                                      onChange={(e) => {
                                        const newProducts = [...selectedProducts]
                                        newProducts[index].expectedPrice = parseFloat(e.target.value) || 0
                                        setSelectedProducts(newProducts)
                                      }}
                                      className="h-8 w-20 text-sm"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() => {
                                        setSelectedProducts(selectedProducts.filter((_, i) => i !== index))
                                      }}
                                    >
                                      <XIcon className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {products.filter(p => !selectedProducts.some(sp => sp.productId === p.id)).length > 0 && (
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value) {
                            const product = products.find(p => p.id === value)
                            const defaultPrice = product?.price || 0
                            setSelectedProducts([...selectedProducts, {
                              productId: value,
                              quantity: 1,
                              expectedPrice: defaultPrice
                            }])
                          }
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Ajouter un produit..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products
                            .filter(p => !selectedProducts.some(sp => sp.productId === p.id))
                            .map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex items-center gap-2">
                                  <PackageIcon className="h-4 w-4 text-muted-foreground" />
                                  <span>{product.name}</span>
                                  {product.price && (
                                    <span className="text-muted-foreground">
                                      - {product.price}€
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}

                    {selectedProducts.length === products.length && selectedProducts.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Tous les produits ont été ajoutés
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Distributions */}
          {createStep === 2 && (
            <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Créneaux de distribution
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDistributions([...distributions, {
                        type: 'RECURRING',
                        dayOfWeek: 1,
                        maxUnits: 5,
                        isActive: true,
                      }])
                    }}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Définissez quand et combien de produits peuvent être distribués
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
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Jour/Date</TableHead>
                        <TableHead className="w-[80px]">Max</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributions.map((dist, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={dist.type}
                              onValueChange={(value: DistributionType) => {
                                const newDist = [...distributions]
                                newDist[index].type = value
                                if (value === 'RECURRING') {
                                  newDist[index].dayOfWeek = 1
                                  delete newDist[index].specificDate
                                } else {
                                  delete newDist[index].dayOfWeek
                                  newDist[index].specificDate = ''
                                }
                                setDistributions(newDist)
                              }}
                            >
                              <SelectTrigger className="h-8 w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="RECURRING">Récurrent</SelectItem>
                                <SelectItem value="SPECIFIC_DATE">Date</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {dist.type === 'RECURRING' ? (
                              <Select
                                value={String(dist.dayOfWeek ?? 1)}
                                onValueChange={(value) => {
                                  const newDist = [...distributions]
                                  newDist[index].dayOfWeek = parseInt(value)
                                  setDistributions(newDist)
                                }}
                              >
                                <SelectTrigger className="h-8 w-[100px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {DAYS_OF_WEEK.map((day) => (
                                    <SelectItem key={day.value} value={String(day.value)}>
                                      {day.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type="date"
                                value={dist.specificDate || ''}
                                onChange={(e) => {
                                  const newDist = [...distributions]
                                  newDist[index].specificDate = e.target.value
                                  setDistributions(newDist)
                                }}
                                className="h-8 w-[130px]"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={dist.maxUnits}
                              onChange={(e) => {
                                const newDist = [...distributions]
                                newDist[index].maxUnits = parseInt(e.target.value) || 1
                                setDistributions(newDist)
                              }}
                              className="h-8 w-16"
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

          {/* Step 3: Procedure Selection or Creation */}
          {createStep === 3 && (
            <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
              <Tabs value={procedureMode} onValueChange={(v) => setProcedureMode(v as 'template' | 'create')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="template">Utiliser un template</TabsTrigger>
                  <TabsTrigger value="create">Créer une procédure</TabsTrigger>
                </TabsList>

                {/* Template Selection Tab */}
                <TabsContent value="template" className="mt-4">
                  <div className="grid gap-4">
                    <p className="text-xs text-muted-foreground">
                      Choisissez un template existant ou ignorez cette étape pour en créer un plus tard
                    </p>

                    {procedureTemplates.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md">
                        <ListChecksIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Aucun template de procédure disponible
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vous pouvez en créer dans la section Procédures
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Template</TableHead>
                              <TableHead className="w-[80px]">Étapes</TableHead>
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
                </TabsContent>

                {/* Create Procedure Tab */}
                <TabsContent value="create" className="mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="proc-title" className="text-sm font-medium">
                        Titre de la procédure
                      </Label>
                      <Input
                        id="proc-title"
                        placeholder="Ex: Instructions de test produit"
                        value={inlineProcedure.title}
                        onChange={(e) => setInlineProcedure({ ...inlineProcedure, title: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="proc-description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="proc-description"
                        placeholder="Décrivez la procédure..."
                        value={inlineProcedure.description}
                        onChange={(e) => setInlineProcedure({ ...inlineProcedure, description: e.target.value })}
                        className="min-h-[60px] resize-none"
                      />
                    </div>

                    {/* Steps */}
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Étapes de la procédure
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInlineSteps([...inlineSteps, {
                              title: '',
                              description: '',
                              type: 'TEXT',
                              isRequired: true,
                              checklistItems: [],
                            }])
                          }}
                        >
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Ajouter une étape
                        </Button>
                      </div>
                    </div>

                    {inlineSteps.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/50 rounded-md">
                        <ListChecksIcon className="h-6 w-6 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Aucune étape ajoutée
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ajoutez des étapes pour guider le testeur
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inlineSteps.map((step, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-md space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Étape {index + 1}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      const newSteps = [...inlineSteps]
                                      ;[newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]]
                                      setInlineSteps(newSteps)
                                    }}
                                  >
                                    <ChevronUpIcon className="h-4 w-4" />
                                  </Button>
                                )}
                                {index < inlineSteps.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      const newSteps = [...inlineSteps]
                                      ;[newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]]
                                      setInlineSteps(newSteps)
                                    }}
                                  >
                                    <ChevronDownIcon className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setInlineSteps(inlineSteps.filter((_, i) => i !== index))
                                  }}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid gap-2">
                              <Input
                                placeholder="Titre de l'étape"
                                value={step.title}
                                onChange={(e) => {
                                  const newSteps = [...inlineSteps]
                                  newSteps[index].title = e.target.value
                                  setInlineSteps(newSteps)
                                }}
                                className="h-9"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="grid gap-1">
                                <Label className="text-xs text-muted-foreground">Type</Label>
                                <Select
                                  value={step.type}
                                  onValueChange={(value: StepType) => {
                                    const newSteps = [...inlineSteps]
                                    newSteps[index].type = value
                                    setInlineSteps(newSteps)
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STEP_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-1">
                                <Label className="text-xs text-muted-foreground">Requis</Label>
                                <div className="flex items-center h-8">
                                  <Switch
                                    checked={step.isRequired}
                                    onCheckedChange={(checked) => {
                                      const newSteps = [...inlineSteps]
                                      newSteps[index].isRequired = checked
                                      setInlineSteps(newSteps)
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {step.type === 'CHECKLIST' && (
                              <div className="grid gap-2">
                                <Label className="text-xs text-muted-foreground">Items de la checklist</Label>
                                <div className="space-y-2">
                                  {step.checklistItems.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center gap-2">
                                      <Input
                                        value={item}
                                        onChange={(e) => {
                                          const newSteps = [...inlineSteps]
                                          newSteps[index].checklistItems[itemIndex] = e.target.value
                                          setInlineSteps(newSteps)
                                        }}
                                        className="h-8 flex-1"
                                        placeholder={`Item ${itemIndex + 1}`}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          const newSteps = [...inlineSteps]
                                          newSteps[index].checklistItems = step.checklistItems.filter((_, i) => i !== itemIndex)
                                          setInlineSteps(newSteps)
                                        }}
                                      >
                                        <XIcon className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                      const newSteps = [...inlineSteps]
                                      newSteps[index].checklistItems = [...step.checklistItems, '']
                                      setInlineSteps(newSteps)
                                    }}
                                  >
                                    <PlusIcon className="mr-2 h-3 w-3" />
                                    Ajouter un item
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
            ) : (
              <>
                <Button variant="outline" onClick={() => setCreateStep(2)}>
                  Retour
                </Button>
                <Button onClick={handleCreateSave} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Création...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Créer la campagne
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
                  {editStep === 1 ? 'Informations générales et produits' : editStep === 2 ? 'Configuration des distributions' : 'Gestion des procédures'}
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
            <div className={`h-px w-6 ${editStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
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
            <div className={`h-px w-6 ${editStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <button
              type="button"
              onClick={() => setEditStep(3)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                editStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className={`text-sm hidden sm:inline ${editStep >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Procédure
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
                    <Label htmlFor="edit-totalSlots" className="text-sm font-medium">
                      Nombre de slots
                    </Label>
                    <Input
                      id="edit-totalSlots"
                      type="number"
                      min="1"
                      placeholder="10"
                      value={editForm.totalSlots}
                      onChange={(e) => setEditForm({ ...editForm, totalSlots: parseInt(e.target.value) || 1 })}
                      className="h-10"
                    />
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
                      <div className="space-y-3">
                        {editProducts.length > 0 && (
                          <div className="overflow-hidden rounded-lg border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Produit</TableHead>
                                  <TableHead className="w-[80px]">Qté</TableHead>
                                  <TableHead className="w-[100px]">Prix</TableHead>
                                  <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {editProducts.map((sp, index) => {
                                  const product = products.find(p => p.id === sp.productId)
                                  return (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <PackageIcon className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm font-medium truncate">{product?.name || 'Produit inconnu'}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={sp.quantity}
                                          onChange={(e) => {
                                            const newProducts = [...editProducts]
                                            newProducts[index].quantity = parseInt(e.target.value) || 1
                                            setEditProducts(newProducts)
                                          }}
                                          className="h-8 w-16 text-sm"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={sp.expectedPrice}
                                          onChange={(e) => {
                                            const newProducts = [...editProducts]
                                            newProducts[index].expectedPrice = parseFloat(e.target.value) || 0
                                            setEditProducts(newProducts)
                                          }}
                                          className="h-8 w-20 text-sm"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                          onClick={() => {
                                            setEditProducts(editProducts.filter((_, i) => i !== index))
                                          }}
                                        >
                                          <XIcon className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        {products.filter(p => !editProducts.some(sp => sp.productId === p.id)).length > 0 && (
                          <Select
                            value=""
                            onValueChange={(value) => {
                              if (value) {
                                const product = products.find(p => p.id === value)
                                const defaultPrice = product?.price || 0
                                setEditProducts([...editProducts, {
                                  productId: value,
                                  quantity: 1,
                                  expectedPrice: defaultPrice
                                }])
                              }
                            }}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Ajouter un produit..." />
                            </SelectTrigger>
                            <SelectContent>
                              {products
                                .filter(p => !editProducts.some(sp => sp.productId === p.id))
                                .map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    <div className="flex items-center gap-2">
                                      <PackageIcon className="h-4 w-4 text-muted-foreground" />
                                      <span>{product.name}</span>
                                      {product.price && (
                                        <span className="text-muted-foreground">
                                          - {product.price}€
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Distributions */}
              {editStep === 2 && (
                <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Créneaux de distribution
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditDistributions([...editDistributions, {
                            type: 'RECURRING',
                            dayOfWeek: 1,
                            maxUnits: 5,
                            isActive: true,
                          }])
                        }}
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Ajouter
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Définissez quand et combien de produits peuvent être distribués
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
                    <div className="overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Jour/Date</TableHead>
                            <TableHead className="w-[80px]">Max</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editDistributions.map((dist, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Select
                                  value={dist.type}
                                  onValueChange={(value: DistributionType) => {
                                    const newDist = [...editDistributions]
                                    newDist[index].type = value
                                    if (value === 'RECURRING') {
                                      newDist[index].dayOfWeek = 1
                                      delete newDist[index].specificDate
                                    } else {
                                      delete newDist[index].dayOfWeek
                                      newDist[index].specificDate = ''
                                    }
                                    setEditDistributions(newDist)
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="RECURRING">Récurrent</SelectItem>
                                    <SelectItem value="SPECIFIC_DATE">Date</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                {dist.type === 'RECURRING' ? (
                                  <Select
                                    value={String(dist.dayOfWeek ?? 1)}
                                    onValueChange={(value) => {
                                      const newDist = [...editDistributions]
                                      newDist[index].dayOfWeek = parseInt(value)
                                      setEditDistributions(newDist)
                                    }}
                                  >
                                    <SelectTrigger className="h-8 w-[100px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {DAYS_OF_WEEK.map((day) => (
                                        <SelectItem key={day.value} value={String(day.value)}>
                                          {day.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    type="date"
                                    value={dist.specificDate || ''}
                                    onChange={(e) => {
                                      const newDist = [...editDistributions]
                                      newDist[index].specificDate = e.target.value
                                      setEditDistributions(newDist)
                                    }}
                                    className="h-8 w-[130px]"
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  value={dist.maxUnits}
                                  onChange={(e) => {
                                    const newDist = [...editDistributions]
                                    newDist[index].maxUnits = parseInt(e.target.value) || 1
                                    setEditDistributions(newDist)
                                  }}
                                  className="h-8 w-16"
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

              {/* Step 3: Procedures */}
              {editStep === 3 && (
                <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
                  <Tabs value={editProcedureMode} onValueChange={(v) => setEditProcedureMode(v as 'existing' | 'template' | 'create')}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="existing">Existant</TabsTrigger>
                      <TabsTrigger value="template">Template</TabsTrigger>
                      <TabsTrigger value="create">Créer</TabsTrigger>
                    </TabsList>

                    {/* Existing Procedures Tab */}
                    <TabsContent value="existing" className="mt-4">
                      <div className="grid gap-4">
                        <p className="text-xs text-muted-foreground">
                          Procédures actuellement associées à cette campagne
                        </p>

                        {editProcedures.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md">
                            <ListChecksIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Aucune procédure associée
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Utilisez un template ou créez une nouvelle procédure
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
                          Remplacer les procédures existantes par un template
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
                                  <TableHead className="w-[80px]">Étapes</TableHead>
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

                    {/* Create Procedure Tab */}
                    <TabsContent value="create" className="mt-4">
                      <div className="grid gap-4">
                        <p className="text-xs text-muted-foreground">
                          Remplacer les procédures existantes par une nouvelle
                        </p>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-proc-title" className="text-sm font-medium">
                            Titre de la procédure
                          </Label>
                          <Input
                            id="edit-proc-title"
                            placeholder="Ex: Instructions de test produit"
                            value={editInlineProcedure.title}
                            onChange={(e) => setEditInlineProcedure({ ...editInlineProcedure, title: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-proc-description" className="text-sm font-medium">
                            Description
                          </Label>
                          <Textarea
                            id="edit-proc-description"
                            placeholder="Décrivez la procédure..."
                            value={editInlineProcedure.description}
                            onChange={(e) => setEditInlineProcedure({ ...editInlineProcedure, description: e.target.value })}
                            className="min-h-[60px] resize-none"
                          />
                        </div>
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
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditStep(2)}>
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
                  <p className="text-sm text-muted-foreground">Aucune distribution configurée</p>
                )}
              </div>

              {/* Procedures */}
              <div className="grid gap-3">
                <h4 className="text-sm font-semibold">Procédures ({detailsProcedures.length})</h4>
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
    </ProtectedRoute>
  )
}
