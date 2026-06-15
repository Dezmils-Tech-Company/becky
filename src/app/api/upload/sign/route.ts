import { NextRequest, NextResponse } from 'next/server'
import { signUploadParams } from '@/lib/cloudinary/server'
import { verifySessionCookie } from '@/lib/session/verify-session'
import { SESSION_COOKIE_NAME } from '@/config/constants'

/**
 * POST /api/upload/sign
 * Generates signed upload parameters for Cloudinary
 * Requires authentication
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized',
          },
        },
        { status: 401 }
      )
    }

    // Verify session
    const session = await verifySessionCookie(sessionCookie)
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid session',
          },
        },
        { status: 401 }
      )
    }

    // Generate signed parameters (valid for 60 seconds)
    const { timestamp, signature } = await signUploadParams()

    return NextResponse.json({
      success: true,
      data: {
        timestamp,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        // Cloudinary automatically expires signed params after 60 seconds by default
      },
    })
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate upload signature',
        },
      },
      { status: 500 }
    )
  }
}