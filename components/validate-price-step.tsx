'use client'

import { useState } from 'react'
import { Session, api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, AlertTriangle, CheckCircle2, Euro, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface ValidatePriceStepProps {
  session: Session
  minPrice?: number
  maxPrice?: number
  onComplete: () => void
}

export function ValidatePriceStep({
  session,
  minPrice,
  maxPrice,
  onComplete,
}: ValidatePriceStepProps) {
  const [price, setPrice] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attempts, setAttempts] = useState(session.priceValidationAttempts || 0)
  const [showTitleInput, setShowTitleInput] = useState(attempts >= 2)
  const [productTitle, setProductTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validatePrice = (priceValue: number): { valid: boolean; error?: string } => {
    if (priceValue <= 0) {
      return { valid: false, error: 'Le prix doit être supérieur à 0€' }
    }

    if (minPrice !== undefined && priceValue < minPrice) {
      return {
        valid: false,
        error: `Le prix doit être d'au moins ${minPrice}€`,
      }
    }

    if (maxPrice !== undefined && priceValue > maxPrice) {
      return {
        valid: false,
        error: `Le prix ne doit pas dépasser ${maxPrice}€`,
      }
    }

    return { valid: true }
  }

  const handleSubmit = async () => {
    setError(null)
    const priceValue = parseFloat(price)

    if (isNaN(priceValue)) {
      const errorMsg = 'Veuillez entrer un prix valide'
      setError(errorMsg)
      toast.error('Prix invalide', {
        description: errorMsg,
      })
      return
    }

    // Si on affiche le champ titre, le titre est requis
    if (showTitleInput && !productTitle.trim()) {
      const errorMsg = 'Le titre du produit est requis après 2 tentatives'
      setError(errorMsg)
      toast.error('Titre requis', {
        description: errorMsg,
      })
      return
    }

    const validation = validatePrice(priceValue)
    if (!validation.valid) {
      setError(validation.error)
      toast.error('Prix invalide', {
        description: validation.error,
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Préparer les données
      const data: { productPrice: number; productTitle?: string } = {
        productPrice: priceValue,
      }

      if (showTitleInput && productTitle.trim()) {
        data.productTitle = productTitle.trim()
      }

      // Appeler l'API
      await api.validatePrice(session.id, data)

      toast.success('Prix validé', {
        description: `Le prix de ${priceValue}€ a été validé avec succès`,
      })

      onComplete()
    } catch (error: any) {
      const errorMessage = error.message || 'Impossible de valider le prix. Veuillez réessayer.'
      setError(errorMessage)

      // Si l'erreur indique qu'on a épuisé les tentatives, afficher le champ titre
      if (errorMessage.includes('2 tentatives') || errorMessage.includes('épuisé')) {
        setShowTitleInput(true)
        setAttempts(2)
      } else {
        // Incrémenter localement le compteur de tentatives (sera confirmé par le serveur)
        const match = errorMessage.match(/Tentative (\d+)\/2/)
        if (match) {
          const currentAttempt = parseInt(match[1])
          setAttempts(currentAttempt)
          if (currentAttempt >= 2) {
            setShowTitleInput(true)
          }
        }
      }

      console.error('Error validating price:', error)
      toast.error('Erreur', {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const priceValue = parseFloat(price)
  const validation = !isNaN(priceValue) ? validatePrice(priceValue) : { valid: false }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Euro className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Validation du prix du produit
              </h4>
              <p className="text-sm text-blue-700">
                Recherchez le produit sur Amazon et vérifiez que son prix correspond à la
                fourchette attendue.
              </p>
            </div>

            {/* Product Name Display */}
            {session.campaign?.products?.[0]?.productName && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Produit à rechercher
                    </p>
                    <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                      {session.campaign.products[0].productName}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      Cherchez exactement ce produit sur la marketplace. Le prix doit correspondre.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Price Range Display */}
            {(minPrice !== undefined || maxPrice !== undefined) && (
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Fourchette de prix acceptée :
                </p>
                <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                  {minPrice !== undefined && maxPrice !== undefined ? (
                    <>
                      {minPrice}€ - {maxPrice}€
                    </>
                  ) : minPrice !== undefined ? (
                    <>Minimum : {minPrice}€</>
                  ) : (
                    <>Maximum : {maxPrice}€</>
                  )}
                </div>
              </div>
            )}

            {/* Price Input */}
            <div className="space-y-2">
              <Label htmlFor="product-price" className="text-sm font-medium">
                Prix trouvé sur Amazon (€)
              </Label>
              <div className="flex gap-3">
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 29.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!price || isSubmitting || !validation.valid}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? 'Validation...' : 'Valider'}
                </Button>
              </div>

              {/* Attempts Counter */}
              {attempts > 0 && attempts < 2 && (
                <p className="text-xs text-orange-600 mt-1">
                  Tentative {attempts}/2
                </p>
              )}

              {/* Validation Feedback */}
              {price && !isNaN(priceValue) && (
                <div className="flex items-start gap-2 mt-2">
                  {validation.valid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-700">
                        Le prix est dans la fourchette acceptée
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{validation.error}</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Product Title Input (after 2 failures) */}
            {showTitleInput && (
              <div className="space-y-2">
                <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                        Vous avez épuisé vos 2 tentatives de validation du prix.
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                        Pour continuer, veuillez saisir le titre complet du produit que vous avez trouvé.
                        Cela permettra au vendeur de vérifier si c'est le bon produit ou si le prix dans
                        la campagne doit être corrigé.
                      </p>
                      <Label htmlFor="productTitle" className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Titre du produit trouvé <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="productTitle"
                        type="text"
                        value={productTitle}
                        onChange={(e) => setProductTitle(e.target.value)}
                        placeholder="Ex: iPhone 15 Pro Max 256GB Titane Naturel"
                        className="mt-2"
                        maxLength={500}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Copiez exactement le titre tel qu'il apparaît sur le site marchand
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Help Text */}
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Important :</strong> Assurez-vous que le prix correspond exactement
                au prix affiché sur Amazon au moment de votre vérification. Une fois validé,
                vous pourrez passer commande.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
