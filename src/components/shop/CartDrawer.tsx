'use client'

import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../../hooks/useCart'
import { useUIStore } from '../../store/ui.store'
import type { UIState } from '../../store/ui.store'
import { formatKES } from '../../lib/utils/currency'
import { CartItem } from './CartItem'
import { Button } from '../ui/Button'

/**
 * Slide-over cart panel. Controlled by `ui.store`'s `isCartOpen`. Lists
 * cart items, shows the subtotal, and links to checkout.
 */
export function CartDrawer(): React.ReactNode {
  const isOpen = useUIStore((state: UIState) => state.isCartOpen)
  const closeCart = useUIStore((state: UIState) => state.closeCart)
  const { items, total, itemCount } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeCart()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] outline-none"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4">
          <h2 className="text-base font-semibold text-neutral-900">
            Your cart {itemCount > 0 && `(${itemCount})`}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-pink-50 hover:text-pink-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-10 w-10 text-pink-200" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-neutral-900">Your cart is empty</p>
              <p className="mt-1 text-sm text-neutral-500">Add items to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} compact />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-neutral-100 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">Subtotal</span>
              <span className="text-base font-semibold text-neutral-900">{formatKES(total)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button variant="primary" className="w-full">
                Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}