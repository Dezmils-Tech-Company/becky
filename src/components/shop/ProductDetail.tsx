'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag, Minus, Plus } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useUIStore } from '../../store/ui.store'
import { formatKES, formatUSD } from '../../lib/utils/currency'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface ProductDetailData {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  currency: 'KES' | 'USD'
  images: string[]
  stock: number
  category: string
}

interface ProductDetailProps {
  product: ProductDetailData
}

/**
 * Product detail view: image gallery, name, price, stock status,
 * description, and quantity selector with "Add to cart".
 */
export function ProductDetail({ product }: ProductDetailProps): React.ReactNode {
  const { addItem } = useCart()
  const showToast = useUIStore((state) => state.showToast)

  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const formattedPrice =
    product.currency === 'KES' ? formatKES(product.price) : formatUSD(product.price)

  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = (): void => {
    if (isOutOfStock) return

    addItem(
      {
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.images[0] ?? '',
        slug: product.slug,
        stock: product.stock
      },
      quantity
    )

    showToast(`${product.name} added to cart`, 'success')
    setQuantity(1)
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-pink-50">
          {product.images[activeImage] ? (
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-pink-200">
              <ShoppingBag className="h-16 w-16" aria-hidden="true" />
            </div>
          )}
        </div>

        {product.images.length > 1 && (
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1} of ${product.name}`}
                aria-current={activeImage === i}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border transition-colors ${
                  activeImage === i ? 'border-pink-500' : 'border-neutral-200'
                }`}
              >
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">{product.category}</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{product.name}</h1>
        </div>

        <p className="text-2xl font-semibold text-pink-600">{formattedPrice}</p>

        <div>
          {isOutOfStock && <Badge variant="neutral">Out of stock</Badge>}
          {isLowStock && <Badge variant="warning">Only {product.stock} left in stock</Badge>}
          {!isOutOfStock && !isLowStock && <Badge variant="success">In stock</Badge>}
        </div>

        <p className="text-sm leading-relaxed text-neutral-600">{product.description}</p>

        {!isOutOfStock && (
          <div className="flex items-center gap-1 self-start rounded-md border border-neutral-200">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center text-neutral-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-8 text-center text-sm font-medium" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center text-neutral-600 transition-colors hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
        >
          {isOutOfStock ? 'Out of stock' : 'Add to cart'}
        </Button>
      </div>
    </div>
  )
}