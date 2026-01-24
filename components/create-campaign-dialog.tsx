"use client"

import { useState } from "react"
import { api, Product, ProcedureTemplate, CriteriaTemplate, CreateDistributionData, DistributionType, StepType, CampaignCriteria } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
import { PlusIcon, PackageIcon, XIcon, CalendarIcon, CheckIcon, ListChecksIcon, FilterIcon, MegaphoneIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { toast } from "sonner"
import { CampaignCriteriaConfig } from "@/components/campaign-criteria-config"

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  procedureTemplates: ProcedureTemplate[]
  criteriaTemplates: CriteriaTemplate[]
  onSuccess: () => void
}

const STEP_TYPES: { value: StepType; label: string }[] = [
  { value: 'TEXT', label: 'Texte' },
  { value: 'PHOTO', label: 'Photo' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'CHECKLIST', label: 'Checklist' },
  { value: 'RATING', label: 'Note' },
  { value: 'PRICE_VALIDATION', label: 'Validation prix' },
]

export function CreateCampaignDialog({
  open,
  onOpenChange,
  products,
  procedureTemplates,
  criteriaTemplates,
  onSuccess,
}: CreateCampaignDialogProps) {
  // Step state
  const [createStep, setCreateStep] = useState(1)

  // Form state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalSlots: 10,
    marketplaceMode: 'PROCEDURES' as 'PROCEDURES' | 'AMAZON_DIRECT_LINK',
    marketplace: '',
    amazonLink: '',
    keyword: '',
  })

  // Product state
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: string
    productName: string
    quantity: number
    expectedPrice: number
    shippingCost: number
    reimbursedPrice: boolean
    reimbursedShipping: boolean
    bonus: number
  } | null>(null)

  // Distribution state
  const [distributions, setDistributions] = useState<{
    type: DistributionType
    dayOfWeek?: number
    specificDate?: string
    maxUnits: number
    isActive: boolean
  }[]>([])

  // Procedure state
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

  // Criteria state
  const [createCriteria, setCreateCriteria] = useState<Partial<CampaignCriteria>>({})
  const [createCriteriaMode, setCreateCriteriaMode] = useState<'manual' | 'template'>('manual')
  const [createSelectedCriteriaTemplateId, setCreateSelectedCriteriaTemplateId] = useState<string>('')

  // Loading state
  const [isCreating, setIsCreating] = useState(false)

  // Product handlers
  const handleSelectProduct = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setSelectedProduct({
        productId,
        productName: product.name,
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
    productName: string
    expectedPrice: number
    shippingCost: number
    reimbursedPrice: boolean
    reimbursedShipping: boolean
    bonus: number
    quantity: number
  }>) => {
    if (selectedProduct) {
      setSelectedProduct({ ...selectedProduct, ...updates })
    }
  }

  const handleRemoveProduct = () => {
    setSelectedProduct(null)
  }

  // Reset form
  const resetForm = () => {
    setCreateStep(1)
    setCreateForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      totalSlots: 10,
      marketplaceMode: 'PROCEDURES' as 'PROCEDURES' | 'AMAZON_DIRECT_LINK',
      marketplace: '',
      amazonLink: '',
      keyword: '',
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
  }

  // Save handler
  const handleCreateSave = async () => {
    if (!createForm.title.trim()) {
      toast.error('Le titre est requis')
      setCreateStep(1)
      return
    }

    if (!createForm.description.trim()) {
      toast.error('La description est requise')
      setCreateStep(1)
      return
    }

    if (!createForm.marketplace) {
      toast.error('Le marketplace est requis')
      setCreateStep(1)
      return
    }

    if (createForm.marketplaceMode === 'AMAZON_DIRECT_LINK' && !createForm.amazonLink) {
      toast.error('Le lien Amazon est requis pour ce mode')
      return
    }

    if (selectedProduct && !selectedProduct.productName?.trim()) {
      toast.error('Le nom du produit est requis')
      return
    }

    try {
      setIsCreating(true)

      const createData: {
        title: string
        description?: string
        totalSlots: number
        marketplaceMode: 'PROCEDURES' | 'AMAZON_DIRECT_LINK'
        marketplace: string
        amazonLink?: string
        keywords?: string[]
        startDate?: string
        endDate?: string
        products?: {
          productId: string
          productName: string
          quantity: number
          expectedPrice: number
        }[]
      } = {
        title: createForm.title,
        description: createForm.description || undefined,
        totalSlots: selectedProduct?.quantity || 0,
        marketplaceMode: createForm.marketplaceMode,
        marketplace: createForm.marketplace,
      }

      if (createForm.marketplaceMode === 'AMAZON_DIRECT_LINK' && createForm.amazonLink) {
        createData.amazonLink = createForm.amazonLink
      }

      if (createForm.keyword.trim()) {
        createData.keywords = [createForm.keyword.trim()]
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

      // Step 1: Create campaign
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

      // Handle procedure
      if (procedureMode === 'template' && selectedTemplateId) {
        await api.copyTemplateToCampaign(selectedTemplateId, campaign.id, 1)
      } else if (procedureMode === 'create' && inlineProcedure.title.trim()) {
        const procedureData = {
          title: inlineProcedure.title,
          description: inlineProcedure.description,
          order: 1,
          isRequired: true,
        }
        await api.createProcedure(campaign.id, procedureData)
      }

      toast.success('Campagne creee avec succes')
      onOpenChange(false)
      resetForm()
      onSuccess()
    } catch (error) {
      console.error('Failed to create campaign:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la creation de la campagne'
      toast.error(errorMessage, {
        duration: 5000,
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MegaphoneIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Nouvelle campagne</DialogTitle>
              <DialogDescription>
                {createStep === 1 ? 'Informations generales et produits' : createStep === 2 ? 'Configuration des distributions' : createStep === 3 ? 'Gestion des procedures' : 'Criteres d\'eligibilite'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step Indicators */}
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
            onClick={() => setCreateStep(2)}
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
            onClick={() => createForm.marketplaceMode === 'PROCEDURES' && setCreateStep(3)}
            className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${createForm.marketplaceMode !== 'PROCEDURES' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={createForm.marketplaceMode !== 'PROCEDURES'}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              createStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {createStep > 3 ? <CheckIcon className="h-4 w-4" /> : '3'}
            </div>
            <span className={`text-sm hidden sm:inline ${createStep >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Procedure
            </span>
          </button>
          <div className={`h-px w-4 ${createStep >= 4 ? 'bg-primary' : 'bg-muted'}`} />
          <button
            type="button"
            onClick={() => setCreateStep(4)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              createStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              4
            </div>
            <span className={`text-sm hidden sm:inline ${createStep >= 4 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Criteres
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
                placeholder="Ex: Test produit ete 2024"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="create-description"
                placeholder="Decrivez votre campagne..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-marketplace" className="text-sm font-medium">
                Marketplace <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createForm.marketplace}
                onValueChange={(value) => setCreateForm({ ...createForm, marketplace: value })}
              >
                <SelectTrigger id="create-marketplace" className="h-10">
                  <SelectValue placeholder="Selectionnez un pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FR">France (FR)</SelectItem>
                  <SelectItem value="DE">Allemagne (DE)</SelectItem>
                  <SelectItem value="UK">Royaume-Uni (UK)</SelectItem>
                  <SelectItem value="US">Etats-Unis (US)</SelectItem>
                  <SelectItem value="ES">Espagne (ES)</SelectItem>
                  <SelectItem value="IT">Italie (IT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-marketplaceMode" className="text-sm font-medium">
                Mode de campagne <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createForm.marketplaceMode}
                onValueChange={(value: 'PROCEDURES' | 'AMAZON_DIRECT_LINK') => setCreateForm({ ...createForm, marketplaceMode: value })}
              >
                <SelectTrigger id="create-marketplaceMode" className="h-10">
                  <SelectValue placeholder="Selectionnez un mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROCEDURES">Procedures (avec etapes)</SelectItem>
                  <SelectItem value="AMAZON_DIRECT_LINK">Lien Amazon direct</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {createForm.marketplaceMode === 'PROCEDURES'
                  ? 'Les testeurs suivront des procedures definies avec plusieurs etapes de validation.'
                  : 'Les testeurs recevront directement un lien Amazon pour commander le produit.'}
              </p>
            </div>
            {createForm.marketplaceMode === 'AMAZON_DIRECT_LINK' && (
              <div className="grid gap-2">
                <Label htmlFor="create-amazonLink" className="text-sm font-medium">
                  Lien Amazon <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-amazonLink"
                  type="url"
                  placeholder="https://www.amazon.fr/dp/..."
                  value={createForm.amazonLink}
                  onChange={(e) => setCreateForm({ ...createForm, amazonLink: e.target.value })}
                  className="h-10"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="create-keyword" className="text-sm font-medium">
                Mot cle
              </Label>
              <Input
                id="create-keyword"
                placeholder="Ex: casque bluetooth"
                value={createForm.keyword}
                onChange={(e) => setCreateForm({ ...createForm, keyword: e.target.value })}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Le mot cle que le testeur utilisera pour trouver votre produit
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-startDate" className="text-sm font-medium">
                  Date de debut
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
                Produits associes
              </Label>
              {products.length === 0 ? (
                <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-muted/50 rounded-md">
                  <PackageIcon className="h-4 w-4" />
                  <span>Aucun produit disponible.</span>
                  <Link href="/dashboard/pro/products" className="text-primary hover:underline font-medium">
                    Creer un produit
                  </Link>
                </div>
              ) : !selectedProduct ? (
                <Select onValueChange={handleSelectProduct}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selectionner un produit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <PackageIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{p.name}</span>
                          <span className="text-muted-foreground">- {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(p.price)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PackageIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{products.find(p => p.id === selectedProduct.productId)?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(products.find(p => p.id === selectedProduct.productId)?.price || 0)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveProduct}>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium">Nombre d&apos;unites</Label>
                      <Input
                        type="number"
                        min={1}
                        value={selectedProduct.quantity}
                        onChange={(e) => handleUpdateProduct({ quantity: parseInt(e.target.value) || 1 })}
                        className="h-10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium">Bonus par testeur</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          value={selectedProduct.bonus}
                          onChange={(e) => handleUpdateProduct({ bonus: parseFloat(e.target.value) || 0 })}
                          className="h-10 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">EUR</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="product-name" className="text-sm font-medium">
                      Nom du produit <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="product-name"
                      placeholder="Ex: Casque Bluetooth XYZ"
                      value={selectedProduct.productName}
                      onChange={(e) => handleUpdateProduct({ productName: e.target.value })}
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Le nom exact du produit tel qu&apos;il apparait sur Amazon (pour validation si le prix exact n&apos;est pas trouve)
                    </p>
                  </div>
                  {/* Cost Summary Card */}
                  <Card className="bg-muted/30 border-muted">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remboursement produit</span>
                        <span className="text-green-600 font-medium">Automatique</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remboursement livraison</span>
                        <span className="text-green-600 font-medium">Automatique</span>
                      </div>
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cout par testeur</span>
                          <span>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                              (products.find(p => p.id === selectedProduct.productId)?.price || 0) +
                              (products.find(p => p.id === selectedProduct.productId)?.shippingCost || 0) +
                              selectedProduct.bonus
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold text-base">
                          <span>Cout total de la campagne</span>
                          <span className="text-primary">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                              ((products.find(p => p.id === selectedProduct.productId)?.price || 0) +
                              (products.find(p => p.id === selectedProduct.productId)?.shippingCost || 0) +
                              selectedProduct.bonus) * selectedProduct.quantity
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ({selectedProduct.quantity} unite{selectedProduct.quantity > 1 ? 's' : ''} x {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                            (products.find(p => p.id === selectedProduct.productId)?.price || 0) +
                            (products.find(p => p.id === selectedProduct.productId)?.shippingCost || 0) +
                            selectedProduct.bonus
                          )})
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Distributions */}
        {createStep === 2 && (
          <div className="grid gap-5 py-4">
            {createForm.marketplaceMode === 'AMAZON_DIRECT_LINK' && (
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    En mode <strong>Lien Amazon direct</strong>, les distributions sont optionnelles.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Summary Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {selectedProduct
                        ? `Produits: ${selectedProduct.quantity}`
                        : 'Aucun produit selectionne'}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Distributions creees: {distributions.length} ligne(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedProduct && (() => {
                      const totalDistributed = distributions.reduce((sum, d) => sum + (d.maxUnits || 0), 0)
                      return totalDistributed === selectedProduct.quantity ? (
                        <Badge variant="default" className="bg-green-600">Complet</Badge>
                      ) : totalDistributed > selectedProduct.quantity ? (
                        <Badge variant="destructive">
                          Depassement: +{totalDistributed - selectedProduct.quantity}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {selectedProduct.quantity - totalDistributed} manquant(s)
                        </Badge>
                      )
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Dates de distribution</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Definissez quand et combien de produits seront distribues
                </p>
              </div>
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
                Ajouter une date
              </Button>
            </div>

            {distributions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/50 rounded-lg border border-dashed">
                <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucune distribution configuree
                </p>
                <p className="text-xs text-muted-foreground">
                  Cliquez sur &quot;Ajouter une date&quot; pour commencer
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border max-h-[250px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[120px]">Quantite</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
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
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={dist.maxUnits}
                            onChange={(e) => {
                              const newDist = [...distributions]
                              newDist[index].maxUnits = parseInt(e.target.value) || 1
                              setDistributions(newDist)
                            }}
                            className="h-9 w-20 text-center"
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

        {/* Step 3: Procedure */}
        {createStep === 3 && (
          <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
            <Tabs value={procedureMode} onValueChange={(v) => setProcedureMode(v as 'template' | 'create')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">Template existant</TabsTrigger>
                <TabsTrigger value="create">Creer une procedure</TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="mt-4">
                {procedureTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/50 rounded-lg border border-dashed">
                    <ListChecksIcon className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Aucun template de procedure disponible
                    </p>
                    <Link href="/dashboard/pro/procedures" className="text-primary hover:underline text-sm mt-2">
                      Creer un template
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template</TableHead>
                          <TableHead className="w-[80px]">Etapes</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
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
                              <Badge variant="outline">{template.steps.length}</Badge>
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
              </TabsContent>

              <TabsContent value="create" className="mt-4 space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Titre de la procedure</Label>
                    <Input
                      placeholder="Ex: Procedure de test standard"
                      value={inlineProcedure.title}
                      onChange={(e) => setInlineProcedure({ ...inlineProcedure, title: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                      placeholder="Decrivez la procedure..."
                      value={inlineProcedure.description}
                      onChange={(e) => setInlineProcedure({ ...inlineProcedure, description: e.target.value })}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Etapes de la procedure</Label>
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
                      Ajouter une etape
                    </Button>
                  </div>

                  {inlineSteps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-lg border border-dashed">
                      <ListChecksIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Aucune etape ajoutee
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                      {inlineSteps.map((step, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Titre de l'etape"
                                  value={step.title}
                                  onChange={(e) => {
                                    const newSteps = [...inlineSteps]
                                    newSteps[index].title = e.target.value
                                    setInlineSteps(newSteps)
                                  }}
                                  className="h-9 flex-1"
                                />
                                <Select
                                  value={step.type}
                                  onValueChange={(value: StepType) => {
                                    const newSteps = [...inlineSteps]
                                    newSteps[index].type = value
                                    setInlineSteps(newSteps)
                                  }}
                                >
                                  <SelectTrigger className="h-9 w-[130px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STEP_TYPES.map((t) => (
                                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setInlineSteps(inlineSteps.filter((_, i) => i !== index))
                                  }}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                              <Textarea
                                placeholder="Description de l'etape"
                                value={step.description}
                                onChange={(e) => {
                                  const newSteps = [...inlineSteps]
                                  newSteps[index].description = e.target.value
                                  setInlineSteps(newSteps)
                                }}
                                className="min-h-[50px] resize-none text-sm"
                              />
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={step.isRequired}
                                  onCheckedChange={(checked) => {
                                    const newSteps = [...inlineSteps]
                                    newSteps[index].isRequired = checked
                                    setInlineSteps(newSteps)
                                  }}
                                />
                                <Label className="text-xs text-muted-foreground">Obligatoire</Label>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Step 4: Criteria */}
        {createStep === 4 && (
          <div className="grid gap-5 py-4 max-h-[400px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Criteres d&apos;eligibilite</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Choisissez un template ou configurez manuellement
                </p>
              </div>
              <Link href="/dashboard/pro/criteria-templates">
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
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/50 rounded-lg border border-dashed">
                    <FilterIcon className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Aucun template de criteres disponible
                    </p>
                    <Link href="/dashboard/pro/criteria-templates" className="text-primary hover:underline text-sm mt-2">
                      Creer un template
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
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

        <DialogFooter className="gap-2 sm:gap-0">
          {createStep === 1 ? (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={() => setCreateStep(2)}>
                Suivant
              </Button>
            </>
          ) : createStep === 2 ? (
            <>
              <Button variant="outline" onClick={() => setCreateStep(1)}>
                Retour
              </Button>
              <Button onClick={() => {
                // Si mode AMAZON_DIRECT_LINK, sauter l'etape 3
                setCreateStep(createForm.marketplaceMode === 'PROCEDURES' ? 3 : 4)
              }}>
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
              <Button variant="outline" onClick={() => setCreateStep(createForm.marketplaceMode === 'PROCEDURES' ? 3 : 2)}>
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
  )
}
