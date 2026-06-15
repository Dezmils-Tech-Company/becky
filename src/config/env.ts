import { z } from 'zod'

// Validate and parse environment variables
const envSchema = z.object({
  // Firebase Client (public) — required from Task 3 onward
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required'),

  // Firebase Admin (server-only) — required from Task 3 onward
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, 'FIREBASE_ADMIN_PROJECT_ID is required'),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().min(1, 'FIREBASE_ADMIN_CLIENT_EMAIL is required'),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, 'FIREBASE_ADMIN_PRIVATE_KEY is required'),

  // MongoDB
  MONGODB_URI: z.string().url('MongoDB URI must be a valid URL'),

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url('Upstash Redis REST URL must be valid'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'Upstash Redis REST token is required'),

  // Stripe — deferred until Task 12 (optional for now)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Daraja (M-Pesa / Safaricom) — deferred until Task 13 (optional for now)
  DARAJA_CONSUMER_KEY: z.string().optional(),
  DARAJA_CONSUMER_SECRET: z.string().optional(),
  DARAJA_SHORTCODE: z.string().optional(),
  DARAJA_PASSKEY: z.string().optional(),
  DARAJA_CALLBACK_URL: z.string().optional(),
  DARAJA_ENV: z.enum(['sandbox', 'production']).optional(),

  // Cloudinary — required from Task 11 onward
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1, 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('APP URL must be valid'),
  SESSION_COOKIE_NAME: z.string().default('__session'),
  SESSION_COOKIE_MAX_AGE: z.string().default('1209600').transform(val => parseInt(val, 10))
})

// Parse environment variables
const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format())
  throw new Error('Invalid environment variables. Check the errors above.')
}

export const env = _env.data

// Helper functions
export const isDev = (): boolean => process.env.NODE_ENV === 'development'
export const isProd = (): boolean => process.env.NODE_ENV === 'production'