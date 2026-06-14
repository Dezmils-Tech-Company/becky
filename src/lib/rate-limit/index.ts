import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '../redis/client'

/** Rate limiter for auth routes: 10 requests per 15 minutes per identifier. */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  prefix: 'auth_ratelimit'
})

/** Rate limiter for payment routes: 5 requests per minute per identifier. */
export const paymentLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'payment_ratelimit'
})

/** General API rate limiter: 100 requests per minute per identifier. */
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'api_ratelimit'
})

/**
 * Checks whether a request is within the given rate limiter's allowance.
 * On success, returns rate-limit metadata. On failure, throws an error
 * carrying `code: 'RATE_LIMITED'`, `status: 429`, and a `Retry-After` header
 * for the caller to surface as a 429 response.
 *
 * @param limiter - The configured `Ratelimit` instance to check against.
 * @param identifier - A unique identifier for the requester (usually IP).
 * @returns Rate limit metadata when the request is allowed.
 * @throws Error with `code: 'RATE_LIMITED'` when the limit is exceeded.
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: true; limit: number; remaining: number; reset: number }> {
  const result = await limiter.limit(identifier)

  if (!result.success) {
    const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
    const error = new Error('Too many requests') as Error & {
      code: string
      status: number
      headers: Record<string, string>
    }
    error.code = 'RATE_LIMITED'
    error.status = 429
    error.headers = { 'Retry-After': String(retryAfterSeconds) }
    throw error
  }

  return {
    success: true,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset
  }
}