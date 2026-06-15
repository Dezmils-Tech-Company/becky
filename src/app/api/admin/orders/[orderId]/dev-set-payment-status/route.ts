import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { Order } from '@/models/Order'
import { requireSession } from '@/lib/session/get-session'
import { User } from '@/models'
import { Types } from 'mongoose'
import { writeAuditLog } from '@/lib/audit/logger'
import { isDev } from '@/config/env'

interface RouteParams {
  orderId: string
}

/**
 * DEV ONLY: PATCH /api/admin/orders/[orderId]/dev-set-payment-status
 * Sets the payment status of an order directly (for testing).
 * Admin-only and only available in development.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse> {
  // Only allow in development
  if (!isDev()) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Dev-only endpoint' } },
      { status: 403 }
    )
  }

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

    // Check admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin only' } },
        { status: 403 }
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

    const body = await request.json()
    const { paymentStatus } = body

    // Validate paymentStatus
    const validStatuses = ['unpaid', 'pending', 'paid', 'failed', 'refunded']
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`,
          }
        },
        { status: 400 }
      )
    }

    const order = await Order.findById(orderId)

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    // Check if user is owner or admin (admin already validated, but also ensure they can only modify orders?
    // Since it's dev and admin, we'll allow any order.
    // If we want to restrict to own orders, we would check order.userId === user.uid, but as admin we can bypass.
    // We'll allow admin to modify any order in dev.

    // Update payment status
    order.paymentStatus = paymentStatus as any
    await order.save()

    // Write audit log for dev action
    await writeAuditLog({
      actor: { uid: user.uid, email: user.email, role: user.role },
      action: 'UPDATE',
      resource: 'Order',
      resourceId: order._id.toString(),
      meta: {
        devAction: 'set-payment-status',
        newPaymentStatus: paymentStatus,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: order._id,
        paymentStatus: order.paymentStatus,
      }
    })
  } catch (error: unknown) {
    console.error('Error setting payment status (dev):', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to set payment status' }
      },
      { status: 500 }
    )
  }
}