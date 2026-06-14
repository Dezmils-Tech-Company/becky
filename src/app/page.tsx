export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between w-full px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Beckie E-Commerce</h1>
        <nav className="space-x-4">
          <a href="/products" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Products</a>
          <a href="/cart" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Cart</a>
        </nav>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">
          Welcome to Beckie E-Commerce
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          A modern, full-stack e-commerce platform built with Next.js 14, Firebase Authentication,
          MongoDB, and integrated payment systems including M-Pesa and Stripe.
        </p>

        <div className="flex flex-col items-center mt-12 space-x-4 space-y-6 sm:flex-row">
          <a href="/products"
             className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600">
            Browse Products
          </a>
          <a href="/register"
             className="border border-primary-600 hover:bg-primary-50 text-primary-600 hover:text-primary-800 font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-primary-500 dark:hover:bg-primary-50 dark:hover:text-primary-100">
            Sign Up
          </a>
        </div>

        <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with Next.js 14 • Firebase • MongoDB • M-Pesa • Stripe</p>
        </div>
      </div>
    </main>
  )
}