"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useWebSocket } from "@/contexts/websocket-context"
import { api, Message, ChatOrder } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageSquareIcon, SendIcon, UserIcon, CheckCheckIcon, WifiOffIcon, PlusCircleIcon } from "lucide-react"
import { toast } from "sonner"
import { CreateOrderDialog } from "./create-order-dialog"
import { OrderCard } from "./order-card"
import { RejectOrderDialog, DeliverOrderDialog, DisputeOrderDialog } from "./order-action-dialogs"

interface SessionChatProps {
  sessionId: string
  sellerId: string
  isPro?: boolean
}

export function SessionChat({ sessionId, sellerId, isPro = false }: SessionChatProps) {
  const { user } = useAuth()
  const { socket, isConnected, joinSession, leaveSession, sendTypingIndicator, markMessageAsRead } = useWebSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [orders, setOrders] = useState<ChatOrder[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const previousMessageCountRef = useRef(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Dialogs state
  const [createOrderOpen, setCreateOrderOpen] = useState(false)
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null)
  const [deliverOrderId, setDeliverOrderId] = useState<string | null>(null)
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null)

  // Fetch initial messages and orders
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
    } finally {
      setLoading(false)
    }
  }, [sessionId, user?.id])

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.getSessionOrders(sessionId)
      setOrders(data)
    } catch (error: any) {
      // Silently fail for 404 errors (no orders yet)
      if (error.statusCode !== 404) {
        console.error("Error fetching orders:", error)
      }
    }
  }, [sessionId])

  // Initial load
  useEffect(() => {
    fetchMessages()
    fetchOrders()
  }, [fetchMessages, fetchOrders])

  // Join session room when socket connects
  useEffect(() => {
    if (socket && isConnected && sessionId) {
      joinSession(sessionId)

      return () => {
        leaveSession(sessionId)
      }
    }
  }, [socket, isConnected, sessionId, joinSession, leaveSession])

  // Listen for WebSocket events
  useEffect(() => {
    if (!socket) return

    // New message received
    const handleNewMessage = (message: Message) => {
      console.log("📨 New message received:", message)
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })

      // Mark as read if not sent by current user
      if (message.senderId !== user?.id) {
        markMessageAsRead(sessionId, message.id)
      }
    }

    // Typing indicator
    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== user?.id) {
        setOtherUserTyping(data.isTyping)
      }
    }

    // Read receipt
    const handleReadReceipt = (data: { messageId: string; readBy: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, isRead: true } : msg
        )
      )
    }

    // User status
    const handleUserStatus = (data: { userId: string; status: "online" | "offline" }) => {
      console.log("👤 User status:", data)
      // TODO: Update UI to show online/offline status
    }

    // Order events
    const handleOrderCreated = (order: ChatOrder) => {
      console.log("📦 Order created:", order)
      setOrders((prev) => {
        if (prev.some(o => o.id === order.id)) return prev
        return [...prev, order]
      })
      toast.info("Nouvelle commande reçue !")
    }

    const handleOrderUpdated = (order: ChatOrder) => {
      console.log("📦 Order updated:", order)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? order : o))
      )
    }

    socket.on("new-message", handleNewMessage)
    socket.on("user-typing", handleTyping)
    socket.on("message-read", handleReadReceipt)
    socket.on("user-status", handleUserStatus)
    socket.on("order-created", handleOrderCreated)
    socket.on("order-updated", handleOrderUpdated)

    return () => {
      socket.off("new-message", handleNewMessage)
      socket.off("user-typing", handleTyping)
      socket.off("message-read", handleReadReceipt)
      socket.off("user-status", handleUserStatus)
      socket.off("order-created", handleOrderCreated)
      socket.off("order-updated", handleOrderUpdated)
    }
  }, [socket, sessionId, user?.id, markMessageAsRead])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > previousMessageCountRef.current && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
    previousMessageCountRef.current = messages.length
  }, [messages])

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      sendTypingIndicator(sessionId, true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTypingIndicator(sessionId, false)
    }, 2000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user) return

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false)
      sendTypingIndicator(sessionId, false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }

    try {
      setSending(true)
      const message = await api.sendMessage(sessionId, newMessage.trim())

      // Add message optimistically (will be confirmed by WebSocket event)
      setMessages((prev) => {
        if (prev.some(m => m.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })

      setNewMessage("")
    } catch (error: any) {
      toast.error(error.message || "Impossible d'envoyer le message")
    } finally {
      setSending(false)
    }
  }

  // Order action handlers
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await api.acceptChatOrder(orderId)
      toast.success("Commande acceptée !")
      fetchOrders()
    } catch (error: any) {
      toast.error(error.message || "Impossible d'accepter la commande")
    }
  }

  const handleValidateOrder = async (orderId: string) => {
    try {
      await api.validateChatOrderDelivery(orderId)
      toast.success("Livraison validée ! Le paiement a été libéré.")
      fetchOrders()
    } catch (error: any) {
      toast.error(error.message || "Impossible de valider la livraison")
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.cancelChatOrder(orderId)
      toast.success("Commande annulée")
      fetchOrders()
    } catch (error: any) {
      toast.error(error.message || "Impossible d'annuler la commande")
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="h-5 w-5" />
            <CardTitle>
              {isPro ? "Messages avec le testeur" : "Messages avec le vendeur"}
            </CardTitle>
          </div>
          {!isConnected && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOffIcon className="h-3 w-3" />
              Hors ligne
            </Badge>
          )}
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              En ligne
            </Badge>
          )}
        </div>
        <CardDescription>
          {isPro ? "Communiquez avec le testeur pour cette session" : "Communiquez avec le vendeur pour cette session"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Commander UGC/Photo/Tip (PRO only) */}
          {isPro && (
            <Button
              onClick={() => setCreateOrderOpen(true)}
              variant="outline"
              className="w-full"
              disabled={!isConnected}
            >
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Commander UGC / Photo / Pourboire
            </Button>
          )}

          {/* Orders Section */}
          {orders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Commandes</h3>
              <div className="space-y-3">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isPro={isPro}
                    onAccept={handleAcceptOrder}
                    onReject={(orderId) => setRejectOrderId(orderId)}
                    onDeliver={(orderId) => setDeliverOrderId(orderId)}
                    onValidate={handleValidateOrder}
                    onDispute={(orderId) => setDisputeOrderId(orderId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="h-[400px] rounded-lg border p-4">
            <div className="space-y-4">
              {messages.length === 0 && orders.length === 0 ? (
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
                          {isOwn && (
                            message.isRead ? (
                              <CheckCheckIcon className="h-3 w-3 text-blue-500" />
                            ) : (
                              <CheckCheckIcon className="h-3 w-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              {/* Typing indicator */}
              {otherUserTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={handleInputChange}
              disabled={sending || !isConnected}
            />
            <Button type="submit" disabled={sending || !newMessage.trim() || !isConnected}>
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>

          {!isConnected && (
            <p className="text-xs text-red-600 text-center">
              Connexion perdue. Reconnexion en cours...
            </p>
          )}
        </div>
      </CardContent>

      {/* Dialogs */}
      <CreateOrderDialog
        sessionId={sessionId}
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
        onSuccess={fetchOrders}
      />

      {rejectOrderId && (
        <RejectOrderDialog
          orderId={rejectOrderId}
          open={!!rejectOrderId}
          onOpenChange={(open) => !open && setRejectOrderId(null)}
          onSuccess={() => {
            setRejectOrderId(null)
            fetchOrders()
          }}
        />
      )}

      {deliverOrderId && (
        <DeliverOrderDialog
          orderId={deliverOrderId}
          open={!!deliverOrderId}
          onOpenChange={(open) => !open && setDeliverOrderId(null)}
          onSuccess={() => {
            setDeliverOrderId(null)
            fetchOrders()
          }}
        />
      )}

      {disputeOrderId && (
        <DisputeOrderDialog
          orderId={disputeOrderId}
          open={!!disputeOrderId}
          onOpenChange={(open) => !open && setDisputeOrderId(null)}
          onSuccess={() => {
            setDisputeOrderId(null)
            fetchOrders()
          }}
        />
      )}
    </Card>
  )
}
