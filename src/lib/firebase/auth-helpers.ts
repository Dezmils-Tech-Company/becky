// Client-side Firebase Auth helper functions
import {
  onAuthStateChanged,
  signOut,
  type User,
  type Unsubscribe
} from 'firebase/auth'
import { auth } from './client'

/**
 * Gets a fresh Firebase ID token for the currently signed-in user.
 * Forces a token refresh to ensure it's not expired.
 *
 * @returns The current user's ID token.
 * @throws Error if no user is currently authenticated.
 */
export async function getIdToken(): Promise<string> {
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('No authenticated user')
  }
  return currentUser.getIdToken(true)
}

/**
 * Signs the user out of Firebase and clears the server-side session cookie.
 * Side effects: calls Firebase `signOut`, then POSTs to `/api/auth/logout`.
 *
 * @throws Error if the logout request to the server fails.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth)
  const res = await fetch('/api/auth/logout', { method: 'POST' })
  if (!res.ok) {
    throw new Error('Failed to clear session on server')
  }
}

/**
 * Subscribes to Firebase auth state changes.
 *
 * @param callback - Called with the current `User` (or `null` if signed out).
 * @returns An unsubscribe function to stop listening.
 */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback)
}