'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X, ShoppingBag } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { formatKES } from '../../lib/utils/currency'
import type { CartItem as CartItemType } from '../../store/cart.store'

interface CartItemProps {
  item: CartItemType
  /** Compact mode for the drawer; full mode for the /cart page. */
  compact?: boolean
}

/**
 * A single cart line: product image, name, quantity stepper, remove
 * button, and line total.
 */
export function CartItem({ item, compact = false }: CartItemProps): React.ReactNode {
  const { updateQuantity, removeItem } = useCart()

  const lineTotal = item.price * item.quantity
  const atMaxStock = item.quantity >= item.stock

  return (
    <div className="flex gap-3 py-3">
      <Link
        href={`/products/${item.slug}`}
        className="relative flex-shrink-0 overflow-hidden rounded-lg bg-pink-50"
        style={{ width: compact ? 64 : 80, height: compact ? 64 : 80 }}
      >
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex h-full items-center justify-center text-pink-200">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            className="line-clamp-2 text-sm font-medium text-neutral-900 hover:text-pink-600"
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            aria-label={`Remove ${item.name} from cart`}
            className="flex-shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:bg-pink-50 hover:text-pink-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-md border border-neutral-200">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              aria-label={`Decrease quantity of ${item.name}`}
              className="flex h-7 w-7 items-center justify-center text-neutral-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="w-6 text-center text-sm font-medium" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={atMaxStock}
              aria-label={`Increase quantity of ${item.name}`}
              className="flex h-7 w-7 items-center justify-center text-neutral-600 transition-colors hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <p className="text-sm font-semibold text-neutral-900">{formatKES(lineTotal)}</p>
        </div>

        {atMaxStock && (
          <p className="text-xs text-amber-600">Max available stock reached</p>
        )}
      </div>
    </div>
  )
}