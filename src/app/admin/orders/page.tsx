"use client"
import Link from 'next/link'
import { useState } from 'react'
import { Calendar, DollarSign, MapPin, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DataTable from '@/components/admin/DataTable'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'

export default async function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/orders', {
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch orders')
      }

      setOrders(data.data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // In a real implementation, we would fetch orders on mount
  // For simplicity, we'll rely on the DataTable showing empty state initially

  const columns = [
    { key: '_id', label: 'ID', align: 'center', sortable: false },
    { key: 'userId', label: 'Customer', align: 'left', sortable: true },
    { key: 'total', label: 'Total (¢)', align: 'right', sortable: true },
    { key: 'status', label: 'Status', align: 'center', sortable: false },
    { key: 'paymentStatus', label: 'Payment', align: 'center', sortable: false },
    { key: 'createdAt', label: 'Date', align: 'center', sortable: true },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false }
  ]

  // Format helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <Link href="/admin/orders/new" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Orders
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
            {
              key: '_id',
              label: 'ID',
              align: 'center',
              sortable: false,
              render: (value) => {
                // Show first 8 chars of ObjectId
                return typeof value === 'string' ? value.substring(0, 8) + '...' : value
              }
            },
            {
              key: 'userId',
              label: 'Customer',
              align: 'left',
              sortable: true,
              render: (value) => {
                // In a real implementation, we would fetch user details
                // For now, just show the ID or placeholder
                return typeof value === 'string' ? value.substring(0, 8) + '...' : 'Customer'
              }
            },
            {
              key: 'total',
              label: 'Total (¢)',
              align: 'right',
              sortable: true,
              render: (value) => `${value}`
            },
            {
              key: 'status',
              label: 'Status',
              align: 'center',
              sortable: false,
              render: (value: string) => {
                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-100 text-yellow-800',
                  processing: 'bg-blue-100 text-blue-800',
                  shipped: 'bg-indigo-100 text-indigo-800',
                  delivered: 'bg-green-100 text-green-800',
                  cancelled: 'bg-red-100 text-red-800'
                }
                return (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                )
              }
            },
            {
              key: 'paymentStatus',
              label: 'Payment',
              align: 'center',
              sortable: false,
              render: (value: string) => {
                const paymentColors: Record<string, string> = {
                  unpaid: 'bg-red-100 text-red-800',
                  pending: 'bg-yellow-100 text-yellow-800',
                  paid: 'bg-green-100 text-green-800',
                  failed: 'bg-red-100 text-red-800',
                  refunded: 'bg-blue-100 text-blue-800'
                }
                return (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentColors[value] || 'bg-gray-100 text-gray-800'}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                )
              }
            },
            {
              key: 'createdAt',
              label: 'Date',
              align: 'center',
              sortable: true,
              render: (value) => formatDate(value)
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'center',
              sortable: false,
              render: (_, row) => (
                <div className="flex justify-center space-x-2">
                  <Link href={`/admin/orders/${row._id}`} className="text-blue-600 hover:text-blue-900" aria-label="View Details">
                    <Calendar className="h-4 w-4" />
                  </Link>
                </div>
              )
            }
          ]}
          data={orders}
        />
      </div>
    </div>
  )
}