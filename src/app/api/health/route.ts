import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongodb/client'
import { redis } from '../../../lib/redis/client'

/**
 * GET /api/health
 * Health check endpoint for MongoDB and Redis
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB()

    // Test Redis connection
    await redis.ping()

    return NextResponse.json({
      success: true,
      data: {
        mongo: 'ok',
        redis: 'ok'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Health check failed'
        }
      },
      { status: 500 }
    )
  }
}