// Firebase Admin SDK initialization (server-only)
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { env, isDev } from '../../config/env'
import { SESSION_COOKIE_MAX_AGE } from '../../config/constants'

// Guard to prevent client-side usage
if (typeof window !== 'undefined') {
  throw new Error('firebase/admin.ts cannot be imported in client-side code')
}

/**
 * Initializes (or reuses) the Firebase Admin App.
 * Throws immediately if required env vars are missing or initialization fails —
 * this fails fast at module load rather than producing `Auth | undefined`
 * everywhere it's consumed.
 */
function initAdminApp(): App {
  if (getApps().length) {
    return getApps()[0]
  }

  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')

  if (isDev()) {
    console.log('Firebase Admin SDK: Initializing...')
    console.log('PROJECT_ID:', env.FIREBASE_ADMIN_PROJECT_ID)
    console.log('CLIENT_EMAIL:', env.FIREBASE_ADMIN_CLIENT_EMAIL)
    console.log('PRIVATE_KEY length:', privateKey.length)
  }

  try {
    const app = initializeApp({
      credential: cert({
        projectId: env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey
      })
    })

    if (isDev()) {
      console.log('Firebase Admin SDK: Initialized successfully')
    }

    return app
  } catch (error) {
    console.error('Firebase Admin SDK: Initialization failed:', error)
    throw new Error('Failed to initialize Firebase Admin SDK')
  }
}

const adminApp: App = initAdminApp()

/** Firebase Admin Auth instance — server-only, always defined. */
export const adminAuth: Auth = getAuth(adminApp)

/**
 * Creates an HttpOnly session cookie from a Firebase ID token.
 *
 * @param idToken - Firebase ID token obtained client-side.
 * @returns A session cookie string valid for `SESSION_COOKIE_MAX_AGE` seconds.
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_COOKIE_MAX_AGE * 1000 // Firebase expects milliseconds
  })
}

/**
 * Verifies a session cookie and returns the decoded token.
 *
 * @param cookie - The session cookie string from the request.
 * @param checkRevoked - Whether to check if the underlying token was revoked.
 * @returns The decoded ID token.
 * @throws Error if the cookie is invalid, expired, or revoked.
 */
export async function verifySessionCookie(
  cookie: string,
  checkRevoked = true
): ReturnType<Auth['verifySessionCookie']> {
  return adminAuth.verifySessionCookie(cookie, checkRevoked)
}