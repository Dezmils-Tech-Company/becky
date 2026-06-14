import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import { CartDrawer } from '../../components/shop/CartDrawer'

export default function ShopLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  )
}