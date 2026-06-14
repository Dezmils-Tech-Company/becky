'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { formatKES } from '@/lib/utils/currency'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CheckoutSummary } from '@/components/shop/CheckoutSummary'

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { items } = useCart()

  const [formData, setFormData] = useState({
    line1: '',
    line2: '',
    city: '',
    country: '',
    postalCode: ''
  })
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) {
    // Redirect to login with callback to return to checkout after login
    router.push(`/login?redirect=${encodeURIComponent('/checkout')}`)
    return null
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build order payload
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))

      const payload = {
        items: orderItems,
        shippingAddress: formData,
        paymentMethod: 'mpesa', // TEMP: hardcoded for now, will be selected in Task 8
        currency: 'KES', // Assuming KES for now; could be dynamic based on cart/currency
        notes: ''
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'Failed to create order')
      }

      const data = await res.json()
      if (!data.success || !data.data?._id) {
        throw new Error('Invalid response from server')
      }

      const orderId = data.data._id
      // Redirect to success page
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (err: any) {
      console.error('Checkout error:', err)
      // In a real app, we'd show a toast or error message
      alert(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Summary */}
        <CheckoutSummary currency="KES" />

        {/* Shipping Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Address Line 1
            </label>
            <Input
              id="line1"
              value={formData.line1}
              onChange={(e) => handleChange('line1', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Address Line 2 (optional)
            </label>
            <Input
              id="line2"
              value={formData.line2}
              onChange={(e) => handleChange('line2', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                City
              </label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Country
              </label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Postal Code
            </label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              required
            />
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Placing order...' : 'Place Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}