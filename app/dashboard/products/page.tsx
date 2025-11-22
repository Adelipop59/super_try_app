"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api, Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
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
import { PlusIcon, PencilIcon, Trash2Icon, AlertTriangleIcon, PackageIcon } from "lucide-react"
import { toast } from "sonner"
import { ProductsDataTable } from "@/components/products-data-table"

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Create state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    price: 0,
    amazonUrl: '',
    imageUrl: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  // Edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: 0,
    amazonUrl: '',
    imageUrl: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [user])

  const fetchProducts = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await api.getMyProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSave = async () => {
    if (!createForm.name.trim()) {
      toast.error('Le nom du produit est requis')
      return
    }

    if (createForm.price <= 0) {
      toast.error('Le prix doit être supérieur à 0')
      return
    }

    try {
      setIsCreating(true)

      await api.createProduct({
        name: createForm.name,
        description: createForm.description || undefined,
        price: createForm.price,
        amazonUrl: createForm.amazonUrl || undefined,
        imageUrl: createForm.imageUrl || undefined,
      })

      toast.success('Produit créé avec succès')
      setIsCreateDialogOpen(false)
      setCreateForm({
        name: '',
        description: '',
        price: 0,
        amazonUrl: '',
        imageUrl: '',
      })
      fetchProducts()
    } catch (error) {
      console.error('Failed to create product:', error)
      toast.error('Erreur lors de la création du produit')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      amazonUrl: product.amazonUrl || '',
      imageUrl: product.imageUrl || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingProduct) return

    if (!editForm.name.trim()) {
      toast.error('Le nom du produit est requis')
      return
    }

    if (editForm.price <= 0) {
      toast.error('Le prix doit être supérieur à 0')
      return
    }

    try {
      setIsSaving(true)

      await api.updateProduct(editingProduct.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        price: editForm.price,
        amazonUrl: editForm.amazonUrl || undefined,
        imageUrl: editForm.imageUrl || undefined,
      })

      toast.success('Produit mis à jour avec succès')
      setIsEditDialogOpen(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Failed to update product:', error)
      toast.error('Erreur lors de la mise à jour du produit')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return

    try {
      setIsDeleting(true)
      await api.deleteProduct(deletingProduct.id)

      toast.success('Produit supprimé avec succès')
      setIsDeleteDialogOpen(false)
      setDeletingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error('Erreur lors de la suppression du produit')
    } finally {
      setIsDeleting(false)
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
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Produits</h2>
                  <p className="text-muted-foreground">
                    Gérez vos produits à tester
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : products.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        Vous n'avez pas encore de produit
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Créer votre premier produit
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <ProductsDataTable
                    data={products}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onAdd={() => setIsCreateDialogOpen(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PackageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Nouveau produit</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau produit à tester
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name" className="text-sm font-medium">
                Nom du produit <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-name"
                placeholder="Ex: Casque Bluetooth Sony"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="create-description"
                placeholder="Décrivez votre produit..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-price" className="text-sm font-medium">
                  Prix (€) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="29.99"
                  value={createForm.price || ''}
                  onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-amazonUrl" className="text-sm font-medium">
                  Lien Amazon
                </Label>
                <Input
                  id="create-amazonUrl"
                  type="url"
                  placeholder="https://amazon.fr/..."
                  value={createForm.amazonUrl}
                  onChange={(e) => setCreateForm({ ...createForm, amazonUrl: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-imageUrl" className="text-sm font-medium">
                URL de l'image
              </Label>
              <Input
                id="create-imageUrl"
                type="url"
                placeholder="https://exemple.com/image.jpg"
                value={createForm.imageUrl}
                onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
                className="h-10"
              />
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
                  Créer le produit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PencilIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Modifier le produit</DialogTitle>
                <DialogDescription>
                  Modifiez les informations de votre produit
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Nom du produit <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Ex: Casque Bluetooth Sony"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Décrivez votre produit..."
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price" className="text-sm font-medium">
                  Prix (€) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="29.99"
                  value={editForm.price || ''}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-amazonUrl" className="text-sm font-medium">
                  Lien Amazon
                </Label>
                <Input
                  id="edit-amazonUrl"
                  type="url"
                  placeholder="https://amazon.fr/..."
                  value={editForm.amazonUrl}
                  onChange={(e) => setEditForm({ ...editForm, amazonUrl: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-imageUrl" className="text-sm font-medium">
                URL de l'image
              </Label>
              <Input
                id="edit-imageUrl"
                type="url"
                placeholder="https://exemple.com/image.jpg"
                value={editForm.imageUrl}
                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
                <DialogTitle className="text-xl">Supprimer le produit</DialogTitle>
                <DialogDescription>
                  Cette action est irréversible
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer le produit{' '}
              <span className="font-semibold text-foreground">"{deletingProduct?.name}"</span> ?
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
