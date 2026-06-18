import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase/admin'
import { SESSION_COOKIE_NAME } from '@/config/constants'

/**
 * Verify the session cookie and return the decoded token
 * @returns Decoded session token or null if invalid
 */
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    return decodedToken
  } catch (error) {
    console.error('Error verifying session cookie:', error)
    return null
  }
}

/**
 * Get the current session from cookies (Server Components / layouts)
 * Reads cookies via next/headers, so it does not need a NextRequest.
 */
export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    return null
  }

  return verifySessionCookie(sessionCookie)
}

/**
 * Requires a valid session, throws an UNAUTHORIZED error if not present.
 * Use in Server Components / layouts (relies on next/headers cookies()).
 * @returns Promise that resolves to the decoded token
 * @throws Error with UNAUTHORIZED code if no valid session
 */
export async function requireSession() {
  const session = await getSession()
  if (!session) {
    const error = new Error('Unauthorized') as any
    error.code = 'UNAUTHORIZED'
    throw error
  }
  return session
}