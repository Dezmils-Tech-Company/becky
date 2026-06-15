'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Heart, Home, User, Menu, ListChecks } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'

export function BottomNav(): React.ReactNode {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const [showMenu, setShowMenu] = useState(false)

  const isActive = (path: string): boolean => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <>
      <nav className="fixed inset-x-4 bottom-4 z-50">
        <div className="relative mx-auto flex max-w-4xl items-center justify-center">
          <div className="flex w-full items-center justify-between rounded-[40px] border border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:px-6">
            <Link
              href="/"
              className={`flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-3xl px-3 py-2 text-[11px] font-semibold transition ${
                isActive('/')
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Home"
            >
              <Home size={22} />
              <span>Home</span>
            </Link>

            <Link
              href="/products"
              className={`flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-3xl px-3 py-2 text-[11px] font-semibold transition ${
                isActive('/products')
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Favourite"
            >
              <Heart size={22} />
              <span>Favourite</span>
            </Link>

            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <Link
                href="/cart"
                className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white shadow-[0_20px_50px_-18px_rgba(236,72,153,0.8)] transition ${
                  isActive('/cart')
                    ? 'bg-pink-600 text-white'
                    : 'bg-pink-500 text-white hover:bg-pink-600'
                }`}
                title="Cart"
              >
                <ShoppingBag size={28} />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-bold text-pink-600">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </div>

            <Link
              href="/orders"
              className={`flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-3xl px-3 py-2 text-[11px] font-semibold transition ${
                isActive('/orders')
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Orders"
            >
              <ListChecks size={22} />
              <span>Orders</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-3xl px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                title="Menu"
              >
                <Menu size={22} />
                <span>Menu</span>
              </button>

              {showMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-52 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/profile"
                        className="block rounded-2xl px-4 py-3 text-sm text-slate-900 transition hover:bg-slate-100"
                        onClick={() => setShowMenu(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="block rounded-2xl px-4 py-3 text-sm text-slate-900 transition hover:bg-slate-100"
                        onClick={() => setShowMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          logout()
                        }}
                        className="w-full rounded-2xl px-4 py-3 text-left text-sm text-rose-600 transition hover:bg-slate-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block rounded-2xl px-4 py-3 text-sm text-slate-900 transition hover:bg-slate-100"
                        onClick={() => setShowMenu(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="block rounded-2xl px-4 py-3 text-sm text-slate-900 transition hover:bg-slate-100"
                        onClick={() => setShowMenu(false)}
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="h-32 md:h-24" />
    </>
  )
}
