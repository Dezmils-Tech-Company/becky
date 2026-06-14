import { redis } from '../redis/client'

/**
 * Generates an idempotency key with a prefix
 * @param prefix - Prefix for the key (e.g., 'stripe', 'mpesa')
 * @returns Idempotency key string in format: prefix:uuid
 */
export function generateIdempotencyKey(prefix: string): string {
  const uuid = crypto.randomUUID()
  return `${prefix}:${uuid}`
}

/**
 * Checks if an idempotency key exists in Redis and returns cached result
 * @param key - Idempotency key to check
 * @returns Cached result if exists, null otherwise
 */
export async function checkIdempotency<T>(key: string): Promise<T | null> {
  const cached = await redis.get<T>(key)
  return cached
}

/**
 * Sets a value in Redis with TTL for idempotency
 * @param key - Idempotency key
 * @param value - Value to cache
 * @param ttlSeconds - Time to live in seconds
 */
export async function setIdempotency(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value))
}