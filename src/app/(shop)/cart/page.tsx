'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../../../hooks/useCart'
import { formatKES } from '../../../lib/utils/currency'
import { CartItem } from '../../../components/shop/CartItem'
import { Button } from '../../../components/ui/Button'
import { PageWrapper } from '../../../components/layout/PageWrapper'

/**
 * Full cart page: lists all items with quantity controls, shows the
 * subtotal, and links to checkout.
 */
export default function CartPage(): React.ReactNode {
  const { items, total, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-pink-200" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-neutral-900">Your cart is empty</h1>
        <p className="mt-1 text-sm text-neutral-500">Browse our products and add something you love.</p>
        <Link href="/products" className="mt-6">
          <Button variant="primary">Continue shopping</Button>
        </Link>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Your cart</h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-neutral-400 transition-colors hover:text-pink-600"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="divide-y divide-neutral-100 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        <div className="rounded-lg border border-neutral-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-neutral-900">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-medium text-neutral-900">{formatKES(total)}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">Shipping calculated at checkout</p>

          <Link href="/checkout" className="mt-6 block">
            <Button variant="primary" className="w-full">
              Proceed to checkout
            </Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  )
}