'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/ui/Badge'

const PAGE_LIMIT = 10

export default function OrdersPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  // Fetch orders for the current page
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/orders?page=${page}&limit=${PAGE_LIMIT}`, {
          credentials: 'include',
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error?.message || 'Failed to fetch orders')
        }

        const data = await res.json()
        if (!data.success) throw new Error(data.error?.message || 'Failed to fetch orders')

        setOrders(data.data)
        setTotalOrders(data.pagination.total)
        setTotalPages(data.pagination.pages)
      } catch (err: any) {
        setError(err.message || 'Something went wrong. Please try again.')
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, page])

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  // Handle pagination
  const goToPreviousPage = () => {
    if (page > 1) setPage(page - 1)
  }

  const goToNextPage = () => {
    if (page < totalPages) setPage(page + 1)
  }

  // Format currency
  const formatCurrency = (amount: number, currency: 'KES' | 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'KES' ? 'KES' : 'USD',
    }).format(amount / 100) // Assuming amounts are in cents
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-pink-900">Order History</h1>
          <p className="mt-2 text-pink-600">
            View your past and current orders
          </p>
        </div>

        {loading && (
          <div className="flex min-h-[20vh] items-center justify-center">
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
              <p className="text-sm font-medium">Loading your orders…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start justify-between gap-4">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {orders.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-pink-500">You haven't placed any orders yet.</p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-md transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-pink-900">
                      Order #{order._id?.toString?.() ?? order._id}
                    </h2>
                    <p className="text-pink-600 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="space-x-3">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 text-pink-800">Items ({order.items.length})</h3>
                    <div className="space-y-2">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-pink-500 text-sm">
                              ${item.price / 100} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-pink-600">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(order.subtotal, order.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-600">Total:</span>
                      <span className="font-medium text-pink-800">
                        {formatCurrency(order.total, order.currency)}
                      </span>
                    </div>
                    {order.paymentMethod && (
                      <div className="flex justify-between mt-2">
                        <span className="text-pink-600">Payment Method:</span>
                        <span>
                          {order.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Credit/Debit Card'}
                        </span>
                      </div>
                    )}
                    {order.notes && (
                      <div className="flex justify-between mt-2">
                        <span className="text-pink-600">Notes:</span>
                        <span className="text-pink-500">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/orders/${order._id}`}
                  className="w-full inline-flex items-center px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 font-medium rounded-md transition-colors"
                >
                  View Order Details
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 flex items-center justify-between px-4">
            <p className="text-pink-600">
              Showing {orders.length} of {totalOrders} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={page <= 1}
                className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                  page <= 1
                    ? 'bg-pink-200'
                    : 'bg-pink-500 hover:bg-pink-600'
                } text-white`}
              >
                Previous
              </button>
              <span className="text-pink-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={page >= totalPages}
                className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                  page >= totalPages
                    ? 'bg-pink-200'
                    : 'bg-pink-500 hover:bg-pink-600'
                } text-white`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}