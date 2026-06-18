'use client';

import { useState } from 'react'
import { Button } from '@/components/ui'
import { Spinner } from '@/components/ui/Spinner'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { getIdToken } from '@/lib/firebase/auth-helpers'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export const GoogleSignInButton = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login: authLogin } = useAuth()

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Get Firebase ID token
      const idToken = await getIdToken()

      // Call our session endpoint
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Sign in failed')
      }

      // Update auth state
      await authLogin()

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      console.error('Google sign in failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-center w-full items-center justify-center p-2 gap-4">
      {loading ? (
        <>
          <Spinner className="h-2 w-2" />
          <span>Signing in with Google...</span>
        </>
      ) : (
        <>
          <span>Continue with Google</span>
        </>
      )}
      <Button
        size="lg"
        onClick={handleClick}
        disabled={loading}
        className="w-full justify-center mt-4 bg-pink-50"
      >
        {loading ? null : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5 shrink-0"
            fill="currentColor"
          >
           
          </svg>
        )}
      </Button>
    </div>
  )
}