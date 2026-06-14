import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProductDetail } from '../../../../components/shop/ProductDetail'
import { PageWrapper } from '../../../../components/layout/PageWrapper'
import { env } from '../../../../config/env'
import type { ProductCardData } from '../../../../components/shop/ProductCard'

interface ProductDetailData extends ProductCardData {
  _id: string
  description: string
}

interface ProductResponse {
  success: boolean
  data?: ProductDetailData
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<ProductDetailData | null> {
  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/products/${slug}`, {
    cache: 'no-store'
  })

  if (!res.ok) return null

  const json: ProductResponse = await res.json()
  return json.data ?? null
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: 'Product not found' }
  }

  return {
    title: `${product.name} | Becky Hive`,
    description: product.description.slice(0, 160)
  }
}

export default async function ProductPage({ params }: ProductPageProps): Promise<React.ReactNode> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  return (
    <PageWrapper className="py-8">
      <ProductDetail product={product} />
    </PageWrapper>
  )
}