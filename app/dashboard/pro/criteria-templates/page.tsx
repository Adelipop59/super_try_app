"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, CriteriaTemplate, CreateCriteriaTemplateData, CampaignCriteria } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon, PencilIcon, Trash2Icon, AlertTriangleIcon, FilterIcon, EyeIcon } from "lucide-react"
import { toast } from "sonner"
import { CampaignCriteriaConfig } from "@/components/campaign-criteria-config"

export default function CriteriaTemplatesPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<CriteriaTemplate[]>([])
  const [loading, setLoading] = useState(true)

  // Create state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createCriteria, setCreateCriteria] = useState<Partial<CampaignCriteria>>({})
  const [isCreating, setIsCreating] = useState(false)

  // Edit state
  const [editingTemplate, setEditingTemplate] = useState<CriteriaTemplate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCriteria, setEditCriteria] = useState<Partial<CampaignCriteria>>({})
  const [isSaving, setIsSaving] = useState(false)

  // View state
  const [viewingTemplate, setViewingTemplate] = useState<CriteriaTemplate | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Delete state
  const [deletingTemplate, setDeletingTemplate] = useState<CriteriaTemplate | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [user])

  const fetchTemplates = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await api.getCriteriaTemplates()
      setTemplates(data || [])
    } catch (error) {
      console.error('Failed to fetch criteria templates:', error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const countActiveCriteria = (template: CriteriaTemplate): number => {
    let count = 0
    if (template.minAge) count++
    if (template.maxAge) count++
    if (template.minRating) count++
    if (template.maxRating) count++
    if (template.minCompletedSessions) count++
    if (template.requiredGender && template.requiredGender !== 'ALL') count++
    if (template.requiredCountries && template.requiredCountries.length > 0) count++
    if (template.requiredLocations && template.requiredLocations.length > 0) count++
    if (template.excludedLocations && template.excludedLocations.length > 0) count++
    if (template.noActiveSessionWithSeller) count++
    if (template.maxSessionsPerWeek) count++
    if (template.maxSessionsPerMonth) count++
    if (template.minCompletionRate) count++
    if (template.maxCancellationRate) count++
    if (template.minAccountAge) count++
    if (template.lastActiveWithinDays) count++
    if (template.requireVerified) count++
    if (template.requirePrime) count++
    return count
  }

  const handleCreateSave = async () => {
    if (!createName.trim()) {
      toast.error('Le nom du template est requis')
      return
    }

    try {
      setIsCreating(true)

      const data: CreateCriteriaTemplateData = {
        name: createName,
        ...createCriteria,
      }

      await api.createCriteriaTemplate(data)

      toast.success('Template de criteres cree avec succes')
      setIsCreateDialogOpen(false)
      setCreateName('')
      setCreateCriteria({})
      fetchTemplates()
    } catch (error) {
      console.error('Failed to create criteria template:', error)
      toast.error('Erreur lors de la creation du template')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditClick = (template: CriteriaTemplate) => {
    setEditingTemplate(template)
    setEditName(template.name)
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
    setIsEditDialogOpen(true)
  }

  const handleViewClick = (template: CriteriaTemplate) => {
    setViewingTemplate(template)
    setIsViewDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingTemplate) return

    try {
      setIsSaving(true)

      await api.updateCriteriaTemplate(editingTemplate.id, {
        name: editName,
        ...editCriteria,
      })

      toast.success('Template mis a jour avec succes')
      setIsEditDialogOpen(false)
      setEditingTemplate(null)
      fetchTemplates()
    } catch (error) {
      console.error('Failed to update criteria template:', error)
      toast.error('Erreur lors de la mise a jour du template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (template: CriteriaTemplate) => {
    setDeletingTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTemplate) return

    try {
      setIsDeleting(true)
      await api.deleteCriteriaTemplate(deletingTemplate.id)

      toast.success('Template supprime avec succes')
      setIsDeleteDialogOpen(false)
      setDeletingTemplate(null)
      fetchTemplates()
    } catch (error) {
      console.error('Failed to delete criteria template:', error)
      toast.error('Erreur lors de la suppression du template')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Templates de criteres</h2>
                    <p className="text-muted-foreground">
                      Gerez vos templates de criteres d&apos;eligibilite reutilisables
                    </p>
                  </div>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Nouveau template
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : !templates || templates.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <FilterIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Vous n&apos;avez pas encore de template de criteres
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Creer votre premier template
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Criteres actifs</TableHead>
                          <TableHead>Cree le</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FilterIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{template.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {countActiveCriteria(template)} critere{countActiveCriteria(template) > 1 ? 's' : ''}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleViewClick(template)}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditClick(template)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteClick(template)}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PlusIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Nouveau template de criteres</DialogTitle>
                <DialogDescription>
                  Creez un template reutilisable pour vos campagnes
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name" className="text-sm font-medium">
                Nom du template <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-name"
                placeholder="Ex: Testeurs premium Paris"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="h-10"
              />
            </div>

            <CampaignCriteriaConfig
              criteria={createCriteria}
              onUpdateCriteria={(updates) => setCreateCriteria({ ...createCriteria, ...updates })}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
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
                  Creer le template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PencilIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Modifier le template</DialogTitle>
                <DialogDescription>
                  Modifiez les criteres du template
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Nom du template <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Ex: Testeurs premium Paris"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-10"
              />
            </div>

            <CampaignCriteriaConfig
              criteria={editCriteria}
              onUpdateCriteria={(updates) => setEditCriteria({ ...editCriteria, ...updates })}
            />
          </div>

          <DialogFooter>
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <EyeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{viewingTemplate?.name}</DialogTitle>
                <DialogDescription>
                  Details du template de criteres
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewingTemplate && (
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {viewingTemplate.minAge && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age min:</span>
                    <span className="font-medium">{viewingTemplate.minAge} ans</span>
                  </div>
                )}
                {viewingTemplate.maxAge && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age max:</span>
                    <span className="font-medium">{viewingTemplate.maxAge} ans</span>
                  </div>
                )}
                {viewingTemplate.minRating && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note min:</span>
                    <span className="font-medium">{viewingTemplate.minRating}/5</span>
                  </div>
                )}
                {viewingTemplate.maxRating && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note max:</span>
                    <span className="font-medium">{viewingTemplate.maxRating}/5</span>
                  </div>
                )}
                {viewingTemplate.minCompletedSessions && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tests min:</span>
                    <span className="font-medium">{viewingTemplate.minCompletedSessions}</span>
                  </div>
                )}
                {viewingTemplate.requiredGender && viewingTemplate.requiredGender !== 'ALL' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Genre:</span>
                    <span className="font-medium">{viewingTemplate.requiredGender === 'M' ? 'Homme' : 'Femme'}</span>
                  </div>
                )}
                {viewingTemplate.minAccountAge && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anciennete:</span>
                    <span className="font-medium">{viewingTemplate.minAccountAge} jours</span>
                  </div>
                )}
                {viewingTemplate.minCompletionRate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taux completion:</span>
                    <span className="font-medium">{viewingTemplate.minCompletionRate}%</span>
                  </div>
                )}
                {viewingTemplate.maxCancellationRate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taux annulation max:</span>
                    <span className="font-medium">{viewingTemplate.maxCancellationRate}%</span>
                  </div>
                )}
                {viewingTemplate.lastActiveWithinDays && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actif dans:</span>
                    <span className="font-medium">{viewingTemplate.lastActiveWithinDays} jours</span>
                  </div>
                )}
                {viewingTemplate.maxSessionsPerWeek && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max/semaine:</span>
                    <span className="font-medium">{viewingTemplate.maxSessionsPerWeek}</span>
                  </div>
                )}
                {viewingTemplate.maxSessionsPerMonth && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max/mois:</span>
                    <span className="font-medium">{viewingTemplate.maxSessionsPerMonth}</span>
                  </div>
                )}
              </div>

              {(viewingTemplate.requireVerified || viewingTemplate.requirePrime || viewingTemplate.noActiveSessionWithSeller) && (
                <div className="flex flex-wrap gap-2">
                  {viewingTemplate.requireVerified && (
                    <Badge variant="secondary">Compte verifie</Badge>
                  )}
                  {viewingTemplate.requirePrime && (
                    <Badge variant="secondary">Premium</Badge>
                  )}
                  {viewingTemplate.noActiveSessionWithSeller && (
                    <Badge variant="secondary">Pas de session active</Badge>
                  )}
                </div>
              )}

              {viewingTemplate.requiredCountries && viewingTemplate.requiredCountries.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Pays acceptes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingTemplate.requiredCountries.map((country, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{country}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {viewingTemplate.requiredLocations && viewingTemplate.requiredLocations.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Localisations acceptees:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingTemplate.requiredLocations.map((loc, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{loc}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {viewingTemplate.excludedLocations && viewingTemplate.excludedLocations.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Localisations exclues:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingTemplate.excludedLocations.map((loc, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">{loc}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              if (viewingTemplate) handleEditClick(viewingTemplate)
            }}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-xl">Supprimer le template</DialogTitle>
                <DialogDescription>
                  Cette action est irreversible
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Etes-vous sur de vouloir supprimer le template{' '}
              <span className="font-semibold text-foreground">&quot;{deletingTemplate?.name}&quot;</span> ?
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
