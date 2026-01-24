"use client"

import { Product } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PackageIcon, XIcon } from "lucide-react"
import Link from "next/link"

interface ProductConfig {
  productId: string
  productName: string
  quantity: number
  expectedPrice: number
  shippingCost: number
  reimbursedPrice: boolean
  reimbursedShipping: boolean
  bonus: number
}

interface CampaignProductConfigProps {
  products: Product[]
  selectedProduct: ProductConfig | null
  onSelectProduct: (productId: string) => void
  onUpdateProduct: (updates: Partial<ProductConfig>) => void
  onRemoveProduct: () => void
}

export function CampaignProductConfig({
  products,
  selectedProduct,
  onSelectProduct,
  onUpdateProduct,
  onRemoveProduct,
}: CampaignProductConfigProps) {
  const product = products.find(p => p.id === selectedProduct?.productId)

  // Calculs en temps réel
  const pricePerTester = selectedProduct
    ? (selectedProduct.reimbursedPrice ? (product?.price || 0) : 0) +
      (selectedProduct.reimbursedShipping ? (product?.shippingCost || 0) : 0) +
      selectedProduct.bonus
    : 0

  const totalCost = selectedProduct ? pricePerTester * selectedProduct.quantity : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-muted/50 rounded-md">
        <PackageIcon className="h-4 w-4" />
        <span>Aucun produit disponible.</span>
        <Link href="/dashboard/products" className="text-primary hover:underline font-medium">
          Créer un produit
        </Link>
      </div>
    )
  }

  if (!selectedProduct) {
    return (
      <Select
        value=""
        onValueChange={onSelectProduct}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="Sélectionner un produit..." />
        </SelectTrigger>
        <SelectContent>
          {products.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <div className="flex items-center gap-2">
                <PackageIcon className="h-4 w-4 text-muted-foreground" />
                <span>{p.name}</span>
                <span className="text-muted-foreground">- {formatPrice(p.price)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header avec produit et quantité */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center gap-2 flex-1">
            <PackageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium">{product?.name || 'Produit inconnu'}</h4>
              <Link 
                href={`/dashboard/products?edit=${selectedProduct.productId}`}
                className="text-xs text-primary hover:underline"
              >
                Modifier le produit →
              </Link>
            </div>
          </div>
          
          {/* Quantité à côté du produit */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Quantité</Label>
              <Input
                type="number"
                min={1}
                value={selectedProduct.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1
                  onUpdateProduct({ quantity: value > 0 ? value : 1 })
                }}
                className="h-9 w-24 text-center mt-1"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive mt-6"
              onClick={onRemoveProduct}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4 -mt-2">
          Chaque testeur reçoit 1 produit. Ce nombre correspond aussi au nombre de distributions à créer.
        </p>

        {/* Nom exact du produit */}
        <div className="mb-4">
          <Label htmlFor="productName" className="text-sm font-medium">
            Nom exact du produit <span className="text-destructive">*</span>
          </Label>
          <Input
            id="productName"
            placeholder="Ex: iPhone 15 Pro Max 256GB Titane Naturel"
            value={selectedProduct?.productName || ''}
            onChange={(e) => onUpdateProduct({ productName: e.target.value })}
            maxLength={500}
            className="h-9 mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Le nom exact tel qu'il apparaît sur le site marchand (Amazon, etc.)
          </p>
        </div>

        {/* Bonus */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground">Bonus supplémentaire</Label>
          <div className="relative mt-1">
            <Input
              type="text"
              inputMode="decimal"
              value={selectedProduct.bonus}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                onUpdateProduct({ bonus: parseFloat(value) || 0 })
              }}
              className="h-9 pr-6"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
          </div>
        </div>

        {/* Prix catalogue */}
        <div className="rounded-md bg-muted/50 p-3 mb-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prix produit:</span>
              <span className="font-medium">{formatPrice(product?.price || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais livraison:</span>
              <span className="font-medium">{formatPrice(product?.shippingCost || 0)}</span>
            </div>
          </div>
        </div>

        {/* Remboursements */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="reimburse-price"
              checked={selectedProduct.reimbursedPrice}
              onCheckedChange={(checked) => onUpdateProduct({ reimbursedPrice: checked })}
            />
            <Label htmlFor="reimburse-price" className="text-sm cursor-pointer">
              Rembourser le prix du produit ({formatPrice(product?.price || 0)})
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="reimburse-shipping"
              checked={selectedProduct.reimbursedShipping}
              onCheckedChange={(checked) => onUpdateProduct({ reimbursedShipping: checked })}
            />
            <Label htmlFor="reimburse-shipping" className="text-sm cursor-pointer">
              Rembourser les frais de livraison ({formatPrice(product?.shippingCost || 0)})
            </Label>
          </div>
        </div>

        {/* Calculs en temps réel */}
        <div className="border-t pt-4 space-y-3">
          <div className="text-sm font-medium mb-2">💰 Détails du coût</div>
          
          {/* Décomposition par unité */}
          <div className="bg-muted/30 rounded-md p-3 space-y-2 text-sm">
            <div className="font-medium text-muted-foreground mb-1">Coût par unité:</div>
            {selectedProduct.reimbursedPrice && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">• Prix produit</span>
                <span className="font-medium">{formatPrice(product?.price || 0)}</span>
              </div>
            )}
            {selectedProduct.reimbursedShipping && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">• Frais livraison</span>
                <span className="font-medium">{formatPrice(product?.shippingCost || 0)}</span>
              </div>
            )}
            {selectedProduct.bonus > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">• Bonus</span>
                <span className="font-medium text-green-600">+{formatPrice(selectedProduct.bonus)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Total unitaire</span>
              <span className="text-lg font-bold text-primary">{formatPrice(pricePerTester)}</span>
            </div>
          </div>
          
          {/* Calcul total basé sur quantity */}
          {selectedProduct.quantity > 0 && (
            <div className="bg-primary/5 rounded-md p-3 space-y-2 text-sm">
              <div className="font-medium text-muted-foreground mb-1">Coût total ({selectedProduct.quantity} unités):</div>
              {selectedProduct.reimbursedPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">• Prix produits ({selectedProduct.quantity} × {formatPrice(product?.price || 0)})</span>
                  <span className="font-medium">{formatPrice((product?.price || 0) * selectedProduct.quantity)}</span>
                </div>
              )}
              {selectedProduct.reimbursedShipping && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">• Frais livraison ({selectedProduct.quantity} × {formatPrice(product?.shippingCost || 0)})</span>
                  <span className="font-medium">{formatPrice((product?.shippingCost || 0) * selectedProduct.quantity)}</span>
                </div>
              )}
              {selectedProduct.bonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">• Bonus ({selectedProduct.quantity} × {formatPrice(selectedProduct.bonus)})</span>
                  <span className="font-medium text-green-600">+{formatPrice(selectedProduct.bonus * selectedProduct.quantity)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">💸 Coût total campagne</span>
                <span className="text-xl font-bold text-green-600">{formatPrice(totalCost)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

