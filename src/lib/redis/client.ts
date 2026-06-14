import { Redis } from '@upstash/redis'
import { env } from '../../config/env'

// Create Upstash Redis client
export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL as string,
  token: env.UPSTASH_REDIS_REST_TOKEN as string,
})

// Typed helper functions
export async function setex(key: string, ttlSeconds: number, value: unknown): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value))
}

export async function get<T>(key: string): Promise<T | null> {
  const value = await redis.get<string>(key)
  return value ? JSON.parse(value) : null
}

export async function del(key: string): Promise<number> {
  return redis.del(key)
}

export async function getDel(key: string): Promise<unknown | null> {
  return redis.getdel(key)
}

export async function incr(key: string): Promise<number> {
  return redis.incr(key)
}

export async function ttl(key: string): Promise<number> {
  return redis.ttl(key)
}