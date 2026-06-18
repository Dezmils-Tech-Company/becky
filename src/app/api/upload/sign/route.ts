import { NextRequest, NextResponse } from 'next/server'
import { signUploadParams } from '@/lib/cloudinary/server'
import { verifySessionCookie } from '@/lib/session/verify-session'
import { SESSION_COOKIE_NAME } from '@/config/constants'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const session = await verifySessionCookie(sessionCookie)
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid session' } },
        { status: 401 }
      )
    }

    // Accept folder from the request body, with a safe default
    const body = await request.json().catch(() => ({}))
    const folder = body.folder || 'beckie-products'

    const { timestamp, signature } = await signUploadParams(folder)

    return NextResponse.json({
      success: true,
      data: {
        timestamp,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
      },
    })
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate upload signature' } },
      { status: 500 }
    )
  }
}