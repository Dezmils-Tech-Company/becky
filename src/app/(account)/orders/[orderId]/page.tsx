'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { useRouter } from 'next/navigation'
import { formatKES, formatUSD } from '@/lib/utils/currency'

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${params.orderId}`, {
          credentials: 'include',
        })
        if (res.status === 404) {
          throw new Error('Order not found')
        }
        if (!res.ok) {
          throw new Error('Failed to fetch order')
        }
        const data = await res.json()
        if (data.success) {
          setOrder(data.data)
        } else {
          throw new Error(data.error?.message || 'Failed to fetch order')
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.orderId])

  if (!user) return <div>Loading...</div>

  if (loading) return <div>Loading order details...</div>

  if (error) return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Error</h2>
      <p className="text-neutral-500">{error}</p>
      <Link href="/orders" className="text-neutral-600 hover:text-neutral-800">
        ← Back to orders
      </Link>
    </div>
  )

  if (!order) return <div>No order found</div>

  const formatCurrency = (amount: number) => {
    return order.currency === 'KES' ? formatKES(amount) : formatUSD(amount)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <Link href="/orders" className="text-neutral-600 hover:text-neutral-800">
          ← Back to orders
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">
            Order #{order._id.toString().substring(0, 8)}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-neutral-500 text-sm">
          Placed on {new Date(order.createdAt).toLocaleDateString()} at {
            new Date(order.createdAt).toLocaleTimeString()
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          {order.items.map((item: any) => (
            <div key={item.productId} className="border-b border-neutral-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-neutral-500 text-sm">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  <p className="text-neutral-500 text-sm">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal:</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.notes && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Notes:</span>
                <span className="text-neutral-900">{order.notes}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment Method:</span>
              <span className="text-neutral-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment Status:</span>
              <span className="{
                order.paymentStatus === 'paid'
                  ? 'text-emerald-600'
                  : order.paymentStatus === 'failed'
                  ? 'text-rose-600'
                  : 'text-neutral-600'
              }">
                {order.paymentStatus}
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">Total:</span>
                <span className="text-xl font-bold">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
        <div className="space-y-2">
          <p className="text-neutral-900">
            {order.shippingAddress.line1}
          </p>
          {order.shippingAddress.line2 && (
            <p className="text-neutral-900">{order.shippingAddress.line2}</p>
          )}
          <p className="text-neutral-900">
            {order.shippingAddress.city}, {order.shippingAddress.country} {
              order.shippingAddress.postalCode
            }
          </p>
        </div>
      </div>
    </div>
  )
}