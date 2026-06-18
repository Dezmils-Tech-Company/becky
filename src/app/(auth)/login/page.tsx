'use client';

import { GoogleSignInButton, LoginForm } from '@/components/auth'

export default function LoginPage() {
  return (
    <div className="min-h-screen  px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-col rounded-[24px] bg-white p-8 shadow-[0_5px_15px_rgba(0,0,0,0.16)]">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-500">Welcome back</p>
        </div>

        <div className="mt-10">
          <LoginForm />
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs uppercase tracking-[0.28em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="mt-6">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  )
}