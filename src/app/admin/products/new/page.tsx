import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'

export default function AdminProductsNewPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
        <Link href="/admin/products" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm />
      </div>
    </div>
  )
}