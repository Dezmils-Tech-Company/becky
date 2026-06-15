'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { Spinner } from '@/components/ui/Spinner'
import { RegisterFormValues } from '@/schemas/auth.schema'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { getIdToken } from '@/lib/firebase/auth-helpers'
import { useAuth } from '@/hooks/useAuth'

export const RegisterForm = () => {
  const [values, setValues] = useState<RegisterFormValues>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login: authLogin } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      )

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: values.displayName,
      })

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
        throw new Error(errorData.error?.message || 'Registration failed')
      }

      // Update auth state
      await authLogin()

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      console.error('Registration failed:', err)
    } finally {
      setLoading(false)
      }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700">
          Display name
        </label>
        <Input
          id="displayName"
          type="text"
          value={values.displayName}
          onChange={(e) => setValues({ ...values, displayName: e.target.value })}
          placeholder="Your display name"
          required
          autoComplete="name"
          className="rounded-[20px] border border-pink-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-pink-400 focus:ring-pink-300"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="rounded-[20px] border border-pink-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-pink-400 focus:ring-pink-300"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={values.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          minLength={8}
          className="rounded-[20px] border border-pink-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-pink-400 focus:ring-pink-300"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
          Confirm password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={(e) => setValues({ ...values, confirmPassword: e.target.value })}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className="rounded-[20px] border border-pink-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-pink-400 focus:ring-pink-300"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm text-pink-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-[20px] bg-pink-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 hover:bg-pink-700 focus:ring-pink-400"
      >
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4 text-white" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-pink-600 hover:text-pink-700">
          Sign in
        </a>
      </p>
    </form>
  )
}