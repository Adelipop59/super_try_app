import { Badge } from "@/components/ui/badge"
import { SessionStatus } from "@/lib/api"
import {
  ClockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  PackageIcon,
  ShoppingCartIcon,
  PlayCircleIcon,
  FileTextIcon,
  BanIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  LucideIcon,
} from "lucide-react"

interface StatusConfig {
  label: string
  icon: LucideIcon
  className: string
}

const statusConfig: Record<SessionStatus, StatusConfig> = {
  PENDING: {
    label: "En attente",
    icon: ClockIcon,
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  ACCEPTED: {
    label: "Acceptée",
    icon: CheckCircle2Icon,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REJECTED: {
    label: "Rejetée",
    icon: XCircleIcon,
    className: "bg-red-100 text-red-800 border-red-200",
  },
  IN_PROGRESS: {
    label: "En cours",
    icon: PlayCircleIcon,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  PROCEDURES_COMPLETED: {
    label: "Procédures terminées",
    icon: CheckCircle2Icon,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  PRICE_VALIDATED: {
    label: "Prix validé",
    icon: PackageIcon,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  PURCHASE_SUBMITTED: {
    label: "Achat soumis",
    icon: ShoppingCartIcon,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  PURCHASE_VALIDATED: {
    label: "Achat validé",
    icon: CheckCircle2Icon,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  SUBMITTED: {
    label: "Test soumis",
    icon: FileTextIcon,
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  UGC_REQUESTED: {
    label: "Contenu demandé",
    icon: AlertCircleIcon,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  UGC_SUBMITTED: {
    label: "Contenu soumis",
    icon: FileTextIcon,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  PENDING_CLOSURE: {
    label: "En attente de clôture",
    icon: ClockIcon,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  COMPLETED: {
    label: "Terminée",
    icon: CheckCircle2Icon,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELLED: {
    label: "Annulée",
    icon: BanIcon,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  DISPUTED: {
    label: "Litige",
    icon: AlertTriangleIcon,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
}

interface StatusBadgeProps {
  status: SessionStatus
  showIcon?: boolean
  size?: "sm" | "default" | "lg"
}

export function StatusBadge({ status, showIcon = true, size = "default" }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} font-medium border`}>
      {showIcon && <Icon className={`${iconSizes[size]} ${showIcon ? 'mr-1.5' : ''}`} />}
      {config.label}
    </Badge>
  )
}

export { statusConfig }
