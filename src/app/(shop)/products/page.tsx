import { ProductGrid } from '../../../components/shop/ProductGrid'
import { ProductFilters } from '../../../components/shop/ProductFilters'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import type { ProductCardData } from '../../../components/shop/ProductCard'
import { env } from '../../../config/env'

interface ProductsResponse {
  success: boolean
  data: ProductCardData[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}

async function getProducts(params: { category?: string; search?: string; page?: string }): Promise<ProductsResponse> {
  const query = new URLSearchParams()
  if (params.category) query.set('category', params.category)
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page)

  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/products?${query.toString()}`, {
    cache: 'no-store'
  })

  if (!res.ok) {
    return { success: false, data: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } }
  }

  return res.json()
}

export default async function ProductsPage({ searchParams }: ProductsPageProps): Promise<React.ReactNode> {
  const params = await searchParams
  const { data: products } = await getProducts(params)

  return (
    <PageWrapper className="py-8">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Shop</h1>

      <div className="flex flex-col gap-6 sm:flex-row">
        <aside className="w-full sm:w-56">
          <ProductFilters
            initialCategory={params.category}
            initialSearch={params.search}
          />
        </aside>

        <div className="flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </PageWrapper>
  )
}