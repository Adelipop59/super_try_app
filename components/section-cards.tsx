"use client"

import { TrendingUpIcon, WalletIcon, PackageIcon, TestTubeIcon, CheckCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardStats } from "@/lib/api"

interface SectionCardsProps {
  stats: DashboardStats | null
  userRole?: 'USER' | 'PRO' | 'ADMIN'
  loading?: boolean
}

export function SectionCards({ stats, userRole = 'USER', loading = false }: SectionCardsProps) {
  if (loading) {
    return (
      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader className="relative">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded mt-2" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1">
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // For PRO users, show campaigns and products
  if (userRole === 'PRO' || userRole === 'ADMIN') {
    return (
      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Solde</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats?.balance?.toFixed(2) || '0.00'} €
            </CardTitle>
            <div className="absolute right-4 top-4">
              <WalletIcon className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Votre portefeuille
            </div>
            <div className="text-muted-foreground">
              Disponible pour retrait
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Campagnes</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats?.totalCampaigns || 0}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {stats?.activeCampaigns || 0} actives
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Total de vos campagnes
            </div>
            <div className="text-muted-foreground">
              {stats?.activeCampaigns || 0} en cours
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Produits</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats?.totalProducts || 0}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <PackageIcon className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Produits enregistrés
            </div>
            <div className="text-muted-foreground">
              Prêts pour vos campagnes
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Sessions</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats?.totalSessions || 0}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {stats?.completedSessions || 0} terminées
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Sessions de test
            </div>
            <div className="text-muted-foreground">
              {stats?.activeSessions || 0} en cours, {stats?.pendingSessions || 0} en attente
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // For USER (tester), show their sessions and balance
  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Solde</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats?.balance?.toFixed(2) || '0.00'} €
          </CardTitle>
          <div className="absolute right-4 top-4">
            <WalletIcon className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Vos gains
          </div>
          <div className="text-muted-foreground">
            Disponible pour retrait
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Sessions en attente</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats?.pendingSessions || 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <TestTubeIcon className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Candidatures en attente
          </div>
          <div className="text-muted-foreground">
            En attente d'acceptation
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Sessions actives</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats?.activeSessions || 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              En cours
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tests en cours <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            A compléter
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Sessions terminées</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats?.completedSessions || 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <CheckCircleIcon className="size-5 text-green-500" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tests complétés
          </div>
          <div className="text-muted-foreground">
            Total: {stats?.totalSessions || 0} sessions
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
