import type { ReactNode } from 'react'

export const metadata = {
  title: 'Auth',
  description: 'Authentication pages',
}

export default function AuthLayout({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`min-h-screen flex items-center justify-center  ${className}`}>
      <div className="w-full max-w-md space-y-6 p-4">
        {children}
      </div>
    </div>
  )
}