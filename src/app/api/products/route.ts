import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongodb/client'
import { Product } from '../../../models/Product'
import { createProductSchema, productQuerySchema } from '../../../schemas/product.schema'
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../../../config/constants'
import { requireSession } from '../../../lib/session/get-session'
import { writeAuditLog } from '../../../lib/audit/logger'
import { User } from '../../../models'
import { Types } from 'mongoose'

/**
 * GET /api/products
 * List all products with pagination and filtering.
 * Query params: page, limit, category, search, isActive
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB()

    // Parse query params
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    const parsed = productQuerySchema.safeParse(queryData)

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: fieldErrors
          }
        },
        { status: 400 }
      )
    }

    const { page = 1, limit = DEFAULT_PAGE_LIMIT, category, search, isActive = true } = parsed.data

    // Build filter
    const filter: Record<string, unknown> = {}

    if (isActive !== undefined) {
      filter.isActive = isActive
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Count total
    const total = await Product.countDocuments(filter)

    // Paginate
    const skip = (page - 1) * Math.min(limit, MAX_PAGE_LIMIT)
    const safeLimit = Math.min(limit, MAX_PAGE_LIMIT)

    const products = await Product.find(filter)
      .skip(skip)
      .limit(safeLimit)
      .select('-__v')
      .lean()

    const pages = Math.ceil(total / safeLimit)

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit: safeLimit,
        pages
      }
    })
  } catch (err) {
    console.error('Error fetching products:', err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch products'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products
 * Create a new product.
 * Requires admin role.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
      // Log the actual rejected fields server-side. Previously this branch
      // returned a 400 with no terminal output at all, making it impossible
      // to tell which field failed without manually inspecting the browser's
      // Network tab every time.
      console.error('Product validation failed:', {
        receivedBody: body,
        fieldErrors
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid product data',
            details: fieldErrors
          }
        },
        { status: 400 }
      )
    }

    console.log('Creating product with data:', parsed.data)
    let newProduct
    try {
      newProduct = new Product(parsed.data)
      console.log('Product instance created')
    } catch (instError) {
      console.error('Error creating Product instance:', instError)
      throw instError
    }

    try {
      await newProduct.save()
      console.log('Product saved successfully')

      // Write audit log
      await writeAuditLog({
        actor: { uid: user.uid, email: user.email, role: user.role },
        action: 'CREATE',
        resource: 'Product',
        resourceId: newProduct._id.toString(),
        meta: {
          name: newProduct.name,
          price: newProduct.price,
          category: newProduct.category,
          isActive: newProduct.isActive
        }
      })
    } catch (saveError) {
      console.error('Error saving Product:', saveError)
      throw saveError
    }

    return NextResponse.json(
      {
        success: true,
        data: newProduct.toObject()
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error creating product:', err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create product'
        }
      },
      { status: 500 }
    )
  }
}