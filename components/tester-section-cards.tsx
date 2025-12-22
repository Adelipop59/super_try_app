"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2Icon, ClockIcon, PlayCircleIcon, WalletIcon } from "lucide-react"
import { DashboardStats } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface TesterSectionCardsProps {
  stats: DashboardStats | null
  loading: boolean
}

export function TesterSectionCards({ stats, loading }: TesterSectionCardsProps) {
  const cards = [
    {
      title: "Sessions en cours",
      value: stats?.activeSessions ?? 0,
      icon: PlayCircleIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Sessions terminées",
      value: stats?.completedSessions ?? 0,
      icon: CheckCircle2Icon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Sessions en attente",
      value: stats?.pendingSessions ?? 0,
      icon: ClockIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Mon Wallet",
      value: `${((stats?.balance ?? 0) / 100).toFixed(2)} €`,
      icon: WalletIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {cards.map((card) => (
        <Card key={card.title} className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
