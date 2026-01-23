"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, Profile, SignInData, SignUpData, UpdateProfileData } from '@/lib/api'

interface AuthContextType {
  user: Profile | null
  loading: boolean
  signIn: (data: SignInData) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (data: UpdateProfileData) => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    // Skip initial auth check on OAuth callback page
    // The callback page will handle token storage and call refreshAuth() after
    const isCallbackPage = typeof window !== 'undefined' &&
                          window.location.pathname.includes('/auth/callback')

    if (isCallbackPage) {
      setLoading(false)
      return
    }

    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Les cookies httpOnly sont automatiquement envoyés par le navigateur
      // On appelle directement /me, le backend vérifie le cookie
      const profile = await api.getMe()
      setUser(profile)
    } catch (error: any) {
      // Si erreur 401, l'utilisateur n'est pas connecté (cookie expiré ou absent)
      // C'est un comportement normal, on ne log pas l'erreur
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (data: SignInData) => {
    try {
      const response = await api.signIn(data)
      // Cookies are set automatically by the backend, just store the profile
      setUser(response.profile)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const signUp = async (data: SignUpData) => {
    try {
      const response = await api.signUp(data)
      // Cookies are set automatically by the backend, just store the profile
      setUser(response.profile)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await api.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      // Toujours déconnecter côté frontend, même si l'API échoue
      setUser(null)
      router.push('/signin')
    }
  }

  const updateUser = async (data: UpdateProfileData) => {
    try {
      const updatedProfile = await api.updateProfile(data)
      setUser(updatedProfile)
    } catch (error) {
      throw error
    }
  }

  const refreshAuth = async () => {
    await checkAuth()
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, updateUser, refreshAuth }}
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
