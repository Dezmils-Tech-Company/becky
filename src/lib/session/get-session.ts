import { type NextRequest } from 'next/server'
import { verifySessionCookie } from '../firebase/admin'
import { env } from '../../config/env'
import { SESSION_COOKIE_NAME } from '../../config/constants'

/**
 * Gets and verifies the session cookie from request (Server Components only)
 * @param req - Optional NextRequest object (for API routes)
 * @returns Promise that resolves to the decoded token or null if invalid/no session
 */
export async function getSession(req?: NextRequest) {
  try {
    // Get cookie from request
    const sessionCookie = req?.cookies?.get(SESSION_COOKIE_NAME)?.value

    if (!sessionCookie) {
      return null
    }

    // Verify the session cookie
    const decodedToken = await verifySessionCookie(sessionCookie)
    return decodedToken
  } catch (error) {
    // Invalid or expired session
    console.warn('Session verification failed:', error)
    return null
  }
}

/**
 * Requires a valid session, throws UNAUTHORIZED error if not present (Server Components only)
 * @param req - Optional NextRequest object (for API routes)
 * @returns Promise that resolves to the decoded token
 * @throws Error with UNAUTHORIZED code if no valid session
 */
export async function requireSession(req?: NextRequest) {
  const session = await getSession(req)
  if (!session) {
    const error = new Error('Unauthorized') as any
    error.code = 'UNAUTHORIZED'
    throw error
  }
  return session
}