"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api, Campaign, Product, CampaignProduct } from "@/lib/api"
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
import { MoreHorizontalIcon, PlusIcon, PencilIcon, Trash2Icon, AlertTriangleIcon, PackageIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CampaignsPage() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Edit state
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalSlots: 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Create state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalSlots: 10,
  })
  const [selectedProducts, setSelectedProducts] = useState<{productId: string, quantity: number}[]>([])
  const [isCreating, setIsCreating] = useState(false)

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
      const [campaignsData, productsData] = await Promise.all([
        api.getMyCampaigns(),
        api.getMyProducts()
      ])
      setCampaigns(campaignsData)
      setProducts(productsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setCampaigns([])
      setProducts([])
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

  const handleEditClick = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setEditForm({
      title: campaign.title,
      description: campaign.description || '',
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      totalSlots: campaign.totalSlots,
    })
    setIsEditSheetOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingCampaign) return

    try {
      setIsSaving(true)

      // Only send allowed fields: title, description, startDate, endDate, totalSlots
      const updateData: {
        title: string
        description: string
        totalSlots: number
        startDate?: string
        endDate?: string
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

      await api.updateCampaign(editingCampaign.id, updateData)

      toast.success('Campagne mise à jour avec succès')
      setIsEditSheetOpen(false)
      setEditingCampaign(null)
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
        products?: { productId: string; quantity: number }[]
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

      await api.createCampaign(createData)

      toast.success('Campagne créée avec succès')
      setIsCreateDialogOpen(false)
      setCreateForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        totalSlots: 10,
      })
      setSelectedProducts([])
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Produit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Slots</TableHead>
                            <TableHead>Créée le</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campaigns.map((campaign) => (
                            <TableRow key={campaign.id}>
                              <TableCell>
                                <div className="font-medium">{campaign.title}</div>
                                {campaign.description && (
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {campaign.description}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {campaign.products && campaign.products.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {campaign.products.slice(0, 2).map((cp, idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <PackageIcon className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm truncate max-w-[150px]">
                                          {cp.product?.name || 'Produit'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          x{cp.quantity}
                                        </span>
                                      </div>
                                    ))}
                                    {campaign.products.length > 2 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{campaign.products.length - 2} autre(s)
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(campaign.status)}
                              </TableCell>
                              <TableCell>
                                {campaign.usedSlots}/{campaign.totalSlots}
                              </TableCell>
                              <TableCell>
                                {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontalIcon className="h-4 w-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Voir détails</DropdownMenuItem>
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
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PlusIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Nouvelle campagne</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle campagne de test produit
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-5 py-4">
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
                className="min-h-[100px] resize-none"
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
                  {/* Liste des produits sélectionnés */}
                  {selectedProducts.map((sp, index) => {
                    const product = products.find(p => p.id === sp.productId)
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                        <PackageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm flex-1 truncate">{product?.name || 'Produit inconnu'}</span>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`quantity-${index}`} className="text-xs text-muted-foreground">
                            Qté:
                          </Label>
                          <Input
                            id={`quantity-${index}`}
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
                        </div>
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
                      </div>
                    )
                  })}

                  {/* Sélecteur pour ajouter un nouveau produit */}
                  {products.filter(p => !selectedProducts.some(sp => sp.productId === p.id)).length > 0 && (
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value) {
                          setSelectedProducts([...selectedProducts, { productId: value, quantity: 1 }])
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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PencilIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Modifier la campagne</DialogTitle>
                <DialogDescription>
                  Modifiez les informations de votre campagne
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Titre de la campagne
              </Label>
              <Input
                id="title"
                placeholder="Ex: Test produit été 2024"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre campagne..."
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Date de début
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  Date de fin
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalSlots" className="text-sm font-medium">
                Nombre de slots
              </Label>
              <Input
                id="totalSlots"
                type="number"
                min="1"
                placeholder="10"
                value={editForm.totalSlots}
                onChange={(e) => setEditForm({ ...editForm, totalSlots: parseInt(e.target.value) || 0 })}
                className="h-10"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
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
