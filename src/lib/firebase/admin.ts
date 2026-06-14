// Firebase Admin SDK initialization (server-only)
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { env } from '../../config/env'

// Guard to prevent client-side usage
if (typeof window !== 'undefined') {
  throw new Error('firebase/admin.ts cannot be imported in client-side code')
}

// Check if Firebase admin app is already initialized
let adminApp: ReturnType<typeof initializeApp> | null = null
let adminAuthInstance: ReturnType<typeof getAuth> | undefined = undefined

if (!getApps().length) {
  // Only initialize if required env vars are present
  if (env.FIREBASE_ADMIN_PROJECT_ID && env.FIREBASE_ADMIN_CLIENT_EMAIL && env.FIREBASE_ADMIN_PRIVATE_KEY) {
    // Handle the private key format (replace \\n with \n)
    const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')

    adminApp = initializeApp({
      credential: cert({
        projectId: env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    })

    adminAuthInstance = getAuth(adminApp)
  } else {
    console.warn('Firebase Admin SDK not initialized: missing admin env vars')
  }
}

// Get Firebase admin app instance (if any)
export const adminAppInstance = adminApp || getApps()[0]

// Export adminAuth (may be undefined until Task 3 sets env vars)
export const adminAuth = adminAuthInstance

/**
 * Creates a session cookie from a Firebase ID token
 * @param idToken - Firebase ID token from client
 * @returns Promise that resolves to the session cookie string
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  if (!adminAuth) throw new Error('Firebase Admin SDK not initialized')
  // Create session cookie with 14-day expiry
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: 60 * 60 * 24 * 14 * 1000, // 14 days in milliseconds
  })
}

/**
 * Verifies a session cookie
 * @param cookie - Session cookie string
 * @param checkRevoked - Whether to check if token is revoked
 * @returns Promise that resolves to the decoded token
 */
export async function verifySessionCookie(
  cookie: string,
  checkRevoked = true
) {
  if (!adminAuth) throw new Error('Firebase Admin SDK not initialized')
  return adminAuth.verifySessionCookie(cookie, checkRevoked)
}
