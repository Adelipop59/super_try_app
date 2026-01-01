"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api, Session, SessionStatus } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/status-badge"
import {
  UsersIcon,
  SearchIcon,
  EyeIcon,
} from "lucide-react"

export default function SessionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleErrorWithRetry } = useErrorHandler()

  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const statusFilter = searchParams.get('status') as SessionStatus | null

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await api.getMySessions()
      setSessions(data)
      setFilteredSessions(data)
    } catch (error) {
      handleErrorWithRetry(
        error,
        fetchSessions,
        'Impossible de charger les sessions.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    let filtered = sessions

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.tester?.firstName?.toLowerCase().includes(query) ||
        s.tester?.lastName?.toLowerCase().includes(query) ||
        s.tester?.email?.toLowerCase().includes(query) ||
        s.campaign?.title?.toLowerCase().includes(query)
      )
    }

    setFilteredSessions(filtered)
  }, [sessions, statusFilter, searchQuery])

  const filterByStatus = (status: SessionStatus | null) => {
    const url = new URL(window.location.href)
    if (status) {
      url.searchParams.set('status', status)
    } else {
      url.searchParams.delete('status')
    }
    router.push(url.pathname + url.search)
  }

  const statusCounts = {
    all: sessions.length,
    PENDING: sessions.filter(s => s.status === 'PENDING').length,
    ACCEPTED: sessions.filter(s => s.status === 'ACCEPTED').length,
    IN_PROGRESS: sessions.filter(s => ['IN_PROGRESS', 'PURCHASE_SUBMITTED'].includes(s.status)).length,
    SUBMITTED: sessions.filter(s => s.status === 'SUBMITTED').length,
    COMPLETED: sessions.filter(s => s.status === 'COMPLETED').length,
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessions de test</h1>
        <p className="text-muted-foreground mt-2">
          Toutes les sessions de vos campagnes
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par testeur ou campagne..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={statusFilter || 'all'} onValueChange={(value) => filterByStatus(value === 'all' ? null : value as SessionStatus)}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">
                Toutes ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="PENDING">
                En attente ({statusCounts.PENDING})
              </TabsTrigger>
              <TabsTrigger value="ACCEPTED">
                Acceptées ({statusCounts.ACCEPTED})
              </TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">
                En cours ({statusCounts.IN_PROGRESS})
              </TabsTrigger>
              <TabsTrigger value="SUBMITTED">
                À valider ({statusCounts.SUBMITTED})
              </TabsTrigger>
              <TabsTrigger value="COMPLETED">
                Complétées ({statusCounts.COMPLETED})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredSessions.length} session(s)
          </CardTitle>
          <CardDescription>
            {searchQuery && `Résultats pour "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Aucune session trouvée' : statusFilter ? `Aucune session avec le statut ${statusFilter}` : 'Aucune session'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/pro/sessions/${session.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <UsersIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {session.tester?.firstName} {session.tester?.lastName}
                        </p>
                        {session.tester?.averageRating && (
                          <span className="text-xs text-muted-foreground">
                            ⭐ {session.tester.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.campaign?.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Créée le {new Date(session.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={session.status} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/pro/sessions/${session.id}`)
                      }}
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
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
