import { connectDB } from '@/lib/mongodb/client'
import { Order } from '@/models/Order'
import { Product } from '@/models/Product'

export interface AdminStats {
  totalOrdersToday: number
  revenueToday: number
  pendingOrders: number
  totalProducts: number
}

/**
 * Computes today's dashboard stats directly against MongoDB.
 * Server-only — safe to call from Server Components, layouts, or route handlers.
 * Callers are responsible for their own auth/role checks before calling this.
 */
export async function getAdminStats(): Promise<AdminStats> {
  await connectDB()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [totalOrdersToday, revenueToday, pendingOrders, totalProducts] = await Promise.all([
    Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled'] }
    }),

    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $nin: ['cancelled'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).then((result) => result[0]?.total ?? 0),

    Order.countDocuments({
      status: { $in: ['pending', 'processing'] }
    }),

    Product.countDocuments({ isActive: true })
  ])

  return { totalOrdersToday, revenueToday, pendingOrders, totalProducts }
}