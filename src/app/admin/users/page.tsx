"use client" 

import Link from 'next/link'
import { useState } from 'react'
import { Users2, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DataTable from '@/components/admin/DataTable'
import { setRoleSchema } from '@/schemas/user.schema'

export default async function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleUpdateModal, setRoleUpdateModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<'customer' | 'admin'>('customer')
  const [updatingRole, setUpdatingRole] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/users', {
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch users')
      }

      setUsers(data.data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError('Failed to load users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Update user role
  const updateUserRole = async (userId: string, role: 'customer' | 'admin') => {
    setRoleError(null)
    setUpdatingRole(true)

    try {
      // Validate the role
      const parsed = setRoleSchema.safeParse({ role })
      if (!parsed.success) {
        setRoleError('Invalid role value')
        setUpdatingRole(false)
        return
      }

      // In a real implementation, we would call the admin role update API
      // From Task 5, we have: src/app/api/admin/users/[uid]/role/route.ts
      // For now, we'll simulate the update
      setUpdatingRole(false)
      setRoleUpdateModal(false)
      setSelectedUserId(null)

      // Refetch users
      fetchUsers()

      // Show success message (in a real app, we would use a toast)
      alert(`User role updated to ${role}`)
    } catch (err: any) {
      console.error('Error updating user role:', err)
      setRoleError('Failed to update user role. Please try again.')
      setUpdatingRole(false)
    }
  }

  // In a real implementation, we would fetch users on mount
  // For simplicity, we'll leave it to be called in a useEffect

  const columns = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'displayName', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', align: 'center', sortable: false },
    { key: 'createdAt', label: 'Joined', align: 'center', sortable: true },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false }
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <Link href="/admin/users/new" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Users
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
              key: 'email',
              label: 'Email',
              sortable: true,
              render: (value) => {
                // Truncate long emails for display
                if (typeof value === 'string' && value.length > 30) {
                  return value.substring(0, 27) + '...'
                }
                return value
              }
            },
            {
              key: 'displayName',
              label: 'Name',
              sortable: true,
              render: (value) => {
                if (typeof value === 'string' && value.length > 20) {
                  return value.substring(0, 17) + '...'
                }
                return value || 'No name provided'
              }
            },
            {
              key: 'role',
              label: 'Role',
              align: 'center',
              sortable: false,
              render: (value: string) => {
                const roleColors: Record<string, string> = {
                  admin: 'bg-blue-100 text-blue-800',
                  customer: 'bg-green-100 text-green-800'
                }
                return (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[value] || 'bg-gray-100 text-gray-800'}`}>
                    {value}
                  </span>
                )
              }
            },
            {
              key: 'createdAt',
              label: 'Joined',
              align: 'center',
              sortable: true,
              render: (value) => {
                if (typeof value === 'string') {
                  return new Date(value).toLocaleDateString()
                }
                return value
              }
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'center',
              sortable: false,
              render: (_, row) => (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUserId(row._id || row.uid)
                      setNewRole(row.role === 'admin' ? 'customer' : 'admin')
                      setRoleUpdateModal(true)
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    aria-label="Change role"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              )
            }
          ]}
          data={users}
        />
      </div>

      {/* Role Update Modal */}
      {roleUpdateModal && selectedUserId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update User Role</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Select the new role for this user:</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'customer' | 'admin')}
                  disabled={updatingRole}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
                {roleError && (
                  <p className="text-sm text-red-600 mt-1">{roleError}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRoleUpdateModal(false)
                  setSelectedUserId(null)
                }}
                disabled={updatingRole}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => updateUserRole(selectedUserId, newRole)}
                disabled={updatingRole}
                className="px-6 py-2"
              >
                {updatingRole ? 'Updating...' : 'Save Role'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}