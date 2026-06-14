import { getIdToken as getClientIdToken, signOutUser as clientSignOutUser } from './client'
import type { User } from 'firebase/auth'

/**
 * Gets the current Firebase ID token
 * @returns Promise that resolves to the ID token string
 */
export async function getIdToken(): Promise<string> {
  return getClientIdToken()
}

/**
 * Signs out the user and clears the session cookie
 * This calls Firebase signOut and then POSTs to /api/auth/logout
 */
export async function signOutUser(): Promise<void> {
  try {
    // Sign out from Firebase
    await clientSignOutUser()

    // Additionally call our logout endpoint to clear session cookie
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.warn('Failed to call logout API:', await response.text())
    }
  } catch (error) {
    console.error('Error during sign out:', error)
    // Still proceed with Firebase sign out even if API call fails
  }
}

/**
 * Sets up an authentication state change listener
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
// export function onAuthChange(callback: (User | null) => void) {
//   // Import firebase here to avoid circular dependencies
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   const { getAuth, onAuthStateChanged } = require('firebase/auth')

//   const auth = getAuth()
//   const unsubscribe = onAuthStateChanged(auth, callback)
//   return unsubscribe
// }