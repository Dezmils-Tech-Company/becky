'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Heart, Home, ArrowRight, Menu, ListChecks } from 'lucide-react'
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
        <div className="relative mx-auto flex max-w-4xl items-center justify-center rounded-2xl ">
          <div className="flex w-full items-center justify-between rounded-3xl  border border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:px-6">
            <Link
              href="/"
              className={`flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-full border-4 border-white shadow-[0_0_10px_0px_rgba(0.02,0.2,0.2,0.2)] px-3 py-2 text-[11px] font-semibold transition ${
                isActive('/')
                    ? 'bg-pink-600 text-white absolute '
                    : 'bg-slate-100 text-pink-600 hover:bg-slate-200'
                }`}
              title="Home"
            >
              <Home size={22} />
            </Link>

            <Link
              href="/products"
              className={`flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-full border-4 border-white shadow-[0_0_10px_0px_rgba(0.02,0.2,0.2,0.2)] px-3 py-2 text-[11px] font-semibold transition ${
                isActive('/products')
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-100 text-pink-600 hover:bg-slate-200'
                }`}
              title="Favourite"
            >
              <Heart size={22} />
            </Link>

             <Link
                href="/cart"
                className={`flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-full border-4 border-white shadow-[0_0_10px_0px_rgba(0.02,0.2,0.2,0.2)] px-3 py-2 text-[11px] font-semibold transition ${
                isActive('/cart')
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-100 text-pink-600 hover:bg-slate-200'
                }`}
                title="Cart"
              >
                <ShoppingBag size={22} />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-bold text-pink-600">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            

            <Link
              href="/orders"
              className={`flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-full border-4 border-white shadow-[0_0_10px_0px_rgba(0.02,0.2,0.2,0.2)] px-3 py-2 text-[11px] font-semibold transition ${
                isActive('/orders')
                    ? 'bg-pink-600 text-white '
                    : 'bg-slate-100 text-pink-600 hover:bg-slate-200'
                }`}
              title="Orders"
            >
              <ListChecks size={22} />
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-full border-4 border-white shadow-[0_0_10px_0px_rgba(0.02,0.2,0.2,0.2)] px-3 py-2 text-[11px] font-semibold transition "
                title="Menu"
              >
                <Menu size={22} />
              </button>

              {showMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
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
                        className="flex gap-2 rounded-2xl px-4 py-3 text-sm m-1 text-slate-900 transition bg-slate-100 hover:bg-slate-100/30 border border-1 border-pink-100"
                        onClick={() => setShowMenu(false)}
                      >
                        Sign In <ArrowRight/>
                      </Link>
                      <Link
                        href="/register"
                        className="block rounded-2xl px-4 py-3 text-sm m-1 text-slate-900 transition bg-slate-100 hover:bg-slate-100/30 border border-1 border-pink-100"
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
