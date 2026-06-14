import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongodb/client'
import { Product } from '../../../models/Product'
import { createProductSchema, productQuerySchema } from '../../../schemas/product.schema'
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../../../config/constants'

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
  } catch (error: unknown) {
    console.error('Error fetching products:', error)
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
 * TEMP: auth added in Task 5
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB()

    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
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

    // TEMP: auth added in Task 5 - currently unauthenticated
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
  } catch (error: unknown) {
    console.error('Error creating product:', error)
    // Return more detailed error for debugging
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create product',
          // Include error details in development only
          ...(error instanceof Error && process.env.NODE_ENV === 'development' && { details: error.message, stack: error.stack })
        }
      },
      { status: 500 }
    )
  }
}
