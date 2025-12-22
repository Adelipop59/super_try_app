"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, WalletBalance, Transaction } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { WalletIcon, ArrowUpIcon, ArrowDownIcon, HistoryIcon, CoinsIcon } from "lucide-react"

export default function WalletPage() {
  const { user } = useAuth()
  const { handleErrorWithRetry } = useErrorHandler()
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWalletData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [walletData, transactionsData] = await Promise.all([
        api.getWalletBalance(),
        api.getTransactions(20)
      ])
      setBalance(walletData)
      setTransactions(transactionsData.transactions)
    } catch (error) {
      handleErrorWithRetry(
        error,
        fetchWalletData,
        'Impossible de charger votre wallet.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [user])

  const recentCredits = transactions.filter(t => t.type === 'CREDIT' || t.type === 'SESSION_REWARD').slice(0, 5)
  const recentDebits = transactions.filter(t => t.type === 'DEBIT' || t.type === 'WITHDRAWAL').slice(0, 5)

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <WalletIcon className="h-8 w-8 text-purple-600" />
          Mon Wallet
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre solde et vos transactions
        </p>
      </div>

      {/* Balance Card */}
      <Card className="mx-4 lg:mx-6 bg-gradient-to-br from-purple-500 to-purple-700 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CoinsIcon className="h-5 w-5" />
            Solde disponible
          </CardTitle>
          <CardDescription className="text-purple-100">
            Votre solde actuel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-12 w-40 bg-purple-400/50" />
          ) : (
            <div className="text-4xl font-bold">
              {((balance?.balance || 0) / 100).toFixed(2)} {balance?.currency || 'EUR'}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" size="sm" disabled>
              <ArrowUpIcon className="mr-2 h-4 w-4" />
              Retirer
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Historique complet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 px-4 md:grid-cols-2 lg:px-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Derniers crédits</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{(recentCredits.reduce((sum, t) => sum + t.amount, 0) / 100).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentCredits.length} transaction(s) récente(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Derniers débits</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{(recentDebits.reduce((sum, t) => sum + t.amount, 0) / 100).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentDebits.length} transaction(s) récente(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HistoryIcon className="h-5 w-5" />
                Transactions récentes
              </CardTitle>
              <CardDescription className="mt-1">
                Les 20 dernières transactions sur votre wallet
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
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
                <WalletIcon className="mx-auto h-12 w-12 opacity-20" />
                <p className="mt-4 text-sm">Aucune transaction pour le moment</p>
                <p className="mt-1 text-xs">
                  Vos transactions apparaîtront ici
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isCredit = transaction.type === 'CREDIT' || transaction.type === 'SESSION_REWARD'

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isCredit ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{transaction.description || "Transaction"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {isCredit ? "+" : "-"}{(transaction.amount / 100).toFixed(2)} €
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
