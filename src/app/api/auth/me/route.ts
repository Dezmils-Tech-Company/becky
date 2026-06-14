import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '../../../../lib/session/get-session'
import { writeAuditLog } from '../../../../lib/audit/logger'
import { connectDB } from '../../../../lib/mongodb/client'
import { User } from '../../../../models'
import { Types } from 'mongoose'
import { env } from '../../../../config/env'
import { authLimiter, checkRateLimit } from '../../../../lib/rate-limit'

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Check rate limit first
  const identifier = req.headers.get('x-forwarded-for') ||
                    req.headers.get('x-real-ip') ||
                    'anonymous'

  await checkRateLimit(authLimiter, identifier)

  try {
    // Require valid session
    const session = await requireSession(req)

    const { uid, email, name, picture, role } = session

    // Fetch fresh user data from MongoDB
    await connectDB()
    const user = await User.findOne({ uid }).lean()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Return user data (excluding sensitive fields)
    return NextResponse.json({
      success: true,
      data: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    })
  } catch (error: unknown) {
    if ((error as any).code === 'RATE_LIMITED') {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        { status: 429,
          headers: (error as any).headers || {}
        }
      )
    }

    if ((error as any).code === 'UNAUTHORIZED') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    console.error('Auth me error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user' } },
      { status: 500 }
    )
  }
}