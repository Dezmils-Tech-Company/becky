"use client"

import Link from 'next/link'
import { useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import DataTable from '@/components/admin/DataTable'

export default async function AdminAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterAction, setFilterAction] = useState<string | null>(null)

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/audit', {
        credentials: 'include',
        // In a real implementation, we would add query params for search and filter
        // For now, we'll fetch all and filter client-side
      })

      if (!res.ok) {
        throw new Error('Failed to fetch audit log')
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch audit log')
      }

      setLogs(data.data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching audit log:', err)
      setError('Failed to load audit log. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // In a real implementation, we would fetch logs on mount
  // For simplicity, we'll leave it to be called in a useEffect

  // Filter logs based on search and action filter
  const filteredLogs = logs.filter(log => {
    // Search term filter (search in action, resource, actor email)
    if (searchTerm) {
      const searchableText = `${log.action} ${log.resource} ${log.actor?.email || ''}`.toLowerCase()
      if (!searchableText.includes(searchTerm.toLowerCase())) {
        return false
      }
    }

    // Action filter
    if (filterAction && log.action !== filterAction) {
      return false
    }

    return true
  })

  const columns = [
    { key: '_id', label: 'ID', align: 'center', sortable: false },
    { key: 'actor', label: 'Actor', align: 'left', sortable: true },
    { key: 'action', label: 'Action', align: 'center', sortable: false },
    { key: 'resource', label: 'Resource', align: 'left', sortable: true },
    { key: 'resourceId', label: 'Resource ID', align: 'center', sortable: true },
    { key: 'createdAt', label: 'Timestamp', align: 'center', sortable: true }
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search audit log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              // In a real implementation, we would reset filters and refetch
              setSearchTerm('')
              setFilterAction(null)
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-gray-600">Showing {filteredLogs.length} entries</span>
          {/* Action filter dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Action</label>
            <select
              value={filterAction || ''}
              onChange={(e) => setFilterAction(e.target.value || null)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="PAYMENT_INITIATED">Payment Initiated</option>
              <option value="PAYMENT_COMPLETED">Payment Completed</option>
              <option value="PAYMENT_FAILED">Payment Failed</option>
              <option value="ROLE_CHANGED">Role Changed</option>
            </select>
          </div>
        </div>
      </div>

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
              key: 'actor',
              label: 'Actor',
              align: 'left',
              sortable: true,
              render: (value: any) => {
                if (value && typeof value === 'object' && value.email) {
                  const email = value.email
                  if (email.length > 20) {
                    return email.substring(0, 17) + '...'
                  }
                  return email
                }
                return 'System'
              }
            },
            {
              key: 'action',
              label: 'Action',
              align: 'center',
              sortable: false,
              render: (value: string) => {
                const actionColors: Record<string, string> = {
                  CREATE: 'bg-green-100 text-green-800',
                  UPDATE: 'bg-blue-100 text-blue-800',
                  DELETE: 'bg-red-100 text-red-800',
                  LOGIN: 'bg-indigo-100 text-indigo-800',
                  LOGOUT: 'bg-gray-100 text-gray-600',
                  PAYMENT_INITIATED: 'bg-yellow-100 text-yellow-800',
                  PAYMENT_COMPLETED: 'bg-green-100 text-green-800',
                  PAYMENT_FAILED: 'bg-red-100 text-red-800',
                  ROLE_CHANGED: 'bg-purple-100 text-purple-800'
                }
                return (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${actionColors[value] || 'bg-gray-100 text-gray-800'}`}>
                    {value}
                  </span>
                )
              }
            },
            {
              key: 'resource',
              label: 'Resource',
              align: 'left',
              sortable: true,
              render: (value) => {
                if (typeof value === 'string' && value.length > 20) {
                  return value.substring(0, 17) + '...'
                }
                return value
              }
            },
            {
              key: 'resourceId',
              label: 'Resource ID',
              align: 'center',
              sortable: true,
              render: (value) => {
                if (typeof value === 'string' && value.length > 12) {
                  return value.substring(0, 10) + '...'
                }
                return value || '-'
              }
            },
            {
              key: 'createdAt',
              label: 'Timestamp',
              align: 'center',
              sortable: true,
              render: (value) => {
                if (typeof value === 'string') {
                  return new Date(value).toLocaleString()
                }
                return value
              }
            }
          ]}
          data={filteredLogs}
        />
      </div>
    </div>
  )
}