import { type NextResponse } from 'next/server'
import { createSessionCookie } from '../firebase/admin'
import { env } from '../../config/env'
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from '../../config/constants'

/**
 * Sets the session cookie in the response
 * @param idToken - Firebase ID token from client
 * @param res - NextResponse object to set cookie on
 * @returns NextResponse with session cookie set
 */
export function setSessionCookie(idToken: string, res: NextResponse) {
  // Create session cookie
  return createSessionCookie(idToken).then((sessionCookie) => {
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE, // 14 days in seconds
    })
    return res
  })
}

/**
 * Clears the session cookie from the response
 * @param res - NextResponse object to clear cookie on
 * @returns NextResponse with session cookie cleared
 */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // Expire immediately
  })
  return res
}