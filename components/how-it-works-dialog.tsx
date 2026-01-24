"use client"

import * as React from "react"
import { useState } from "react"
import {
  Package,
  Megaphone,
  Users,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  Lightbulb,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const steps = [
  {
    id: 1,
    title: "Creer un produit",
    icon: Package,
    trustType: "trust" as const,
    trustMessage: "Vos donnees produit sont securisees et ne sont jamais partagees avec des tiers.",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          La premiere etape consiste a enregistrer votre produit sur SuperTry.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">1</div>
            <div>
              <p className="font-medium">Informations du produit</p>
              <p className="text-sm text-muted-foreground">Renseignez le nom, la description et le prix de votre produit.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">2</div>
            <div>
              <p className="font-medium">Photo du produit</p>
              <p className="text-sm text-muted-foreground">Ajoutez une photo claire de votre produit pour que les testeurs puissent l'identifier facilement.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">3</div>
            <div>
              <p className="font-medium">Categorie</p>
              <p className="text-sm text-muted-foreground">Selectionnez la categorie correspondante pour un meilleur ciblage des testeurs.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Creer une campagne",
    icon: Megaphone,
    trustType: "compliant" as const,
    trustMessage: "Conformite Amazon - nos procedures respectent les guidelines des marketplaces.",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Creez votre campagne de test en configurant les parametres selon vos besoins.
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border p-3 space-y-2">
            <p className="font-medium">Deux modes de campagne</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li><span className="font-medium text-foreground">Mode Simple</span> : Le testeur achete et laisse un avis selon ses impressions.</li>
              <li><span className="font-medium text-foreground">Mode Procedure</span> : Vous definissez des etapes precises a suivre par le testeur.</li>
            </ul>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <p className="font-medium">Mot cle</p>
            <p className="text-sm text-muted-foreground">Le mot cle permet au testeur de trouver votre produit sur la marketplace.</p>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <p className="font-medium">Mode Procedure</p>
            <p className="text-sm text-muted-foreground">Si vous choisissez ce mode, vous devrez creer une procedure detaillee et definir des criteres d'evaluation (ou les ignorer).</p>
          </div>
          <div className="rounded-lg border p-3 space-y-2 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <p className="font-medium text-amber-800 dark:text-amber-200">Distribution et dates d'achat</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">Les dates d'achat que vous indiquez correspondent aux dates auxquelles le testeur verra les consignes de la procedure et les informations du test.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Activation et testeurs",
    icon: Users,
    trustType: "trust" as const,
    trustMessage: "Testeurs verifies avec profils authentiques et historique d'achats reel.",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Une fois votre campagne activee, SuperTry recherche les meilleurs testeurs pour votre produit.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">1</div>
            <div>
              <p className="font-medium">Recherche intelligente</p>
              <p className="text-sm text-muted-foreground">Notre algorithme analyse les profils des testeurs pour trouver ceux qui correspondent le mieux a votre produit et votre categorie.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">2</div>
            <div>
              <p className="font-medium">Candidatures</p>
              <p className="text-sm text-muted-foreground">Les testeurs interesses postulent a votre campagne. Vous recevez leurs profils et historiques.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">3</div>
            <div>
              <p className="font-medium">Validation</p>
              <p className="text-sm text-muted-foreground">Vous validez manuellement chaque testeur, sauf si vous avez active l'option <span className="font-medium">validation automatique</span>.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Chat et echanges",
    icon: MessageCircle,
    trustType: "compliant" as const,
    trustMessage: "Echanges traces pour votre protection et celle des testeurs.",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Des que vous validez un testeur, un espace de discussion s'ouvre automatiquement.
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border p-3 space-y-2">
            <p className="font-medium">Communication simplifiee</p>
            <p className="text-sm text-muted-foreground">Echangez directement avec le testeur pour repondre a ses questions, envoyer des instructions supplementaires ou suivre l'avancement du test.</p>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <p className="font-medium">Notifications en temps reel</p>
            <p className="text-sm text-muted-foreground">Recevez des alertes lorsque le testeur vous envoie un message ou met a jour le statut de son test.</p>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <p className="font-medium">Historique complet</p>
            <p className="text-sm text-muted-foreground">Tous les echanges sont conserves et accessibles a tout moment pour reference.</p>
          </div>
        </div>
      </div>
    ),
  },
]

function TrustBadge({ type, message }: { type: "trust" | "compliant"; message: string }) {
  const isTrust = type === "trust"

  return (
    <div className={`flex items-start gap-3 rounded-lg p-3 ${
      isTrust
        ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
        : "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
    }`}>
      {isTrust ? (
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <BadgeCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      )}
      <div>
        <p className={`text-sm font-medium ${
          isTrust
            ? "text-emerald-800 dark:text-emerald-200"
            : "text-blue-800 dark:text-blue-200"
        }`}>
          {isTrust ? "Trust" : "Compliant"}
        </p>
        <p className={`text-sm ${
          isTrust
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-blue-700 dark:text-blue-300"
        }`}>
          {message}
        </p>
      </div>
    </div>
  )
}

export function HowItWorksDialog() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const step = steps[currentStep]
  const StepIcon = step.icon

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setCurrentStep(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DialogTrigger asChild>
            <SidebarMenuButton
              tooltip="How it works"
              className="bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90 hover:text-white"
            >
              <Lightbulb className="h-4 w-4" />
              <span>How it works</span>
            </SidebarMenuButton>
          </DialogTrigger>
        </SidebarMenuItem>
      </SidebarMenu>

      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-4 w-4 text-primary" />
            </div>
            {step.title}
          </DialogTitle>
          <DialogDescription>
            Etape {currentStep + 1} sur {steps.length}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 py-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {step.content}
          <TrustBadge type={step.trustType} message={step.trustMessage} />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Precedent
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button onClick={() => handleOpenChange(false)}>
              Terminer
            </Button>
          ) : (
            <Button onClick={goNext} className="gap-1">
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
