"use client"

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "./auth-context"

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinSession: (sessionId: string) => void
  leaveSession: (sessionId: string) => void
  sendTypingIndicator: (sessionId: string, isTyping: boolean) => void
  markMessageAsRead: (sessionId: string, messageId: string) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Ne connecter que si l'utilisateur est authentifié
    if (!user) {
      // Déconnecter si le socket existe
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Récupérer le token depuis le localStorage (utilise 'auth_token' comme dans api.ts)
    const token = localStorage.getItem("auth_token")
    if (!token) {
      console.warn("⚠️ No auth_token found in localStorage")
      return
    }

    // Créer la connexion WebSocket
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const WS_URL = API_URL.replace("/api/v1", "")

    console.log("🔌 Connecting to WebSocket:", `${WS_URL}/messages`)
    console.log("🔑 Token length:", token.length)

    const newSocket = io(`${WS_URL}/messages`, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected:", newSocket.id)
      setIsConnected(true)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason)
      setIsConnected(false)
    })

    newSocket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error.message)
      console.error("Error details:", error)
      setIsConnected(false)
    })

    newSocket.on("error", (error) => {
      console.error("❌ WebSocket error:", error)
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user])

  const joinSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-session", { sessionId })
      console.log("🚪 Joined session:", sessionId)
    }
  }, [])

  const leaveSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave-session", { sessionId })
      console.log("🚪 Left session:", sessionId)
    }
  }, [])

  const sendTypingIndicator = useCallback((sessionId: string, isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", { sessionId, isTyping })
    }
  }, [])

  const markMessageAsRead = useCallback((sessionId: string, messageId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("read-receipt", { sessionId, messageId })
    }
  }, [])

  const value: WebSocketContextType = {
    socket,
    isConnected,
    joinSession,
    leaveSession,
    sendTypingIndicator,
    markMessageAsRead,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}
