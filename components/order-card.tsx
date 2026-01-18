"use client"

import { useState } from "react"
import { ChatOrder } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  VideoIcon,
  ImageIcon,
  CoinsIcon,
  ClockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon,
  PackageIcon,
} from "lucide-react"

interface OrderCardProps {
  order: ChatOrder
  isPro: boolean
  onAccept?: (orderId: string) => void
  onReject?: (orderId: string) => void
  onDeliver?: (orderId: string) => void
  onValidate?: (orderId: string) => void
  onDispute?: (orderId: string) => void
}

const ORDER_TYPE_CONFIG = {
  UGC_REQUEST: { label: "Vidéo UGC", icon: VideoIcon, color: "bg-purple-100 text-purple-800" },
  PHOTO_REQUEST: { label: "Photos", icon: ImageIcon, color: "bg-blue-100 text-blue-800" },
  TIP: { label: "Pourboire", icon: CoinsIcon, color: "bg-green-100 text-green-800" },
}

const ORDER_STATUS_CONFIG = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
  ACCEPTED: { label: "Acceptée", color: "bg-blue-100 text-blue-800", icon: CheckCircle2Icon },
  DELIVERED: { label: "Livrée", color: "bg-purple-100 text-purple-800", icon: PackageIcon },
  COMPLETED: { label: "Terminée", color: "bg-green-100 text-green-800", icon: CheckCircle2Icon },
  REJECTED: { label: "Refusée", color: "bg-red-100 text-red-800", icon: XCircleIcon },
  CANCELLED: { label: "Annulée", color: "bg-gray-100 text-gray-800", icon: XCircleIcon },
  DISPUTED: { label: "Litige", color: "bg-orange-100 text-orange-800", icon: AlertCircleIcon },
  REFUNDED: { label: "Remboursée", color: "bg-gray-100 text-gray-800", icon: XCircleIcon },
}

export function OrderCard({
  order,
  isPro,
  onAccept,
  onReject,
  onDeliver,
  onValidate,
  onDispute,
}: OrderCardProps) {
  const typeConfig = ORDER_TYPE_CONFIG[order.type]
  const statusConfig = ORDER_STATUS_CONFIG[order.status]
  const TypeIcon = typeConfig.icon
  const StatusIcon = statusConfig.icon

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDeadline = (dateString: string) => {
    const deadline = new Date(dateString)
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 0) return { text: "Dépassée", color: "text-red-600 font-semibold" }
    if (hours < 24) return { text: `Dans ${hours}h`, color: "text-orange-600 font-semibold" }
    const days = Math.floor(hours / 24)
    return { text: `Dans ${days}j`, color: "text-muted-foreground" }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${typeConfig.color}`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{typeConfig.label}</CardTitle>
              <CardDescription className="text-xs">
                {formatDate(order.createdAt)}
              </CardDescription>
            </div>
          </div>
          <Badge className={statusConfig.color} variant="secondary">
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Montant */}
        <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">Montant</span>
          <span className="text-lg font-bold text-primary">{order.amount}€</span>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Description</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.description}</p>
        </div>

        {/* Date limite */}
        {order.deliveryDeadline && order.status !== "COMPLETED" && order.status !== "REJECTED" && order.status !== "CANCELLED" && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Date limite</span>
            <span className={formatDeadline(order.deliveryDeadline).color}>
              {formatDeadline(order.deliveryDeadline).text}
            </span>
          </div>
        )}

        {/* Raison du rejet */}
        {order.rejectionReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-medium text-red-800 mb-1">Raison du rejet</p>
            <p className="text-sm text-red-700">{order.rejectionReason}</p>
          </div>
        )}

        {/* Preuves de livraison */}
        {order.deliveryProof && order.deliveryProof.files && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Fichiers livrés</p>
            <div className="space-y-1">
              {order.deliveryProof.files.map((file: any, index: number) => (
                <a
                  key={index}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  <PackageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{file.filename}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </a>
              ))}
            </div>
            {order.deliveryProof.notes && (
              <p className="text-sm text-muted-foreground italic">{order.deliveryProof.notes}</p>
            )}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex gap-2 pt-3">
        {/* Actions pour le testeur (USER) */}
        {!isPro && order.status === "PENDING" && (
          <>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onAccept?.(order.id)}
            >
              <CheckCircle2Icon className="h-4 w-4 mr-1" />
              Accepter
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => onReject?.(order.id)}
            >
              <XCircleIcon className="h-4 w-4 mr-1" />
              Refuser
            </Button>
          </>
        )}

        {!isPro && order.status === "ACCEPTED" && order.type !== "TIP" && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onDeliver?.(order.id)}
          >
            <PackageIcon className="h-4 w-4 mr-1" />
            Livrer
          </Button>
        )}

        {/* Actions pour le PRO */}
        {isPro && order.status === "PENDING" && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onReject?.(order.id)}
          >
            <XCircleIcon className="h-4 w-4 mr-1" />
            Annuler
          </Button>
        )}

        {isPro && order.status === "DELIVERED" && (
          <>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onValidate?.(order.id)}
            >
              <CheckCircle2Icon className="h-4 w-4 mr-1" />
              Valider
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDispute?.(order.id)}
            >
              <AlertCircleIcon className="h-4 w-4 mr-1" />
              Litige
            </Button>
          </>
        )}

        {/* Info pour TIP accepté */}
        {order.type === "TIP" && order.status === "ACCEPTED" && (
          <div className="flex-1 text-center py-2">
            <p className="text-sm text-green-600 font-medium">
              Pourboire versé avec succès !
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
