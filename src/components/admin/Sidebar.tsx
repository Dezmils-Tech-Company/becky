"use client"
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="flex items-center p-6 border-b border-gray-200">
        <span className="text-xl font-bold text-gray-800">Beckie Admin</span>
      </div>
      <nav className="mt-6 space-y-2">
        <Link href="/" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
          Dashboard
        </Link>
        <Link href="/admin/products" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
          Products
        </Link>
        <Link href="/admin/orders" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
          Orders
        </Link>
        <Link href="/admin/users" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
          Users
        </Link>
        <Link href="/admin/audit-log" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
          Audit Log
        </Link>
      </nav>
      {!user ? (
        <div className="mt-auto p-6 text-xs text-gray-500 border-t border-gray-200">
          No user
        </div>
      ) : (
        <div className="mt-auto p-6 space-y-2 text-xs text-gray-500 border-t border-gray-200">
          <div>Signed in as:</div>
          <div className="font-medium">{user?.email}</div>
          <div className="font-medium text-blue-600">{user?.role}</div>
        </div>
      )}
    </aside>
  )
}