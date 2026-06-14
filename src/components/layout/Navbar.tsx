'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { ShoppingBag, User, LogOut, Package, UserCircle, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useUIStore } from '../../store/ui.store'
import type { UIState } from '../../store/ui.store'
import { PageWrapper } from './PageWrapper'
import { Button } from '../ui/Button'

/**
 * Site header: logo, nav links, cart icon with item-count badge, and an
 * account menu (sign in / user dropdown with profile, orders, sign out).
 */
export function Navbar(): React.ReactNode {
  const { user, logout, isLoading } = useAuth()
  const { itemCount } = useCart()
  const toggleCart = useUIStore((state: UIState) => state.toggleCart)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return (): void => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white">
      <PageWrapper className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-neutral-900">
            Becky <span className="text-pink-600">Hive</span>
          </Link>

          <nav className="hidden sm:block" aria-label="Main">
            <Link
              href="/products"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-pink-600"
            >
              Shop
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleCart}
            aria-label={`Open cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
            className="relative rounded-md p-2 text-neutral-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-600 px-1 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </button>

          {!isLoading && !user && (
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign in
              </Button>
            </Link>
          )}

          {!isLoading && user && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label="Account menu"
                aria-expanded={isMenuOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-pink-600 transition-colors hover:bg-pink-100"
              >
                <User className="h-4 w-4" aria-hidden="true" />
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-11 w-48 rounded-lg border border-neutral-100 bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                >
                  <div className="border-b border-neutral-100 px-3 py-2">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {user.displayName || user.email}
                    </p>
                    <p className="truncate text-xs text-neutral-400">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
                  >
                    <UserCircle className="h-4 w-4" aria-hidden="true" />
                    Dashboard
                  </Link>
                  <Link
                    href="/orders"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
                  >
                    <Package className="h-4 w-4" aria-hidden="true" />
                    Orders
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false)
                      void logout()
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileNavOpen}
            className="rounded-md p-2 text-neutral-600 transition-colors hover:bg-pink-50 hover:text-pink-600 sm:hidden"
          >
            {isMobileNavOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </PageWrapper>

      {isMobileNavOpen && (
        <nav aria-label="Mobile" className="border-t border-neutral-100 sm:hidden">
          <PageWrapper className="flex flex-col py-2">
            <Link
              href="/products"
              onClick={() => setIsMobileNavOpen(false)}
              className="py-2 text-sm font-medium text-neutral-600 hover:text-pink-600"
            >
              Shop
            </Link>
          </PageWrapper>
        </nav>
      )}
    </header>
  )
}