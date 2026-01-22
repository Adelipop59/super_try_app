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
      // Cookies are automatically sent, just try to get the profile
      const profile = await api.getMe()
      setUser(profile)
    } catch (error: any) {
      // Silently handle auth errors - user is simply not logged in
      // Don't log these errors as they're expected when not authenticated
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
      setUser(null)
      router.push('/signin')
    } catch (error) {
      console.error('Sign out error:', error)
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
