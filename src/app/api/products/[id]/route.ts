import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb/client'
import { Product } from '../../../../models'
import { updateProductSchema } from '../../../../schemas/product.schema'
import { requireSession } from '../../../../lib/session/get-session'
import { writeAuditLog } from '../../../../lib/audit/logger'
import { User } from '../../../../models'
import { Types } from 'mongoose'

interface RouteParams {
  id: string
}

/**
 * GET /api/products/[id]
 * Get a product by ID or slug.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse> {
  try {
    await connectDB()
    console.log('Connected to DB')

    const routeParams = await params
    const { id } = routeParams
    console.log('Looking for product with id/slug:', id)

    let product = null

    // Try to find by ObjectId first
    if (Types.ObjectId.isValid(id)) {
      console.log('ID is valid ObjectId, trying findById')
      product = await Product.findById(id).select('-__v').lean()
      console.log('findById result:', product)
    }

    // If not found by ID, try to find by slug
    if (!product) {
      console.log('Product not found by ID, trying findOne by slug')
      product = await Product.findOne({ slug: id }).select('-__v').lean()
      console.log('findOne by slug result:', product)
    }

    console.log('Final product result:', product)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found'
          }
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/products/[id]
 * Update a product by ID or slug.
 * Requires admin role.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse> {
  try {
    // Check session and require admin role
    let session
    try {
      session = await requireSession(request)
    } catch (err) {
      if (err !== null && typeof err === 'object' && 'code' in err && err.code === 'UNAUTHORIZED') {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
          { status: 401 }
        )
      }
      throw err
    }

    await connectDB()
    const user = await User.findOne({ uid: session.uid })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 }
      )
    }

    const routeParams = await params
    const { id } = routeParams

    // Find product by ID or slug
    let product = null
    if (Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
    }
    if (!product) {
      product = await Product.findOne({ slug: id })
    }

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found'
          }
        },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = updateProductSchema.safeParse(body)

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update data',
            details: fieldErrors
          }
        },
        { status: 400 }
      )
    }

    // Update product with parsed data
    Object.assign(product, parsed.data)
    await product.save()

    // Write audit log
    await writeAuditLog({
      actor: { uid: user.uid, email: user.email, role: user.role },
      action: 'UPDATE',
      resource: 'Product',
      resourceId: product._id.toString(),
      meta: {
        name: product.name,
        price: product.price,
        category: product.category,
        isActive: product.isActive,
        updatedFields: Object.keys(parsed.data)
      }
    })

    return NextResponse.json({
      success: true,
      data: product.toObject()
    })
  } catch (err) {
    console.error('Error updating product:', err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update product'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]
 * Soft delete a product by setting isActive to false.
 * Requires admin role.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse> {
  try {
    // Check session and require admin role
    let session
    try {
      session = await requireSession(request)
    } catch (err) {
      if (err !== null && typeof err === 'object' && 'code' in err && err.code === 'UNAUTHORIZED') {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
          { status: 401 }
        )
      }
      throw err
    }

    await connectDB()
    const user = await User.findOne({ uid: session.uid })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 }
      )
    }

    const routeParams = await params
    const { id } = routeParams

    // Find product by ID or slug
    let product = null
    if (Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
    }
    if (!product) {
      product = await Product.findOne({ slug: id })
    }

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found'
          }
        },
        { status: 404 }
      )
    }

    // Soft delete: set isActive to false
    product.isActive = false
    await product.save()

    // Write audit log
    await writeAuditLog({
      actor: { uid: user.uid, email: user.email, role: user.role },
      action: 'DELETE',
      resource: 'Product',
      resourceId: product._id.toString(),
      meta: {
        name: product.name,
        isActive: product.isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: product.toObject()
    })
  } catch (err) {
    console.error('Error deleting product:', err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete product'
        }
      },
      { status: 500 }
    )
  }
}
