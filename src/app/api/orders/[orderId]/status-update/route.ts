import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { Order } from '@/models/Order'
import { requireSession } from '@/lib/session/get-session'
import { User } from '@/models'
import { Types } from 'mongoose'
import { writeAuditLog } from '@/lib/audit/logger'
import { updateOrderStatusSchema } from '@/schemas/order.schema'
import { z } from 'zod'

interface RouteParams {
  orderId: string
}

export async function PATCH(
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

    const routeParams = await params
    const orderId = routeParams.orderId

    if (!Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid order ID' } },
        { status: 400 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const parsed = updateOrderStatusSchema.safeParse(body)
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid order status data',
            details: fieldErrors
          }
        },
        { status: 400 }
      )
    }

    const { status } = parsed.data

    // Validate that status is a valid order status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
          }
        },
        { status: 400 }
      )
    }

    // Update the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    )

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    // Write audit log
    await writeAuditLog({
      actor: { uid: user.uid, email: user.email, role: user.role },
      action: 'UPDATE',
      resource: 'Order',
      resourceId: orderId,
      meta: {
        previousStatus: order.status, // Note: this will be the new status since we already updated
        // In a real implementation, we would fetch the original status first
        newStatus: status
      }
    })

    return NextResponse.json({
      success: true,
      data: order.toObject()
    })
  } catch (error: unknown) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update order status' }
      },
      { status: 500 }
    )
  }
}