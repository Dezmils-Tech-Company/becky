'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'

export default function DashboardPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?limit=3`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch orders')
        const data = await res.json()
        if (data.success) {
          setOrders(data.data)
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-pink-50">
        <div className="flex flex-col items-center gap-3 text-pink-600">
          <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0) / 100

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-pink-900">Dashboard</h1>

        <div className="space-y-6">
          {/* Welcome banner */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold text-lg">
                {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-pink-900">
                  Welcome, {user.displayName || user.email}!
                </h2>
                <p className="text-neutral-500 text-sm">
                  Here's a quick overview of your account activity.
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-4">
              <p className="text-sm text-neutral-500">Recent Orders</p>
              <p className="text-2xl font-bold text-pink-900 mt-1">{totalOrders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-4">
              <p className="text-sm text-neutral-500">Recent Spend</p>
              <p className="text-2xl font-bold text-pink-900 mt-1">
                {orders[0]?.currency === 'KES' ? 'KSh ' : '$'}
                {totalSpent.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-pink-900">Recent Orders</h2>
              <Link href="/orders" className="text-sm font-medium text-pink-600 hover:text-pink-700">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-lg bg-pink-50 animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-3">You haven't placed any orders yet.</p>
                <Link
                  href="/products"
                  className="inline-block rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-pink-100 rounded-lg p-4 hover:border-pink-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-600">
                        Order #{order._id.toString().substring(0, 8)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-neutral-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-medium text-sm text-neutral-600">Total:</p>
                      <p className="text-lg font-semibold text-pink-900">
                        {order.total / 100} {order.currency === 'KES' ? 'KSh' : '$'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-pink-900">Quick Links</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/orders"
                className="border border-pink-100 rounded-lg p-4 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors"
              >
                <h3 className="font-semibold mb-1 text-pink-900">Order History</h3>
                <p className="text-neutral-500 text-sm">View all your orders</p>
              </Link>
              <Link
                href="/profile"
                className="border border-pink-100 rounded-lg p-4 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors"
              >
                <h3 className="font-semibold mb-1 text-pink-900">Profile</h3>
                <p className="text-neutral-500 text-sm">Update your information</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}