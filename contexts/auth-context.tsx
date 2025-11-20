"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, Profile, SignInData, SignUpData } from '@/lib/api'

interface AuthContextType {
  user: Profile | null
  loading: boolean
  signIn: (data: SignInData) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (data: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = api.getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const profile = await api.getMe()
      setUser(profile)
    } catch {
      // Token invalide ou expiré - nettoyer silencieusement
      api.setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (data: SignInData) => {
    try {
      const response = await api.signIn(data)
      api.setToken(response.access_token)
      setUser(response.profile)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const signUp = async (data: SignUpData) => {
    try {
      const response = await api.signUp(data)
      api.setToken(response.access_token)
      setUser(response.profile)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await api.signOut()
      setUser(null)
      router.push('/signin')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateUser = async (data: Partial<Profile>) => {
    try {
      const updatedProfile = await api.updateProfile(data)
      setUser(updatedProfile)
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
