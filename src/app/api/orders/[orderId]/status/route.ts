import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { Order } from '@/models/Order'
import { requireSession } from '@/lib/session/get-session'
import { User } from '@/models'
import { Types } from 'mongoose'

interface RouteParams {
  orderId: string
}

/**
 * GET /api/orders/[orderId]/status
 * Returns order status, payment status, payment method, and mpesaReceiptNumber if available.
 * Owner or admin only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse> {
  try {
    const session = await requireSession(request)
    await connectDB()

    const user = await User.findOne({ uid: session.uid })
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } },
        { status: 401 }
      )
    }

    const routeParams = await params
    const orderId = routeParams.orderId

    if (!Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid order ID' } },
        { status: 400 }
      )
    }

    const order = await Order.findById(orderId).lean()

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    // Check if user is owner or admin
    if (order.userId !== user.uid && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 }
      )
    }

    // Return only the necessary status fields
    const statusData = {
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      mpesaReceiptNumber: order.paymentMethod === 'mpesa' ? order.mpesaReceiptNumber ?? undefined : undefined,
    }

    return NextResponse.json({ success: true, data: statusData })
  } catch (error: unknown) {
    console.error('Error fetching order status:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order status' }
      },
      { status: 500 }
    )
  }
}