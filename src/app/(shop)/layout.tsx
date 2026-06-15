import { CartDrawer } from '../../components/shop/CartDrawer'
import { BottomNav } from '@/components/layout/BottomNav'

export default function ShopLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">{children}</main>
      <CartDrawer />
      <BottomNav />
    </div>
  )
}