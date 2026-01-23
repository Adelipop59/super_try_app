"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, Product, Category } from "@/lib/api"
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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, PencilIcon, Trash2Icon, AlertTriangleIcon, PackageIcon } from "lucide-react"
import { toast } from "sonner"
import { ProductsDataTable } from "@/components/products-data-table"
import { ImageUpload } from "@/components/ui/image-upload"

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Create state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    asin: '',
    productUrl: '',
    price: 0,
    shippingCost: 0,
    amazonUrl: '',
  })
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    asin: '',
    productUrl: '',
    price: 0,
    shippingCost: 0,
    amazonUrl: '',
    isActive: true,
  })
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
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

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories()
      setCategories(data.filter(c => c.isActive))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
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

    if (!createForm.categoryId) {
      toast.error('Veuillez sélectionner une catégorie')
      return
    }

    try {
      setIsCreating(true)

      // Utiliser FormData pour envoyer les fichiers avec les données
      const formData = new FormData()
      formData.append('name', createForm.name)
      if (createForm.description) formData.append('description', createForm.description)
      if (createForm.categoryId) formData.append('categoryId', createForm.categoryId)
      if (createForm.asin) formData.append('asin', createForm.asin)
      if (createForm.productUrl) formData.append('productUrl', createForm.productUrl)
      formData.append('price', createForm.price.toString())
      if (createForm.shippingCost) formData.append('shippingCost', createForm.shippingCost.toString())

      // Ajouter le fichier image si présent
      if (createImageFile) {
        formData.append('images', createImageFile)
      }

      // Appeler l'API avec FormData
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/products`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la création')
      }

      toast.success('Produit créé avec succès')
      setIsCreateDialogOpen(false)
      setCreateForm({
        name: '',
        description: '',
        categoryId: '',
        asin: '',
        productUrl: '',
        price: 0,
        shippingCost: 0,
        amazonUrl: '',
      })
      setCreateImageFile(null)
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
      categoryId: product.categoryId || '',
      asin: product.asin || '',
      productUrl: product.productUrl || '',
      price: product.price,
      shippingCost: product.shippingCost || 0,
      amazonUrl: product.amazonUrl || '',
      isActive: product.isActive,
    })
    setEditImageFile(null)
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

    if (!editForm.categoryId) {
      toast.error('Veuillez sélectionner une catégorie')
      return
    }

    try {
      setIsSaving(true)

      // 1. Mettre à jour les données du produit (sans fichier)
      await api.updateProduct(editingProduct.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        categoryId: editForm.categoryId || undefined,
        asin: editForm.asin || undefined,
        productUrl: editForm.productUrl || undefined,
        price: editForm.price,
        shippingCost: editForm.shippingCost,
        amazonUrl: editForm.amazonUrl || undefined,
        isActive: editForm.isActive,
      })

      // 2. Si un fichier image a été sélectionné, l'uploader séparément
      if (editImageFile) {
        await api.addProductImages(editingProduct.id, [editImageFile])
      }

      toast.success('Produit mis à jour avec succès')
      setIsEditDialogOpen(false)
      setEditingProduct(null)
      setEditImageFile(null)
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

  const handleToggleActive = async (product: Product) => {
    try {
      await api.updateProduct(product.id, {
        isActive: !product.isActive,
      })

      toast.success(product.isActive ? 'Produit désactivé' : 'Produit activé')
      fetchProducts()
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      toast.error('Erreur lors de la modification du statut')
    }
  }

  return (
    <>
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
                        Vous n&apos;avez pas encore de produit
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
                    onToggleActive={handleToggleActive}
                    onAdd={() => setIsCreateDialogOpen(true)}
                  />
                )}
      </div>

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
            <div className="grid gap-2">
              <Label htmlFor="create-category" className="text-sm font-medium">
                Catégorie <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createForm.categoryId}
                onValueChange={(value) => setCreateForm({ ...createForm, categoryId: value })}
              >
                <SelectTrigger id="create-category" className="h-10">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon && `${cat.icon} `}{cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label htmlFor="create-shippingCost" className="text-sm font-medium">
                  Frais de livraison (€)
                </Label>
                <Input
                  id="create-shippingCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5.99"
                  value={createForm.shippingCost || ''}
                  onChange={(e) => setCreateForm({ ...createForm, shippingCost: parseFloat(e.target.value) || 0 })}
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-asin" className="text-sm font-medium">
                ASIN Amazon (optionnel)
              </Label>
              <Input
                id="create-asin"
                placeholder="B08N5WRWNW"
                maxLength={10}
                value={createForm.asin}
                onChange={(e) => {
                  const asin = e.target.value.toUpperCase()
                  setCreateForm({
                    ...createForm,
                    asin,
                    productUrl: asin.length === 10 ? `https://www.amazon.fr/dp/${asin}` : createForm.productUrl
                  })
                }}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                L'URL sera générée automatiquement
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-productUrl" className="text-sm font-medium">
                URL du produit
              </Label>
              <Input
                id="create-productUrl"
                type="url"
                placeholder="https://www.amazon.fr/dp/..."
                value={createForm.productUrl}
                onChange={(e) => setCreateForm({ ...createForm, productUrl: e.target.value })}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Modifiable manuellement si nécessaire
              </p>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">
                Image du produit
              </Label>
              <ImageUpload
                value=""
                onChange={() => {}}
                onFileChange={(file) => setCreateImageFile(file)}
                disabled={isCreating}
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
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) {
          setEditImageFile(null)
        }
      }}>
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
            <div className="grid gap-2">
              <Label htmlFor="edit-category" className="text-sm font-medium">
                Catégorie <span className="text-destructive">*</span>
              </Label>
              <Select
                value={editForm.categoryId}
                onValueChange={(value) => setEditForm({ ...editForm, categoryId: value })}
              >
                <SelectTrigger id="edit-category" className="h-10">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon && `${cat.icon} `}{cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label htmlFor="edit-shippingCost" className="text-sm font-medium">
                  Frais de livraison (€)
                </Label>
                <Input
                  id="edit-shippingCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5.99"
                  value={editForm.shippingCost || ''}
                  onChange={(e) => setEditForm({ ...editForm, shippingCost: parseFloat(e.target.value) || 0 })}
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-asin" className="text-sm font-medium">
                ASIN Amazon (optionnel)
              </Label>
              <Input
                id="edit-asin"
                placeholder="B08N5WRWNW"
                maxLength={10}
                value={editForm.asin}
                onChange={(e) => {
                  const asin = e.target.value.toUpperCase()
                  setEditForm({
                    ...editForm,
                    asin,
                    productUrl: asin.length === 10 ? `https://www.amazon.fr/dp/${asin}` : editForm.productUrl
                  })
                }}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                L'URL sera générée automatiquement
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-productUrl" className="text-sm font-medium">
                URL du produit
              </Label>
              <Input
                id="edit-productUrl"
                type="url"
                placeholder="https://www.amazon.fr/dp/..."
                value={editForm.productUrl}
                onChange={(e) => setEditForm({ ...editForm, productUrl: e.target.value })}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Modifiable manuellement si nécessaire
              </p>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">
                Image du produit
              </Label>
              <ImageUpload
                value={editingProduct?.images && Array.isArray(editingProduct.images) && editingProduct.images.length > 0 ? editingProduct.images[0].url : ''}
                onChange={() => {}}
                onFileChange={(file) => setEditImageFile(file)}
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="edit-isActive" className="text-sm font-medium">
                  Statut du produit
                </Label>
                <p className="text-xs text-muted-foreground">
                  {editForm.isActive ? 'Le produit est visible et utilisable dans les campagnes' : 'Le produit est masqué'}
                </p>
              </div>
              <Switch
                id="edit-isActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
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
              <span className="font-semibold text-foreground">&quot;{deletingProduct?.name}&quot;</span> ?
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
    </>
  )
}
