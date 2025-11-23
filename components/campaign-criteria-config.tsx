"use client"

import { CampaignCriteria, GenderRequirement } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  UserIcon,
  StarIcon,
  MapPinIcon,
  ActivityIcon,
  ShieldCheckIcon,
  XIcon,
  PlusIcon,
  FilterIcon
} from "lucide-react"
import { useState } from "react"

interface CampaignCriteriaConfigProps {
  criteria: Partial<CampaignCriteria>
  onUpdateCriteria: (updates: Partial<CampaignCriteria>) => void
}

export function CampaignCriteriaConfig({
  criteria,
  onUpdateCriteria,
}: CampaignCriteriaConfigProps) {
  const [newCountry, setNewCountry] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newExcludedLocation, setNewExcludedLocation] = useState("")

  // Compter le nombre de critères actifs
  const activeCriteriaCount = Object.entries(criteria).filter(([key, value]) => {
    if (key === 'id' || key === 'campaignId') return false
    if (value === null || value === undefined) return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }).length

  const handleAddCountry = () => {
    if (newCountry.trim()) {
      const current = criteria.requiredCountries || []
      onUpdateCriteria({
        requiredCountries: [...current, newCountry.trim()]
      })
      setNewCountry("")
    }
  }

  const handleRemoveCountry = (index: number) => {
    const current = criteria.requiredCountries || []
    onUpdateCriteria({
      requiredCountries: current.filter((_, i) => i !== index)
    })
  }

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      const current = criteria.requiredLocations || []
      onUpdateCriteria({
        requiredLocations: [...current, newLocation.trim()]
      })
      setNewLocation("")
    }
  }

  const handleRemoveLocation = (index: number) => {
    const current = criteria.requiredLocations || []
    onUpdateCriteria({
      requiredLocations: current.filter((_, i) => i !== index)
    })
  }

  const handleAddExcludedLocation = () => {
    if (newExcludedLocation.trim()) {
      const current = criteria.excludedLocations || []
      onUpdateCriteria({
        excludedLocations: [...current, newExcludedLocation.trim()]
      })
      setNewExcludedLocation("")
    }
  }

  const handleRemoveExcludedLocation = (index: number) => {
    const current = criteria.excludedLocations || []
    onUpdateCriteria({
      excludedLocations: current.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-4">
      {/* Header avec compteur */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Criteres d'eligibilite</span>
        </div>
        {activeCriteriaCount > 0 && (
          <Badge variant="secondary">
            {activeCriteriaCount} critere{activeCriteriaCount > 1 ? 's' : ''} actif{activeCriteriaCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="rounded-lg bg-muted/50 p-3 border border-muted">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">ℹ️ Information :</span> Tous les champs sont optionnels. 
          Laisser un champ vide signifie que ce critère ne sera pas pris en compte lors de la sélection des testeurs.
        </p>
      </div>

      <Accordion type="multiple" className="w-full" defaultValue={["demographics"]}>
        {/* Section Demographiques */}
        <AccordionItem value="demographics">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Profil demographique</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Age */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Age minimum</Label>
                  <Input
                    type="number"
                    min={0}
                    max={120}
                    value={criteria.minAge ?? ''}
                    onChange={(e) => onUpdateCriteria({
                      minAge: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Age maximum</Label>
                  <Input
                    type="number"
                    min={0}
                    max={120}
                    value={criteria.maxAge ?? ''}
                    onChange={(e) => onUpdateCriteria({
                      maxAge: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Genre requis</Label>
                <Select
                  value={criteria.requiredGender || 'none'}
                  onValueChange={(value) => onUpdateCriteria({
                    requiredGender: value === 'none' ? null : value as GenderRequirement
                  })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tous les genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Non specifie</SelectItem>
                    <SelectItem value="ALL">Tous</SelectItem>
                    <SelectItem value="M">Homme</SelectItem>
                    <SelectItem value="F">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Anciennete compte */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Anciennete minimum du compte (jours)</Label>
                <Input
                  type="number"
                  min={0}
                  value={criteria.minAccountAge ?? ''}
                  onChange={(e) => onUpdateCriteria({
                    minAccountAge: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="h-9"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section Performance */}
        <AccordionItem value="performance">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <StarIcon className="h-4 w-4" />
              <span>Performance</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Note minimum (0-5)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={criteria.minRating ?? ''}
                    onChange={(e) => onUpdateCriteria({
                      minRating: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Note maximum (0-5)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={criteria.maxRating ?? ''}
                    onChange={(e) => onUpdateCriteria({
                      maxRating: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Sessions completees */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Nombre minimum de tests completes</Label>
                <Input
                  type="number"
                  min={0}
                  value={criteria.minCompletedSessions ?? ''}
                  onChange={(e) => onUpdateCriteria({
                    minCompletedSessions: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="h-9"
                />
              </div>

              {/* Taux */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Taux de completion min (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={criteria.minCompletionRate ?? ''}
                    onChange={(e) => onUpdateCriteria({
                      minCompletionRate: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Taux d'annulation max (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={criteria.maxCancellationRate ?? ''}
                    onChange={(e) => onUpdateCriteria({
                      maxCancellationRate: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section Localisation */}
        <AccordionItem value="location">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              <span>Localisation</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Pays acceptes */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Pays acceptes</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="France, Belgique..."
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCountry()
                      }
                    }}
                    className="h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={handleAddCountry}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                {criteria.requiredCountries && criteria.requiredCountries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {criteria.requiredCountries.map((country, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {country}
                        <button
                          type="button"
                          onClick={() => handleRemoveCountry(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Localisations requises */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Villes/regions acceptees</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paris, Lyon..."
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddLocation()
                      }
                    }}
                    className="h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={handleAddLocation}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                {criteria.requiredLocations && criteria.requiredLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {criteria.requiredLocations.map((loc, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {loc}
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Localisations exclues */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Villes/regions exclues</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Bordeaux..."
                    value={newExcludedLocation}
                    onChange={(e) => setNewExcludedLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddExcludedLocation()
                      }
                    }}
                    className="h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={handleAddExcludedLocation}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                {criteria.excludedLocations && criteria.excludedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {criteria.excludedLocations.map((loc, index) => (
                      <Badge key={index} variant="destructive" className="gap-1">
                        {loc}
                        <button
                          type="button"
                          onClick={() => handleRemoveExcludedLocation(index)}
                          className="ml-1 hover:text-destructive-foreground"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section Activite */}
        <AccordionItem value="activity">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <ActivityIcon className="h-4 w-4" />
              <span>Activite</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Limites sessions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Max sessions/semaine</Label>
                  <Input
                    type="number"
                    min={0}
                    value={criteria.maxSessionsPerWeek ?? ''}
                    onChange={(e) => onUpdateCriteria({
                      maxSessionsPerWeek: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Max sessions/mois</Label>
                  <Input
                    type="number"
                    min={0}
                    value={criteria.maxSessionsPerMonth ?? ''}
                    onChange={(e) => onUpdateCriteria({
                      maxSessionsPerMonth: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Derniere activite */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Actif dans les X derniers jours</Label>
                <Input
                  type="number"
                  min={0}
                  value={criteria.lastActiveWithinDays ?? ''}
                  onChange={(e) => onUpdateCriteria({
                    lastActiveWithinDays: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="h-9"
                />
              </div>

              {/* Pas de session active avec ce vendeur */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="no-active-session"
                  checked={criteria.noActiveSessionWithSeller ?? false}
                  onCheckedChange={(checked) => onUpdateCriteria({
                    noActiveSessionWithSeller: checked || null
                  })}
                />
                <Label htmlFor="no-active-session" className="text-sm cursor-pointer">
                  Pas de session en cours avec ce vendeur
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section Verification */}
        <AccordionItem value="verification">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Verification du compte</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="require-verified"
                  checked={criteria.requireVerified ?? false}
                  onCheckedChange={(checked) => onUpdateCriteria({
                    requireVerified: checked || null
                  })}
                />
                <Label htmlFor="require-verified" className="text-sm cursor-pointer">
                  Compte verifie obligatoire
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="require-prime"
                  checked={criteria.requirePrime ?? false}
                  onCheckedChange={(checked) => onUpdateCriteria({
                    requirePrime: checked || null
                  })}
                />
                <Label htmlFor="require-prime" className="text-sm cursor-pointer">
                  Statut premium obligatoire
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
