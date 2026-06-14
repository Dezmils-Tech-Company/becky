'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useUIStore } from '../../store/ui.store'
import type { CartState } from '../../store/cart.store'
import type { UIState } from '../../store/ui.store'
import { formatKES, formatUSD } from '../../lib/utils/currency'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export interface ProductCardData {
  _id: string
  name: string
  slug: string
  price: number
  currency: 'KES' | 'USD'
  images: string[]
  stock: number
  category: string
}

interface ProductCardProps {
  product: ProductCardData
}

/**
 * Displays a product's image, name, price, stock status, and an
 * "Add to cart" button. Clicking the card (outside the button) navigates
 * to the product's detail page.
 */
export function ProductCard({ product }: ProductCardProps): React.ReactNode {
  const { addItem: addToCart } = useCart()
  const showToast = useUIStore((state: UIState) => state.showToast)

  const formattedPrice =
    product.currency === 'KES' ? formatKES(product.price) : formatUSD(product.price)

  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = (e: React.MouseEvent): void => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) return

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

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-pink-50">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-pink-200">
            <ShoppingBag className="h-10 w-10" aria-hidden="true" />
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute left-2 top-2">
            <Badge variant="neutral">Out of stock</Badge>
          </div>
        )}
        {isLowStock && (
          <div className="absolute left-2 top-2">
            <Badge variant="warning">Only {product.stock} left</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-400">{product.category}</p>
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">{product.name}</h3>
        <p className="text-base font-semibold text-pink-600">{formattedPrice}</p>

        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          variant="primary"
          size="sm"
          className="mt-auto w-full"
        >
          {isOutOfStock ? 'Out of stock' : 'Add to cart'}
        </Button>
      </div>
    </Link>
  )
}