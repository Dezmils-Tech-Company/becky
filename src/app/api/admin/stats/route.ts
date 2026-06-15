import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { Order } from '@/models/Order'
import { Product } from '@/models/Product'
import { requireSession } from '@/lib/session/get-session'
import { User } from '@/models'

interface RouteParams {}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse> {
  try {
    // Check session and require admin role
    const session = await requireSession(request)
    await connectDB()
    const user = await User.findOne({ uid: session.uid })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 }
      )
    }

    // Get today's date at 00:00:00
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get tomorrow's date for range query
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Run queries in parallel
    const [
      totalOrdersToday,
      revenueToday,
      pendingOrders,
      totalProducts
    ] = await Promise.all([
      // Total orders today
      Order.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
        status: { $nin: ['cancelled'] } // Exclude cancelled orders from revenue
      }),

      // Revenue today (sum of totals for non-cancelled orders today)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: { $nin: ['cancelled'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' }
          }
        }
      ]).then(result => result[0]?.total ?? 0),

      // Pending orders (status: pending or processing)
      Order.countDocuments({
        status: { $in: ['pending', 'processing'] }
      }),

      // Total active products
      Product.countDocuments({ isActive: true })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalOrdersToday,
        revenueToday,
        pendingOrders,
        totalProducts
      }
    })
  } catch (error: unknown) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch statistics' }
      },
      { status: 500 }
    )
  }
}