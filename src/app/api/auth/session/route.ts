import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sessionSchema } from '../../../../schemas/auth.schema'
import { createSessionCookie, adminAuth } from '../../../../lib/firebase/admin'
import { writeAuditLog } from '../../../../lib/audit/logger'
import { connectDB } from '../../../../lib/mongodb/client'
import { User } from '../../../../models'
import { isProd } from '../../../../config/env'
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from '../../../../config/constants'
import { authLimiter, checkRateLimit } from '../../../../lib/rate-limit'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Check rate limit first
    const identifier =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'anonymous'

    await checkRateLimit(authLimiter, identifier)

    // Parse and validate body
    const body = await req.json()
    const { idToken } = sessionSchema.parse(body)

    // Verify Firebase ID token and create session cookie
    const sessionCookie = await createSessionCookie(idToken)

    // Verify Firebase ID token to extract user info
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    if (!decodedToken) {
      throw new Error('Failed to verify ID token')
    }

    const { uid, email, name, picture } = decodedToken

    // Upsert user in MongoDB
    await connectDB()
    await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          email,
          displayName: name || '',
          photoURL: picture || undefined,
          role: 'customer' // Default role; existing users keep their current role
        }
      },
      { upsert: true, new: true }
    )

    // Write audit log
    await writeAuditLog({
      actor: { uid, email: email || '', role: 'customer' },
      action: 'LOGIN',
      resource: 'User',
      resourceId: uid,
      meta: { provider: 'firebase' }
    })

    // Set cookie on response
    const response = NextResponse.json({ success: true, data: { uid, email, role: 'customer' } })
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: isProd(),
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE
    })

    return response
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: error.issues }
        },
        { status: 400 }
      )
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'RATE_LIMITED') {
      const headers = 'headers' in error ? (error.headers as Record<string, string>) : {}
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        { status: 429, headers }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to login' } },
      { status: 500 }
    )
  }
}