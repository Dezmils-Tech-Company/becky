import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { Product } from '@/models/Product'
import { Order } from '@/models/Order'
import { createOrderSchema, type CreateOrderValues } from '@/schemas/order.schema'
import { requireSession } from '@/lib/session/get-session'
import { writeAuditLog } from '@/lib/audit/logger'
import { User } from '@/models'
import { Types } from 'mongoose'

/**
 * POST /api/orders
 * Create a new order from cart.
 * Requires session.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check session
    const session = await requireSession(request)

    await connectDB()
    const user = await User.findOne({ uid: session.uid })
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } },
        { status: 401 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid order data',
            details: fieldErrors
          }
        },
        { status: 400 }
      )
    }

    const { items, shippingAddress, paymentMethod, currency, notes } = parsed.data as CreateOrderValues

    // Fetch products to validate stock and isActive
    const productIds = items.map(item => item.productId)
    const products = await Product.find({ _id: { $in: productIds } }).lean()

    // Map productId to product for easy lookup
    const productMap = new Map<string, any>()
    products.forEach(p => productMap.set(p._id.toString(), p))

    // Validate each item
    const validatedItems = []
    let subtotal = 0

    for (const cartItem of items) {
      const product = productMap.get(cartItem.productId)
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: `Product not found: ${cartItem.productId}` }
          },
          { status: 404 }
        )
      }

      if (!product.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `Product is not active: ${product.name}` }
          },
          { status: 400 }
        )
      }

      if (product.stock < cartItem.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `Insufficient stock for ${product.name}` }
          },
          { status: 400 }
        )
      }

      const itemTotal = product.price * cartItem.quantity
      subtotal += itemTotal

      validatedItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        imageUrl: product.images[0] ?? ''
      })
    }

    // Decrement stock for each product
    const updatePromises = items.map(item =>
      Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      )
    )
    await Promise.all(updatePromises)

    // Create order
    const order = new Order({
      userId: user.uid,
      items: validatedItems,
      subtotal,
      total: subtotal, // No tax/shipping yet
      currency,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod,
      shippingAddress,
      notes
    })

    await order.save()

    // Write audit log
    await writeAuditLog({
      actor: { uid: user.uid, email: user.email, role: user.role },
      action: 'CREATE',
      resource: 'Order',
      resourceId: order._id.toString(),
      meta: {
        itemsCount: validatedItems.length,
        total: subtotal,
        currency,
        paymentMethod
      }
    })

    return NextResponse.json(
      { success: true, data: order.toObject() },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create order' }
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orders
 * Get paginated orders for the current user (or admin for all).
 * Requires session.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())

    // We'll reuse productQuerySchema for pagination but adjust for orders
    // For simplicity, we'll implement basic pagination here; can be refined later
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const limit = Math.min(Math.max(1, Number(searchParams.get('limit') || '20')), 100)

    // Build filter: non-admin users see only their orders
    const filter: any = { userId: user.uid }
    // Admin can see all orders if they specify? We'll keep simple for now.

    // Count total
    const total = await Order.countDocuments(filter)

    // Fetch orders
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    })
  } catch (error: unknown) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch orders' }
      },
      { status: 500 }
    )
  }
}