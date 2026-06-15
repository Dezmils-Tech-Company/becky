import { useState } from 'react'
import type { ReactNode } from 'react'

type DataTableColumnKey<T> = Extract<keyof T, string | number>

interface DataTableProps<T> {
  columns: Array<{
    key: DataTableColumnKey<T>
    label: string
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
    render?: (value: T[DataTableColumnKey<T>], row: T) => ReactNode
  }>
  data: T[]
  onSortChange?: (key: DataTableColumnKey<T>, direction: 'asc' | 'desc') => void
  initialSort?: {
    key: DataTableColumnKey<T>
    direction: 'asc' | 'desc'
  }
}

export default function DataTable<T>({
  columns,
  data,
  onSortChange,
  initialSort
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  } | null>(initialSort ?? null)

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig?.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleSort = (key: DataTableColumnKey<T>) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    onSortChange?.(key, direction)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center text-left w-full"
                  >
                    <span className="mr-2">{column.label}</span>
                    {sortConfig?.key === column.key && (
                      <span className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}>
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                ) : (
                  <span className="mr-2">{column.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((column) => {
                const value = row[column.key]
                const rendered: ReactNode = column.render ? column.render(value, row) : (value as ReactNode)

                return (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {rendered}
                  </td>
                )
              })}
            </tr>
          ))}
          {sortedData.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-gray-500"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}