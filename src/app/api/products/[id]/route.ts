import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb/client'
import { Product } from '../../../../models'
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
