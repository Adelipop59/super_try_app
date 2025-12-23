"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, Transaction } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrophyIcon, TrendingUpIcon, CoinsIcon, CalendarIcon } from "lucide-react"

export default function EarningsPage() {
  const { user } = useAuth()
  const { handleErrorWithRetry } = useErrorHandler()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEarnings, setTotalEarnings] = useState(0)

  const fetchEarnings = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await api.getTransactions(50)
      setTransactions(data.transactions)

      // Calculate total earnings (only CREDIT transactions)
      const total = data.transactions
        .filter(t => t.type === 'CREDIT' || t.type === 'SESSION_REWARD')
        .reduce((sum, t) => sum + t.amount, 0)
      setTotalEarnings(total)
    } catch (error) {
      handleErrorWithRetry(
        error,
        fetchEarnings,
        'Impossible de charger vos gains.'
      )
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [user])

  const stats = {
    total: totalEarnings,
    thisMonth: transactions
      .filter(t => {
        const date = new Date(t.createdAt)
        const now = new Date()
        return date.getMonth() === now.getMonth() &&
               date.getFullYear() === now.getFullYear() &&
               (t.type === 'CREDIT' || t.type === 'SESSION_REWARD')
      })
      .reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.filter(t => t.type === 'CREDIT' || t.type === 'SESSION_REWARD').length,
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <TrophyIcon className="h-8 w-8 text-yellow-600" />
          Mes Gains
        </h1>
        <p className="text-muted-foreground mt-2">
          Suivez l&apos;évolution de vos revenus et récompenses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 px-4 md:grid-cols-3 lg:px-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des gains</CardTitle>
            <CoinsIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{(stats.total / 100).toFixed(2)} €</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois-ci</CardTitle>
            <CalendarIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{(stats.thisMonth / 100).toFixed(2)} €</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de transactions</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.transactionCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart Placeholder */}
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-green-600" />
            Évolution des gains
          </CardTitle>
          <CardDescription>
            Graphique de vos gains sur les 30 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUpIcon className="mx-auto h-12 w-12 opacity-20" />
              <p className="mt-4 text-sm">Graphique à venir</p>
              <p className="mt-1 text-xs">Continuez à compléter des sessions pour voir vos statistiques</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle>Historique des transactions</CardTitle>
          <CardDescription>
            Vos {transactions.length} dernières transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <CoinsIcon className="mx-auto h-12 w-12 opacity-20" />
                <p className="mt-4 text-sm">Aucune transaction pour le moment</p>
                <p className="mt-1 text-xs">
                  Vos gains apparaîtront ici une fois que vous aurez complété des sessions
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{transaction.description || "Transaction"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={transaction.type === 'CREDIT' || transaction.type === 'SESSION_REWARD' ? "default" : "secondary"}
                      className={transaction.type === 'CREDIT' || transaction.type === 'SESSION_REWARD' ? "bg-green-100 text-green-800" : ""}
                    >
                      {transaction.type === 'CREDIT' || transaction.type === 'SESSION_REWARD' ? "+" : "-"}
                      {(transaction.amount / 100).toFixed(2)} €
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transaction.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
