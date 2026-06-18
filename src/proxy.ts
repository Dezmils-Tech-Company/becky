import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionCookie } from './lib/session/verify-session'
import { SESSION_COOKIE_NAME } from './config/constants'
import { isDev } from './config/env'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/',
    '/api/auth/',
    '/_next/',
    '/favicon.ico',
    '/public/',
    '/api/health' // Health check endpoint
  ]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  if (isPublicPath) return NextResponse.next()

  // Check for session cookie
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    // No session cookie - unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      )
    }
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify session cookie and extract session data
  let session
  try {
    session = await verifySessionCookie(sessionCookie)
  } catch (error) {
    // Invalid or expired session
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid session' } },
        { status: 401 }
      )
    }
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If session is null, redirect to login
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid session' } },
        { status: 401 }
      )
    }
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // NOTE: Role-based authorization (e.g. admin-only access) is intentionally
  // NOT checked here. Middleware only confirms a valid session exists.
  // The Firebase ID token's custom claims (e.g. `admin: true`, set via
  // scripts/set-admin-claim.ts) are not guaranteed to include a `role` field,
  // and the authoritative role lives in MongoDB, not the token. Role checks
  // for /admin/** are performed in src/app/admin/layout.tsx (page routes)
  // and individually inside each /api/admin/** route handler (API routes),
  // both of which query MongoDB directly for the current role. This matches
  // the project's standing rule: middleware enforces auth, route
  // handlers/layouts enforce role.

  // Path-based protections for specific areas
  const protectedPaths = [
    '/admin/:path*',
    '/dashboard/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/api/admin/:path*'
  ]

  // Check if path matches any protected pattern
  const isProtectedPath = protectedPaths.some(pattern => {
    // Simple implementation - in production you might want to use path-to-regexp or similar
    if (pattern.endsWith(':path*')) {
      const basePath = pattern.slice(0, -6) // Remove ':path*'
      return pathname.startsWith(basePath)
    }
    return pathname === pattern
  })

  // For API paths under protected areas, we still need to check authentication
  // but the role checking is done in the individual route handlers
  if (isProtectedPath && pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    // Already verified session above, so we can proceed
    // Role-specific checks for API routes are handled in the route handlers themselves
    return NextResponse.next()
  }

  // For page routes under protected areas, we've already verified session
  // Additional role checks for specific page routes are handled in the layout/components
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)',],
}