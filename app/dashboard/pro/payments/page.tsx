"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api, CampaignTransaction } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCardIcon, TrendingUpIcon, DollarSignIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="default" className="bg-green-500">Complété</Badge>
    case 'PENDING':
      return <Badge variant="outline" className="border-orange-500 text-orange-600">En attente</Badge>
    case 'FAILED':
      return <Badge variant="outline" className="border-red-500 text-red-600">Échoué</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'CAMPAIGN_PAYMENT':
      return (
        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
          <CreditCardIcon className="mr-1 h-3 w-3" />
          Paiement
        </Badge>
      )
    case 'CAMPAIGN_REFUND':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
          <TrendingUpIcon className="mr-1 h-3 w-3" />
          Remboursement
        </Badge>
      )
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<CampaignTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchTransactions()
  }, [user, page, limit])

  const fetchTransactions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await api.getMyTransactions(page, limit)
      setTransactions(data.data)
      setTotal(data.meta.total)
      setTotalPages(data.meta.totalPages)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const stats = transactions.reduce(
    (acc, transaction) => {
      if (transaction.status === 'COMPLETED') {
        if (transaction.type === 'CAMPAIGN_PAYMENT') {
          acc.totalPaid += transaction.amount
          acc.paymentsCount += 1
        } else if (transaction.type === 'CAMPAIGN_REFUND') {
          acc.totalRefunded += transaction.amount
          acc.refundsCount += 1
        }
      }
      return acc
    },
    { totalPaid: 0, totalRefunded: 0, paymentsCount: 0, refundsCount: 0 }
  )

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Mes paiements</h1>
                <p className="text-muted-foreground">
                  Consultez l'historique de vos transactions
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total payé</CardTitle>
                  <CreditCardIcon className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatAmount(stats.totalPaid)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.paymentsCount} paiement{stats.paymentsCount > 1 ? 's' : ''} complété{stats.paymentsCount > 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total}</div>
                  <p className="text-xs text-muted-foreground">
                    Total des transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Historique des transactions</CardTitle>
                    <CardDescription>
                      Liste de toutes vos transactions liées aux campagnes
                    </CardDescription>
                  </div>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => {
                      setLimit(Number(value))
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 par page</SelectItem>
                      <SelectItem value="20">20 par page</SelectItem>
                      <SelectItem value="50">50 par page</SelectItem>
                      <SelectItem value="100">100 par page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Aucune transaction</p>
                    <p className="text-sm text-muted-foreground">
                      Vos transactions apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Campagne</TableHead>
                            <TableHead>Raison</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(transaction.createdAt)}
                              </TableCell>
                              <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{transaction.campaign.title}</div>
                                  {transaction.stripeSessionId && (
                                    <div className="text-xs text-muted-foreground">
                                      {transaction.stripeSessionId.substring(0, 20)}...
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[300px]">
                                <div className="truncate">{transaction.reason}</div>
                                {transaction.failureReason && (
                                  <div className="text-xs text-red-600 mt-1">
                                    {transaction.failureReason}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                <span
                                  className={
                                    transaction.type === 'CAMPAIGN_PAYMENT'
                                      ? 'text-green-600'
                                      : 'text-blue-600'
                                  }
                                >
                                  {formatAmount(transaction.amount)}
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {page} sur {totalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            Précédent
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

