import Link from 'next/link'
import { env } from '@/config/env'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { BottomNav } from '@/components/layout/BottomNav'
import type { ProductCardData } from '@/components/shop/ProductCard'

async function fetchFeaturedProducts(): Promise<ProductCardData[]> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/products?limit=12`, {
      cache: 'no-store'
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Failed to fetch featured products:', error)
    return []
  }
}

export default async function Home(): Promise<React.ReactNode> {
  const products = await fetchFeaturedProducts()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Minimal Header */}
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-pink-600">
            Becky <span className="text-neutral-900">Hive</span>
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-neutral-100 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold text-neutral-900 sm:text-5xl">
            Explore Our Collection
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Browse thousands of products. Add to cart and checkout with confidence.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg bg-pink-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-pink-700"
            >
              Start Shopping
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-8 py-3 text-base font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="flex-1 px-6 py-12 sm:py-16 pb-32">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-2xl font-bold text-neutral-900">Featured Products</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Add items to your cart. Sign in only at checkout to complete payment.
          </p>

          <div className="mt-8">
            <ProductGrid products={products} showAddToCart={true} />
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  )
}
