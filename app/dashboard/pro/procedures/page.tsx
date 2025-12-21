"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api, ProcedureTemplate, CreateProcedureTemplateData, StepType } from "@/lib/api"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon, PencilIcon, Trash2Icon, AlertTriangleIcon, ListChecksIcon, XIcon, GripVerticalIcon } from "lucide-react"
import { toast } from "sonner"
import { ProceduresDataTable } from "@/components/procedures-data-table"

interface StepFormData {
  title: string
  description: string
  type: StepType
  order: number
  isRequired: boolean
  checklistItems: string[]
}

export default function ProceduresPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<ProcedureTemplate[]>([])
  const [loading, setLoading] = useState(true)

  // Create state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    title: '',
    description: '',
  })
  const [createSteps, setCreateSteps] = useState<StepFormData[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // Edit state
  const [editingTemplate, setEditingTemplate] = useState<ProcedureTemplate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    title: '',
    description: '',
  })
  const [editSteps, setEditSteps] = useState<StepFormData[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [deletingTemplate, setDeletingTemplate] = useState<ProcedureTemplate | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const STEP_TYPES: { value: StepType; label: string }[] = [
    { value: 'TEXT', label: 'Texte' },
    { value: 'PHOTO', label: 'Photo' },
    { value: 'VIDEO', label: 'Vidéo' },
    { value: 'CHECKLIST', label: 'Checklist' },
    { value: 'RATING', label: 'Note' },
    { value: 'PRICE_VALIDATION', label: 'Validation prix' },
  ]

  useEffect(() => {
    fetchTemplates()
  }, [user])

  const fetchTemplates = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await api.getProcedureTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSave = async () => {
    if (!createForm.name.trim()) {
      toast.error('Le nom du template est requis')
      return
    }
    if (!createForm.title.trim()) {
      toast.error('Le titre est requis')
      return
    }
    if (!createForm.description.trim()) {
      toast.error('La description est requise')
      return
    }

    try {
      setIsCreating(true)

      const data: CreateProcedureTemplateData = {
        name: createForm.name,
        title: createForm.title,
        description: createForm.description,
        steps: createSteps.length > 0 ? createSteps.map(s => ({
          title: s.title,
          description: s.description || undefined,
          type: s.type,
          order: s.order,
          isRequired: s.isRequired,
          checklistItems: s.type === 'CHECKLIST' ? s.checklistItems : undefined,
        })) : undefined,
      }

      await api.createProcedureTemplate(data)

      toast.success('Template de procédure créé avec succès')
      setIsCreateDialogOpen(false)
      setCreateForm({ name: '', title: '', description: '' })
      setCreateSteps([])
      fetchTemplates()
    } catch (error) {
      console.error('Failed to create template:', error)
      toast.error('Erreur lors de la création du template')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditClick = (template: ProcedureTemplate) => {
    setEditingTemplate(template)
    setEditForm({
      name: template.name,
      title: template.title,
      description: template.description,
    })
    setEditSteps(template.steps.map(s => ({
      title: s.title,
      description: s.description || '',
      type: s.type,
      order: s.order,
      isRequired: s.isRequired,
      checklistItems: s.checklistItems || [],
    })))
    setIsEditDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingTemplate) return

    try {
      setIsSaving(true)

      await api.updateProcedureTemplate(editingTemplate.id, {
        name: editForm.name,
        title: editForm.title,
        description: editForm.description,
        steps: editSteps.map(s => ({
          title: s.title,
          description: s.description || undefined,
          type: s.type,
          order: s.order,
          isRequired: s.isRequired,
          checklistItems: s.type === 'CHECKLIST' ? s.checklistItems : undefined,
        })),
      })

      toast.success('Template mis à jour avec succès')
      setIsEditDialogOpen(false)
      setEditingTemplate(null)
      fetchTemplates()
    } catch (error) {
      console.error('Failed to update template:', error)
      toast.error('Erreur lors de la mise à jour du template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (template: ProcedureTemplate) => {
    setDeletingTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTemplate) return

    try {
      setIsDeleting(true)
      await api.deleteProcedureTemplate(deletingTemplate.id)

      toast.success('Template supprimé avec succès')
      setIsDeleteDialogOpen(false)
      setDeletingTemplate(null)
      fetchTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Erreur lors de la suppression du template')
    } finally {
      setIsDeleting(false)
    }
  }

  const addStep = (steps: StepFormData[], setSteps: (s: StepFormData[]) => void) => {
    const newOrder = steps.length > 0 ? Math.max(...steps.map(s => s.order)) + 1 : 1
    setSteps([...steps, {
      title: '',
      description: '',
      type: 'TEXT',
      order: newOrder,
      isRequired: true,
      checklistItems: [],
    }])
  }

  const removeStep = (index: number, steps: StepFormData[], setSteps: (s: StepFormData[]) => void) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, field: keyof StepFormData, value: any, steps: StepFormData[], setSteps: (s: StepFormData[]) => void) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const renderStepsForm = (steps: StepFormData[], setSteps: (s: StepFormData[]) => void) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Étapes de la procédure</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addStep(steps, setSteps)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Ajouter une étape
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground bg-muted/50 rounded-md">
          Aucune étape. Ajoutez des étapes pour définir le déroulement de la procédure.
        </div>
      ) : (
        <div className="space-y-3 max-h-[200px] overflow-y-auto">
          {steps.map((step, index) => (
            <div key={index} className="p-3 bg-muted/50 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Étape {step.order}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeStep(index, steps, setSteps)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3">
                <Input
                  placeholder="Titre de l'étape"
                  value={step.title}
                  onChange={(e) => updateStep(index, 'title', e.target.value, steps, setSteps)}
                  className="h-8 text-sm"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={step.type}
                    onValueChange={(value: StepType) => updateStep(index, 'type', value, steps, setSteps)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STEP_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${index}`}
                      checked={step.isRequired}
                      onCheckedChange={(checked) => updateStep(index, 'isRequired', checked, steps, setSteps)}
                    />
                    <Label htmlFor={`required-${index}`} className="text-xs cursor-pointer">
                      Obligatoire
                    </Label>
                  </div>
                </div>

                <Textarea
                  placeholder="Description (optionnel)"
                  value={step.description}
                  onChange={(e) => updateStep(index, 'description', e.target.value, steps, setSteps)}
                  className="min-h-[60px] text-sm resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

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
                  <h2 className="text-2xl font-bold tracking-tight">Templates de procédures</h2>
                  <p className="text-muted-foreground">
                    Créez des templates réutilisables pour vos campagnes
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : templates.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        Vous n'avez pas encore de template de procédure
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Créer votre premier template
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <ProceduresDataTable
                    data={templates}
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

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ListChecksIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Nouveau template</DialogTitle>
                <DialogDescription>
                  Créez un template de procédure réutilisable
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name" className="text-sm font-medium">
                Nom du template <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-name"
                placeholder="Ex: Procédure standard"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-title" className="text-sm font-medium">
                Titre de la procédure <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-title"
                placeholder="Ex: Test de déballage du produit"
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
                placeholder="Décrivez en détail la procédure..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>

            {renderStepsForm(createSteps, setCreateSteps)}
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
                  Créer le template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PencilIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Modifier le template</DialogTitle>
                <DialogDescription>
                  Modifiez les informations du template
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Nom du template
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-title" className="text-sm font-medium">
                Titre de la procédure
              </Label>
              <Input
                id="edit-title"
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
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>

            {renderStepsForm(editSteps, setEditSteps)}
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
                <DialogTitle className="text-xl">Supprimer le template</DialogTitle>
                <DialogDescription>
                  Cette action est irréversible
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer le template{' '}
              <span className="font-semibold text-foreground">"{deletingTemplate?.name}"</span> ?
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
