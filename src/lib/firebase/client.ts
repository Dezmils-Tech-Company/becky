// Firebase client SDK initialization (client-side only)
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
}

/** The singleton Firebase app instance (idempotent across hot-reloads). */
export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

/** Firebase Auth instance for client-side authentication. */
export const auth: Auth = getAuth(firebaseApp)