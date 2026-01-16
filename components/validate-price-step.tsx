'use client'

import { useState } from 'react'
import { Session, api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Euro } from 'lucide-react'
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
    const priceValue = parseFloat(price)

    if (isNaN(priceValue)) {
      toast.error('Prix invalide', {
        description: 'Veuillez entrer un prix valide',
      })
      return
    }

    const validation = validatePrice(priceValue)
    if (!validation.valid) {
      toast.error('Prix invalide', {
        description: validation.error,
      })
      return
    }

    setIsSubmitting(true)

    try {
      await api.validatePrice(session.id, { productPrice: priceValue })

      toast.success('Prix validé', {
        description: `Le prix de ${priceValue}€ a été validé avec succès`,
      })

      onComplete()
    } catch (error) {
      console.error('Error validating price:', error)
      toast.error('Erreur', {
        description: 'Impossible de valider le prix. Veuillez réessayer.',
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
