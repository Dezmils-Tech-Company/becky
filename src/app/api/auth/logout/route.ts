import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie } from '../../../../lib/session/set-session'
import { getSession } from '../../../../lib/session/get-session'
import { writeAuditLog } from '../../../../lib/audit/logger'
import { connectDB } from '../../../../lib/mongodb/client'
import { User } from '../../../../models'
import { env } from '../../../../config/env'
import { SESSION_COOKIE_NAME } from '../../../../config/constants'
import { authLimiter, checkRateLimit } from '../../../../lib/rate-limit'

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Check rate limit first
  const identifier = req.headers.get('x-forwarded-for') ||
                    req.headers.get('x-real-ip') ||
                    'anonymous'

  await checkRateLimit(authLimiter, identifier)

  try {
    // Get session to audit logout
    const session = await getSession(req)

    if (session) {
      const { uid, email } = session

      // Write audit log
      await writeAuditLog({
        actor: { uid, email: email || '', role: 'customer' },
        action: 'LOGOUT',
        resource: 'User',
        resourceId: uid,
        meta: {}, // Adding empty meta to satisfy AuditLog type
      })
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true, data: {} })
    clearSessionCookie(response)

    return response
  } catch (error: unknown) {
    if ((error as any).code === 'RATE_LIMITED') {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        { status: 429,
          headers: (error as any).headers || {}
        }
      )
    }

    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to logout' } },
      { status: 500 }
    )
  }
}