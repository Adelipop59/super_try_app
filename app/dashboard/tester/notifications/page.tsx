"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, Notification, NotificationPreferences } from "@/lib/api"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  BellIcon,
  CheckIcon,
  SettingsIcon,
  PackageIcon,
  MessageSquareIcon,
  WalletIcon,
  AlertTriangleIcon,
  InfoIcon,
} from "lucide-react"
import { toast } from "sonner"

export default function NotificationsPage() {
  const router = useRouter()
  const { handleErrorWithRetry } = useErrorHandler()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPreferences, setShowPreferences] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [notificationsData, preferencesData] = await Promise.all([
        api.getMyNotifications(),
        api.getNotificationPreferences()
      ])
      setNotifications(notificationsData)
      setPreferences(preferencesData)
    } catch (error) {
      handleErrorWithRetry(
        error,
        fetchData,
        'Impossible de charger les notifications.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId)
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ))
      toast.success("Notification marquée comme lue")
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead()
      setNotifications(notifications.map(n => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString()
      })))
      toast.success("Toutes les notifications ont été marquées comme lues")
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return

    try {
      const updatedPreferences = await api.updateNotificationPreferences({
        [key]: value
      })
      setPreferences(updatedPreferences)
      toast.success("Préférences mises à jour")
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SESSION_UPDATE':
      case 'SESSION_ACCEPTED':
      case 'SESSION_COMPLETED':
        return <PackageIcon className="h-5 w-5" />
      case 'NEW_MESSAGE':
        return <MessageSquareIcon className="h-5 w-5" />
      case 'PAYMENT_RECEIVED':
      case 'WITHDRAWAL_PROCESSED':
        return <WalletIcon className="h-5 w-5" />
      case 'DISPUTE_UPDATE':
        return <AlertTriangleIcon className="h-5 w-5" />
      default:
        return <InfoIcon className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SESSION_ACCEPTED':
      case 'SESSION_COMPLETED':
      case 'PAYMENT_RECEIVED':
        return 'text-green-600 bg-green-100'
      case 'NEW_MESSAGE':
        return 'text-blue-600 bg-blue-100'
      case 'DISPUTE_UPDATE':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    if (notification.relatedSessionId) {
      router.push(`/dashboard/tester/sessions/${notification.relatedSessionId}`)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BellIcon className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Restez informé de vos sessions et activités
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <CheckIcon className="mr-2 h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
          <Button
            onClick={() => setShowPreferences(!showPreferences)}
            variant="outline"
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            Préférences
          </Button>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPreferences && preferences && (
        <Card>
          <CardHeader>
            <CardTitle>Préférences de notifications</CardTitle>
            <CardDescription>
              Gérez les types de notifications que vous souhaitez recevoir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-medium">Notifications par email</span>
                <span className="text-sm text-muted-foreground">
                  Recevoir les notifications importantes par email
                </span>
              </Label>
              <Switch
                id="emailNotifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sessionUpdates" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-medium">Mises à jour de sessions</span>
                <span className="text-sm text-muted-foreground">
                  Notifications sur l'état de vos sessions
                </span>
              </Label>
              <Switch
                id="sessionUpdates"
                checked={preferences.sessionUpdates}
                onCheckedChange={(checked) => handlePreferenceChange('sessionUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="newMessages" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-medium">Nouveaux messages</span>
                <span className="text-sm text-muted-foreground">
                  Notifications quand vous recevez un message
                </span>
              </Label>
              <Switch
                id="newMessages"
                checked={preferences.newMessages}
                onCheckedChange={(checked) => handlePreferenceChange('newMessages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="paymentUpdates" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-medium">Paiements et retraits</span>
                <span className="text-sm text-muted-foreground">
                  Notifications sur vos transactions financières
                </span>
              </Label>
              <Switch
                id="paymentUpdates"
                checked={preferences.paymentUpdates}
                onCheckedChange={(checked) => handlePreferenceChange('paymentUpdates', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les notifications</CardTitle>
          <CardDescription>
            {notifications.length} notification(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune notification</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vous serez notifié ici de toutes vos activités
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    notification.isRead
                      ? 'bg-card hover:bg-accent/50'
                      : 'bg-accent/30 hover:bg-accent/50 border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <p className={`font-medium ${!notification.isRead ? 'text-primary' : ''}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <Badge variant="default" className="ml-2">Nouveau</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
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
