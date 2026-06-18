
import StatsCard from '@/components/admin/StatsCard'
import { BarChart2, DollarSign, AlertCircle, Package } from 'lucide-react'
import { getAdminStats } from '@/lib/admin/get-admin-stats'

export default async function AdminPage() {
  // AdminLayout already verified the session and admin role for this route tree,
  // so we can call the stats logic directly — no HTTP round-trip, no cookie
  // forwarding needed.
  const { totalOrdersToday, revenueToday, pendingOrders, totalProducts } = await getAdminStats()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Orders Today"
          value={totalOrdersToday}
          icon={BarChart2}
          color="blue"
          trend={{ label: 'vs yesterday', value: 12, isUp: true }}
        />
        <StatsCard
          title="Revenue Today"
          value={revenueToday}
          icon={DollarSign}
          color="green"
          trend={{ label: 'vs yesterday', value: 8, isUp: true }}
        />
        <StatsCard
          title="Pending Orders"
          value={pendingOrders}
          icon={AlertCircle}
          color="yellow"
          trend={{ label: 'vs yesterday', value: -5, isUp: false }}
        />
        <StatsCard
          title="Active Products"
          value={totalProducts}
          icon={Package}
          color="blue"
          trend={{ label: 'vs last week', value: 3, isUp: true }}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <a href="/admin/products/new" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Add New Product</h3>
            <p className="text-sm text-gray-600">Create a new product listing</p>
          </a>
          <a href="/admin/orders" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Manage Orders</h3>
            <p className="text-sm text-gray-600">View and update order statuses</p>
          </a>
          <a href="/admin/users" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600">View and update user roles</p>
          </a>
          <a href="/admin/audit-log" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">View Audit Log</h3>
            <p className="text-sm text-gray-600">Monitor system activities</p>
          </a>
        </div>
      </div>
    </div>
  )
}