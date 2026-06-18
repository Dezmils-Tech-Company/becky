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
            Beauty <span className="text-neutral-900">Hive</span>
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative aspect-[4/5] sm:aspect-[16/7] w-full border-b border-neutral-100 bg-[url('/WhatsApp%20Image%202026-06-18%20at%2010.52.37.jpeg')] bg-cover bg-center bg-no-repeat">
        {/* Subtle gradient overlay for CTA legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

        {/* CTA Buttons - Positioned at bottom */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-pink-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 sm:px-8 sm:py-3 sm:text-base"
          >
            Shop now
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20 sm:px-8 sm:py-3 sm:text-base"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="flex-1 px-6 py-12 sm:py-16 pb-32">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-2xl font-bold text-neutral-900">Featured Products</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Shop with the best today.
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