"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, Message } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquareIcon, SendIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

interface SessionChatProps {
  sessionId: string
  sellerId: string
  isPro?: boolean
}

export function SessionChat({ sessionId, sellerId, isPro = false }: SessionChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const previousMessageCountRef = useRef(0)

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api.getSessionMessages(sessionId)
      setMessages(data)

      // Mark all unread messages as read
      const hasUnreadMessages = data.some(m => !m.isRead && m.senderId !== user?.id)
      if (hasUnreadMessages) {
        await api.markAllMessagesAsRead(sessionId)
      }
    } catch (error: any) {
      // Silently fail for 404 errors (no messages yet)
      if (error.statusCode !== 404) {
        console.error("Error fetching messages:", error)
      }
    }
  }, [sessionId, user?.id])

  useEffect(() => {
    setLoading(true)
    fetchMessages().finally(() => setLoading(false))

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    // Only scroll to bottom when a NEW message is added
    if (messages.length > previousMessageCountRef.current && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
    previousMessageCountRef.current = messages.length
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user) return

    try {
      setSending(true)
      const message = await api.sendMessage(sessionId, newMessage.trim())

      setMessages([...messages, message])
      setNewMessage("")
      toast.success("Message envoyé")
    } catch (error: any) {
      toast.error(error.message || "Impossible d'envoyer le message")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareIcon className="h-5 w-5" />
          {isPro ? "Messages avec le testeur" : "Messages avec le vendeur"}
        </CardTitle>
        <CardDescription>
          {isPro ? "Communiquez avec le testeur pour cette session" : "Communiquez avec le vendeur pour cette session"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Messages Area */}
          <ScrollArea className="h-[400px] rounded-lg border p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquareIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun message</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isPro ? "Commencez la conversation avec le testeur" : "Commencez la conversation avec le vendeur"}
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === user?.id

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isOwn ? 'bg-primary' : 'bg-muted'
                      }`}>
                        <UserIcon className={`h-4 w-4 ${isOwn ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      </div>
                      <div className={`flex-1 space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 text-xs text-muted-foreground ${
                          isOwn ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>
                            {new Date(message.createdAt).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          {message.isRead && isOwn && (
                            <span className="text-xs">• Lu</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
