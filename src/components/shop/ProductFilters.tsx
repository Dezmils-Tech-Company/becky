'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Input } from '../ui/Input'

interface ProductFiltersProps {
  initialCategory?: string
  initialSearch?: string
}

const CATEGORIES = ['All', 'Skincare', 'Fragrance', 'Bath & Body', 'Hair Accessories','Outfit and clothing']

/**
 * Sidebar with a category filter and search input. Updates the URL's
 * query params, which the server component re-fetches against.
 */
export function ProductFilters({ initialCategory, initialSearch }: ProductFiltersProps): React.ReactNode {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState(initialSearch ?? '')

  const updateParams = (updates: Record<string, string | undefined>): void => {
    const params = new URLSearchParams()
    if (updates.category !== undefined && updates.category !== 'All') {
      params.set('category', updates.category)
    } else if (initialCategory && updates.category === undefined) {
      params.set('category', initialCategory)
    }

    if (updates.search !== undefined && updates.search.length > 0) {
      params.set('search', updates.search)
    } else if (initialSearch && updates.search === undefined) {
      params.set('search', initialSearch)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    updateParams({ search })
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSearchSubmit}>
        <Input
          type="search"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
      </form>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-neutral-900">Category</h2>
        <ul className="flex flex-col gap-1">
          {CATEGORIES.map((category) => {
            const isActive =
              (category === 'All' && !initialCategory) || initialCategory === category
            return (
              <li key={category}>
                <button
                  type="button"
                  onClick={() => updateParams({ category, search: initialSearch })}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-pink-50/50 font-medium text-pink-600'
                      : 'text-neutral-700 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  {category}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}