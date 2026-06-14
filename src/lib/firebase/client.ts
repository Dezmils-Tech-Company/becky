// Firebase client SDK initialization (client-side only)
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Check if Firebase app is already initialized to prevent re-initialization
let app: ReturnType<typeof initializeApp> | null = null

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

// Get Firebase app instance
export const firebaseApp = app || getApps()[0]

// Get Firebase Auth instance
export const auth = getAuth(firebaseApp)

/**
 * Gets the current Firebase ID token
 * @returns Promise that resolves to the ID token string
 */
export async function getIdToken(): Promise<string> {
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('No authenticated user')
  }
  return currentUser.getIdToken(true)
}

/**
 * Signs out the current user and clears the session
 */
export async function signOutUser(): Promise<void> {
  await auth.signOut()
  // Additionally, we'll call the logout API to clear the session cookie
  // This is handled in the auth-helpers file
}