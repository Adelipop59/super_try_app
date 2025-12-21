"use client"

import React, { useEffect, useId, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useOutsideClick } from "@/hooks/use-outside-click"
import { Campaign, Distribution, Procedure } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PackageIcon,
  FilterIcon,
  ClipboardListIcon,
  XIcon,
  CalendarIcon,
  UsersIcon,
} from "lucide-react"

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="default" className="bg-green-500">Active</Badge>
    case 'DRAFT':
      return <Badge variant="secondary">Brouillon</Badge>
    case 'PENDING_PAYMENT':
      return <Badge variant="outline" className="border-orange-500 text-orange-600">En attente de paiement</Badge>
    case 'PAUSED':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">En pause</Badge>
    case 'COMPLETED':
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Terminée</Badge>
    case 'CANCELLED':
      return <Badge variant="outline" className="border-red-500 text-red-600">Annulée</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

interface CampaignExpandableCardProps {
  campaign: Campaign | null
  distributions: Distribution[]
  procedures: Procedure[]
  onClose: () => void
  layoutId: string
}

export function CampaignExpandableCard({
  campaign,
  distributions,
  procedures,
  onClose,
  layoutId,
}: CampaignExpandableCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (campaign) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [campaign, onClose])

  useOutsideClick(ref, () => onClose())

  if (!campaign) return null

  return (
    <>
      <AnimatePresence>
        {campaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {campaign ? (
          <div className="fixed inset-0 grid place-items-center z-50">
            <motion.button
              key={`button-${campaign.id}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white dark:bg-neutral-900 rounded-full h-8 w-8 z-50"
              onClick={onClose}
            >
              <XIcon className="h-4 w-4" />
            </motion.button>
            <motion.div
              layoutId={`card-${layoutId}`}
              ref={ref}
              className="w-full max-w-[700px] h-full md:h-[90vh] md:max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <div className="flex justify-between items-start p-6 border-b shrink-0">
                <div className="flex-1">
                  <motion.h3
                    layoutId={`title-${layoutId}`}
                    className="font-bold text-xl text-neutral-700 dark:text-neutral-200 mb-2"
                  >
                    {campaign.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${layoutId}`}
                    className="text-neutral-600 dark:text-neutral-400 text-sm mb-4"
                  >
                    {campaign.description || "Aucune description"}
                  </motion.p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {getStatusBadge(campaign.status)}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <UsersIcon className="h-4 w-4" />
                      <span>{campaign.usedSlots}/{campaign.totalSlots} slots</span>
                    </div>
                    {campaign.startDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {new Date(campaign.startDate).toLocaleDateString('fr-FR')}
                          {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString('fr-FR')}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  layoutId={`close-${layoutId}`}
                  onClick={onClose}
                  className="hidden lg:flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-full h-8 w-8 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="pt-4 relative px-6 pb-6 flex-1 overflow-y-auto min-h-0">
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-neutral-600 text-xs md:text-sm lg:text-base flex flex-col items-start gap-6 dark:text-neutral-400"
                >
                  {/* Products */}
                  <div className="w-full">
                    <h4 className="text-sm font-semibold mb-3">Produits ({campaign.products?.length || 0})</h4>
                    {campaign.products && campaign.products.length > 0 ? (
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produit</TableHead>
                              <TableHead className="w-[60px]">Qté</TableHead>
                              <TableHead className="w-[80px]">Prix</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {campaign.products.map((cp, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <PackageIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{cp.product?.name || 'Produit'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{cp.quantity}</TableCell>
                                <TableCell>
                                  {cp.expectedPrice ? `${cp.expectedPrice}€` : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun produit associé</p>
                    )}
                  </div>

                  {/* Distributions */}
                  <div className="w-full">
                    <h4 className="text-sm font-semibold mb-3">Distributions ({distributions.length})</h4>
                    {distributions.length > 0 ? (
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Jour/Date</TableHead>
                              <TableHead className="w-[60px]">Max</TableHead>
                              <TableHead className="w-[60px]">Actif</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {distributions.map((dist) => (
                              <TableRow key={dist.id}>
                                <TableCell>
                                  <Badge variant="outline">
                                    {dist.type === 'RECURRING' ? 'Récurrent' : 'Date'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {dist.type === 'RECURRING'
                                    ? DAYS_OF_WEEK.find(d => d.value === dist.dayOfWeek)?.label || '-'
                                    : dist.specificDate ? new Date(dist.specificDate).toLocaleDateString('fr-FR') : '-'
                                  }
                                </TableCell>
                                <TableCell>{dist.maxUnits}</TableCell>
                                <TableCell>
                                  <Badge variant={dist.isActive ? "default" : "secondary"}>
                                    {dist.isActive ? 'Oui' : 'Non'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune distribution configurée</p>
                    )}
                  </div>

                  {/* Criteria */}
                  {campaign.criteria && (
                    <div className="w-full">
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <FilterIcon className="h-4 w-4" />
                        Critères d&apos;éligibilité
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {campaign.criteria.minAge && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Age min:</span>
                            <span className="font-medium">{campaign.criteria.minAge} ans</span>
                          </div>
                        )}
                        {campaign.criteria.maxAge && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Age max:</span>
                            <span className="font-medium">{campaign.criteria.maxAge} ans</span>
                          </div>
                        )}
                        {campaign.criteria.minRating && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Note min:</span>
                            <span className="font-medium">{campaign.criteria.minRating}/5</span>
                          </div>
                        )}
                        {campaign.criteria.maxRating && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Note max:</span>
                            <span className="font-medium">{campaign.criteria.maxRating}/5</span>
                          </div>
                        )}
                        {campaign.criteria.minCompletedSessions && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tests min:</span>
                            <span className="font-medium">{campaign.criteria.minCompletedSessions}</span>
                          </div>
                        )}
                        {campaign.criteria.requiredGender && campaign.criteria.requiredGender !== 'ALL' && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Genre:</span>
                            <span className="font-medium">{campaign.criteria.requiredGender === 'M' ? 'Homme' : 'Femme'}</span>
                          </div>
                        )}
                        {campaign.criteria.minAccountAge && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ancienneté:</span>
                            <span className="font-medium">{campaign.criteria.minAccountAge} jours</span>
                          </div>
                        )}
                        {campaign.criteria.minCompletionRate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taux completion:</span>
                            <span className="font-medium">{campaign.criteria.minCompletionRate}%</span>
                          </div>
                        )}
                        {campaign.criteria.maxCancellationRate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taux annulation max:</span>
                            <span className="font-medium">{campaign.criteria.maxCancellationRate}%</span>
                          </div>
                        )}
                        {campaign.criteria.lastActiveWithinDays && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Actif dans:</span>
                            <span className="font-medium">{campaign.criteria.lastActiveWithinDays} jours</span>
                          </div>
                        )}
                        {campaign.criteria.maxSessionsPerWeek && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max/semaine:</span>
                            <span className="font-medium">{campaign.criteria.maxSessionsPerWeek}</span>
                          </div>
                        )}
                        {campaign.criteria.maxSessionsPerMonth && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max/mois:</span>
                            <span className="font-medium">{campaign.criteria.maxSessionsPerMonth}</span>
                          </div>
                        )}
                      </div>
                      {(campaign.criteria.requireVerified || campaign.criteria.requirePrime || campaign.criteria.noActiveSessionWithSeller) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {campaign.criteria.requireVerified && (
                            <Badge variant="secondary">Compte vérifié</Badge>
                          )}
                          {campaign.criteria.requirePrime && (
                            <Badge variant="secondary">Premium</Badge>
                          )}
                          {campaign.criteria.noActiveSessionWithSeller && (
                            <Badge variant="secondary">Pas de session active</Badge>
                          )}
                        </div>
                      )}
                      {campaign.criteria.requiredCountries && campaign.criteria.requiredCountries.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-muted-foreground">Pays acceptés:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.criteria.requiredCountries.map((country, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{country}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {campaign.criteria.requiredLocations && campaign.criteria.requiredLocations.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-muted-foreground">Localisations acceptées:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.criteria.requiredLocations.map((loc, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{loc}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {campaign.criteria.excludedLocations && campaign.criteria.excludedLocations.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-muted-foreground">Localisations exclues:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.criteria.excludedLocations.map((loc, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">{loc}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Procedures */}
                  <div className="w-full">
                    <h4 className="text-sm font-semibold mb-3">Procédures ({procedures.length})</h4>
                    {procedures.length > 0 ? (
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Titre</TableHead>
                              <TableHead className="w-[60px]">Ordre</TableHead>
                              <TableHead className="w-[60px]">Requis</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {procedures.map((proc) => (
                              <TableRow key={proc.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="font-medium">{proc.title}</div>
                                      {proc.description && (
                                        <div className="text-xs text-muted-foreground line-clamp-1">{proc.description}</div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{proc.order}</TableCell>
                                <TableCell>
                                  <Badge variant={proc.isRequired ? "default" : "outline"}>
                                    {proc.isRequired ? 'Oui' : 'Non'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune procédure associée</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

