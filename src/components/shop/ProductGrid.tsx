import { ProductCard } from './ProductCard'
import type { ProductCardData } from './ProductCard'

interface ProductGridProps {
  products: ProductCardData[]
  loading?: boolean
  showAddToCart?: boolean
}

const SKELETON_COUNT = 8

/**
 * Responsive grid of product cards: 2 columns on mobile, 3 on tablet,
 * 4 on desktop. Shows skeleton placeholders while `loading` is true.
 */
export function ProductGrid({ products, loading = false, showAddToCart = true }: ProductGridProps): React.ReactNode {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="aspect-square w-full animate-pulse bg-pink-50" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-white py-16 text-center">
        <p className="text-sm font-medium text-neutral-900">No products found</p>
        <p className="mt-1 text-sm text-neutral-500">Try adjusting your search or filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} showAddToCart={showAddToCart} />
      ))}
    </div>
  )
}
