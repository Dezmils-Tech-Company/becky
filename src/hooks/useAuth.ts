'use client';

import { useState, useEffect, useCallback } from 'react'
import { getIdToken, signOutUser } from '@/lib/firebase/auth-helpers'
import { useRouter } from 'next/navigation'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: {
    uid: string
    email: string
    displayName: string
    photoURL: string
    role: string
  } | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  })
  const router = useRouter()

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check session by calling our API endpoint
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Important for sending cookies
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: data.data,
            })
            return
          }
        }

        // If we get here, no valid session
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        })
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const session = await getIdToken()

      // Call our session endpoint
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: session }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Login failed')
      }

      // Update auth state by checking our API
      const meResponse = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (meResponse.ok) {
        const meData = await meResponse.json()
        if (meData.success && meData.data) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: meData.data,
          })
        }
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })
    }
  }, [])

  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      await signOutUser()

      // Call our logout endpoint to clear session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [router])

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,
    login,
    logout,
  }
}