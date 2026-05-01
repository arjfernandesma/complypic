import { redis } from '@/lib/redis'

const SEMAPHORE_KEY = 'semaphore:process-image'
const MAX_SLOTS = 5
const STALE_THRESHOLD_MS = 90_000

export async function acquireSlot(
  batchId: string,
  imageId: string,
  timeoutMs = 30_000,
): Promise<boolean> {
  const member = `${batchId}:${imageId}`
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const now = Date.now()
    const staleThreshold = now - STALE_THRESHOLD_MS

    await redis.zremrangebyscore(SEMAPHORE_KEY, '-inf', staleThreshold)

    const currentSize = await redis.zcard(SEMAPHORE_KEY)

    if (currentSize < MAX_SLOTS) {
      await redis.zadd(SEMAPHORE_KEY, { score: now, member })
      const sizeAfter = await redis.zcard(SEMAPHORE_KEY)
      if (sizeAfter <= MAX_SLOTS) {
        return true
      }
      await redis.zrem(SEMAPHORE_KEY, member)
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 200))
  }

  return false
}

export async function releaseSlot(batchId: string, imageId: string): Promise<void> {
  const member = `${batchId}:${imageId}`
  await redis.zrem(SEMAPHORE_KEY, member)
}
