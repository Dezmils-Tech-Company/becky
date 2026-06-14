'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { clearCart } = useCart()

  const orderId = searchParams.get('orderId')

  useEffect(() => {
    // Clear the cart on successful order placement
    clearCart()
  }, [clearCart])

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (!orderId) {
    router.push('/cart')
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Order Placed Successfully
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Thank you for your purchase! Your order #{orderId} has been confirmed.
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
        >
          View Your Orders
        </Link>
        <Link
          href="/products"
          className="ml-4 inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}