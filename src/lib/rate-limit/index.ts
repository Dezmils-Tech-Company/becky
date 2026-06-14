import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '../redis/client'
import { env } from '../../config/env'

// Create rate limiters
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 requests per 15 minutes
  prefix: 'auth_ratelimit',
})

export const paymentLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per 1 minute
  prefix: 'payment_ratelimit',
})

export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per 1 minute
  prefix: 'api_ratelimit',
})

/**
 * Checks if the request is within rate limit
 * @param limiter - The rate limiter to use
 * @param identifier - Unique identifier (usually IP address)
 * @returns Object with limit info or throws 429 error
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
) {
  const result = await limiter.limit(identifier)

  if (!result.success) {
    const error = new Error('Too many requests') as any
    error.code = 'RATE_LIMITED'
    error.status = 429
    error.headers = {
      'Retry-After': String(Math.ceil(result.reset / 1000)),
    }
    throw error
  }

  return {
    success: true,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}