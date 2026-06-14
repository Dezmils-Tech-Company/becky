'use client'

import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  if (!user) {
    // This shouldn't happen if protected, but just in case
    return <p>Loading...</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-4">
        <p>Welcome, {user.displayName || user.email}!</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  )
}