'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, ShoppingBag } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useUIStore } from '../../store/ui.store'
import { useRouter } from 'next/navigation'
import type { UIState } from '../../store/ui.store'
import { formatKES, formatUSD } from '../../lib/utils/currency'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export interface ProductCardData {
  _id: string
  name: string
  slug: string
  price: number
  /**
   * Optional pre-discount price, in the same smallest-currency-unit as
   * `price`. When present and greater than `price`, the card renders a
   * "was / now" markdown treatment with a percent-off ribbon. This field
   * does not exist on the Product model yet — add `originalPrice?: number`
   * there (and to createProductSchema) to actually populate it; until then
   * this simply renders the regular, non-discounted price, unchanged.
   */
  originalPrice?: number
  currency: 'KES' | 'USD'
  images: string[]
  stock: number
  category: string
}

interface ProductCardProps {
  product: ProductCardData
  showAddToCart?: boolean
}

/**
 * Displays a product's image, category, name, price (with optional
 * markdown/discount treatment), stock status, and an "Add to cart" button.
 * Clicking the card (outside the button) navigates to the product's
 * detail page.
 */
export function ProductCard({ product, showAddToCart = true }: ProductCardProps): React.ReactNode {
  const { addItem: addToCart } = useCart()
  const showToast = useUIStore((state: UIState) => state.showToast)
  const router = useRouter()

  const format = (amount: number) =>
    product.currency === 'KES' ? formatKES(amount) : formatUSD(amount)

  const formattedPrice = format(product.price)

  const hasDiscount =
    typeof product.originalPrice === 'number' && product.originalPrice > product.price

  const formattedOriginalPrice = hasDiscount ? format(product.originalPrice as number) : null

  const percentOff = hasDiscount
    ? Math.round((1 - product.price / (product.originalPrice as number)) * 100)
    : 0

  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = (e: React.MouseEvent): void => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock || !showAddToCart) return

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0] ?? '',
      slug: product.slug,
      stock: product.stock
    })

    showToast(`${product.name} added to cart`, 'success')
  }

  // Stock badge and discount ribbon are mutually exclusive corners of the
  // image: stock badge top-left, discount ribbon top-right, so both can
  // coexist without overlapping.
  const stockBadge = isOutOfStock ? (
    <Badge variant="neutral">Out of stock</Badge>
  ) : isLowStock ? (
    <Badge variant="warning">Only {product.stock} left</Badge>
  ) : null

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-rose-100/70 bg-white
        shadow-[0_4px_20px_-2px_rgba(219,39,119,0.08),0_2px_8px_-1px_rgba(219,39,119,0.06)]
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_12px_32px_-4px_rgba(219,39,119,0.18),0_4px_12px_-2px_rgba(219,39,119,0.10)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-rose-50 via-rose-50/60 to-amber-50">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={`${product.name} — ${product.category}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-rose-200"
            role="img"
            aria-label={`${product.name} — no image available`}
          >
            <ShoppingBag className="h-10 w-10" aria-hidden="true" />
          </div>
        )}

        {/* Subtle top-down sheen, like glass or a polished compact mirror */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent" />

        {stockBadge && (
          <div className="absolute left-2 top-2">{stockBadge}</div>
        )}

        {hasDiscount && (
          <div
            className="absolute -right-1 -top-1 flex items-center gap-1 rounded-bl-xl rounded-tr-xl
              bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-1.5
              text-[11px] font-semibold uppercase tracking-wide text-white
              shadow-[0_2px_8px_rgba(219,39,119,0.35)]"
            aria-label={`${percentOff} percent off`}
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {percentOff}% off
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
          {product.category}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
          {product.name}
        </h3>

        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <p
              className="text-base font-semibold text-rose-600"
              aria-label={`Price: ${formattedPrice}`}
            >
              {formattedPrice}
            </p>
            {hasDiscount && formattedOriginalPrice && (
              <p
                className="text-xs text-neutral-400 line-through"
                aria-label={`Original price: ${formattedOriginalPrice}`}
              >
                {formattedOriginalPrice}
              </p>
            )}
          </div>
          {!isOutOfStock && (
            <p className="text-xs text-neutral-400">{product.stock} in stock</p>
          )}
        </div>

        {showAddToCart ? (
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            variant="primary"
            size="sm"
            className="mt-auto w-full bg-gradient-to-r from-rose-500 to-pink-500 transition-transform hover:scale-[1.02] hover:from-rose-600 hover:to-pink-600 disabled:from-neutral-300 disabled:to-neutral-300 disabled:hover:scale-100"
            aria-label={
              isOutOfStock
                ? `${product.name} is out of stock`
                : `Add ${product.name} to cart`
            }
          >
            {isOutOfStock ? 'Out of stock' : 'Add to cart'}
          </Button>
        ) : (
          <div className="mt-auto">
            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/products/${encodeURIComponent(product.slug)}`)
              }}
              variant="secondary"
              size="sm"
              className="w-full"
              aria-label={`View details for ${product.name}`}
            >
              View product
            </Button>
          </div>
        )}
      </div>
    </Link>
  )
}