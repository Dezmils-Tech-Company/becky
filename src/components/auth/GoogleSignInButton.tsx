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
    <div className="flex w-full items-center justify-center gap-3">
      {loading ? (
        <>
          <Spinner className="h-4 w-4" />
          <span>Signing in with Google...</span>
        </>
      ) : (
        <>
          <span>Continue with Google</span>
        </>
      )}
      <Button
        variant="outline"
        size="lg"
        onClick={handleClick}
        disabled={loading}
        className="w-full justify-start"
      >
        {loading ? null : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5 shrink-0"
            fill="currentColor"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.5l7.03-7.03C38.04 2.9 32.02 0 24 0 10.75 0 0 10.75 0 24s10.75 24 24 24c5.13 0 9.87-1.45 13.82-4.05l-7.03-7.03c-2.23 2.1-5.29 3.44-8.79 3.44-6.63 0-12-5.37-12-12s5.37-12 12-12z"
            ></path>
            <path
              fill="#FBBC05"
              d="M24 40c-4.97 0-9.3-2.07-12-5.5l7.04-7.04c1.93 2.54 4.64 4 7.79 4 6.35 0 11.54-5.17 11.54-11.54S36.75 7.5 30.4 7.5c-1.56.42-3.04 1.08-4.3 2.05L16.5 5.1c3.27-2.56 7.52-4 12.3-4 8.55 0 15.5 6.95 15.5 15.5S40.95 38.5 32.4 38.5c-1.47.21-2.89.53-4.2 1L24 40z"
            ></path>
            <path
              fill="#34A853"
              d="M40.1 23.6c0 2.07-.54 4.01-1.5 5.65l-4.77 2.47c-.75-.4-1.42-.93-1.98-1.58l5.25-5.25c1.79-.97 2.98-2.4 3.48-4.22H40.1z"
            ></path>
            <path
              fill="#4285F4"
              d="M24 7.27c-3.09 0-5.9.84-8.29 2.47L6.6 24.8c1.81 2.5 2.5 5.87 1.97 9.01H4.22c2.74-5.6 4.38-12.01 4.38-18.86 0-4.34-.87-8.47-2.4-12.33l4.39-2.15c2.27 1.3 4.89 2.09 7.64 2.09 4.56 0 8.35-2.09 10.84-5.61l-4.95 2.56z"
            ></path>
          </svg>
        )}
      </Button>
    </div>
  )
}