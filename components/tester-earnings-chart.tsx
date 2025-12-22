"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUpIcon } from "lucide-react"

interface TesterEarningsChartProps {
  loading: boolean
}

export function TesterEarningsChart({ loading }: TesterEarningsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5 text-green-600" />
          Mes gains (30 derniers jours)
        </CardTitle>
        <CardDescription>
          Évolution de vos gains au cours des 30 derniers jours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          <div className="text-center">
            <TrendingUpIcon className="mx-auto h-12 w-12 opacity-20" />
            <p className="mt-4 text-sm">Graphique des gains à venir</p>
            <p className="mt-1 text-xs">Complétez des sessions pour voir vos statistiques</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
