"use client"

import { useEffect, useState } from "react"
import { api, Wallet, WalletTransaction, WithdrawalRequest } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { WithdrawalDialog } from "@/components/withdrawal-dialog"
import { WalletIcon, ArrowUpIcon, ArrowDownIcon, HistoryIcon, CoinsIcon, ArrowUpRightIcon } from "lucide-react"

export default function WalletPage() {
  const { handleErrorWithRetry } = useErrorHandler()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawalOpen, setWithdrawalOpen] = useState(false)

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const [walletData, transactionsData, withdrawalsData] = await Promise.all([
        api.getMyWallet(),
        api.getWalletTransactions(50),
        api.getMyWithdrawals()
      ])
      setWallet(walletData)
      setTransactions(transactionsData)
      setWithdrawals(withdrawalsData)
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
  }, [])

  const recentCredits = transactions.filter(t => t.type === 'CREDIT' || t.type === 'REWARD').slice(0, 5)
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
              {(wallet?.balance || 0).toFixed(2)} {wallet?.currency || 'EUR'}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWithdrawalOpen(true)}
              disabled={!wallet || wallet.balance < 10}
            >
              <ArrowUpRightIcon className="mr-2 h-4 w-4" />
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
              +{recentCredits.reduce((sum, t) => sum + t.amount, 0).toFixed(2)} €
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
              -{recentDebits.reduce((sum, t) => sum + t.amount, 0).toFixed(2)} €
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
                const isCredit = transaction.type === 'CREDIT' || transaction.type === 'REWARD'

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
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {isCredit ? "+" : "-"}{transaction.amount.toFixed(2)} €
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
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

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <Card className="mx-4 lg:mx-6">
          <CardHeader>
            <CardTitle>Historique des retraits</CardTitle>
            <CardDescription>
              Vos demandes de retrait et leur statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {withdrawal.method === 'BANK_TRANSFER' ? 'Virement bancaire' : 'Carte cadeau'}
                      </p>
                      {withdrawal.status === 'COMPLETED' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Complété</Badge>
                      )}
                      {withdrawal.status === 'PENDING' && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">En attente</Badge>
                      )}
                      {withdrawal.status === 'PROCESSING' && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">En cours</Badge>
                      )}
                      {withdrawal.status === 'REJECTED' && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">Rejeté</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Créé le {new Date(withdrawal.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                    {withdrawal.processedAt && (
                      <p className="text-sm text-muted-foreground">
                        Traité le {new Date(withdrawal.processedAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-bold">
                    {withdrawal.amount.toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawal Dialog */}
      {wallet && (
        <WithdrawalDialog
          wallet={wallet}
          open={withdrawalOpen}
          onOpenChange={setWithdrawalOpen}
          onSuccess={fetchWalletData}
        />
      )}
    </div>
  )
}
