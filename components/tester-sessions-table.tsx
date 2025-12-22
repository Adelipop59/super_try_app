"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TestTubeIcon, ArrowRightIcon } from "lucide-react"
import Link from "next/link"

export function TesterSessionsTable() {
  // Mock data for now - will be replaced with real API call
  const mockSessions: any[] = []

  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TestTubeIcon className="h-5 w-5 text-blue-600" />
              Mes sessions récentes
            </CardTitle>
            <CardDescription className="mt-1">
              Liste de vos sessions de test en cours et terminées
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/tester/sessions">
              Voir tout
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {mockSessions.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TestTubeIcon className="mx-auto h-12 w-12 opacity-20" />
              <p className="mt-4 text-sm">Aucune session pour le moment</p>
              <p className="mt-1 text-xs">
                Vos sessions de test apparaîtront ici une fois que vous commencerez
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {mockSessions.map((session: any) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{session.campaign?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}>
                  {session.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
