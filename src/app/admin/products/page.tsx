"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Trash2, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DataTable from '@/components/admin/DataTable'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/products', {
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch products')
      }

      setProducts(data.data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError('Failed to load products. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Load products on mount. This was previously defined but never called —
  // the page always rendered an empty list regardless of what was in the
  // database. A Client Component can't be `async` itself (that's a Server
  // Component-only feature), so data fetching here has to go through an
  // effect instead.
  useEffect(() => {
    fetchProducts()
  }, [])

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'price', label: 'Price', align: 'right', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'stock', label: 'Stock', align: 'center', sortable: true },
    { key: 'isActive', label: 'Status', align: 'center', sortable: false },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false }
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <Link href="/admin/products/new" className="btn-primary px-6 py-2">
          <Button>New Product</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'price', label: 'Price (¢)', align: 'right', sortable: true, render: (value) => `${value}` },
            { key: 'category', label: 'Category', sortable: true },
            { key: 'stock', label: 'Stock', align: 'center', sortable: true },
            {
              key: 'isActive',
              label: 'Status',
              align: 'center',
              sortable: false,
              render: (value) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {value ? 'Active' : 'Inactive'}
                </span>
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'center',
              sortable: false,
              render: (_, row) => (
                <div className="flex justify-center space-x-2">
                  <Link href={`/admin/products/${row._id}`} className="text-blue-600 hover:text-blue-900" aria-label="Edit product">
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this product?')) {
                        // In a real implementation, we would call the delete API
                        alert('Delete functionality would be implemented here')
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                    aria-label="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            }
          ]}
          data={products}
        />
      </div>
    </div>
  )
}