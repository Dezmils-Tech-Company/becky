'use client';

import { LoginForm } from '@/components/auth'
import { GoogleSignInButton } from '@/components/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6">Sign in to your account</h1>
      <LoginForm />
      <div className="flex items-center">
        <div className="w-full border-t border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500">Or continue with</span>
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <GoogleSignInButton />
    </>
  )
}