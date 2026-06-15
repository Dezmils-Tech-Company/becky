import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminProductEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <div className="flex space-x-3">
          <Link href="/admin/products" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Products
          </Link>
          <Link href={`/admin/products/${params.id}`} className="btn-primary px-4 py-2 text-sm">
            View
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm productId={params.id} />
      </div>
    </div>
  )
}