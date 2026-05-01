import { Ratelimit } from '@upstash/ratelimit'
import { createHash } from 'crypto'
import { redis } from './redis'
import { db } from './db/client'
import { subscriptions } from './db/schema'
import { eq, and, gt, inArray, sql } from 'drizzle-orm'

export const aiParseFreeLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, '86400 s'),
  prefix: 'ratelimit:ai-parse:free',
})

export async function decrementAiParse(userId: string): Promise<boolean> {
  const rows = await db
    .update(subscriptions)
    .set({ aiParseRemaining: sql`${subscriptions.aiParseRemaining} - 1` })
    .where(
      and(
        eq(subscriptions.userId, userId),
        inArray(subscriptions.status, ['active', 'trialing', 'past_due']),
        gt(subscriptions.aiParseRemaining, 0),
      ),
    )
    .returning({ aiParseRemaining: subscriptions.aiParseRemaining })

  return rows.length > 0
}

export function getRealIp(request: Request): string {
  const headers = request instanceof Request ? request.headers : new Headers()

  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return '127.0.0.1'
}

export function hashIp(ip: string): string {
  const salt = process.env.AUTH_SECRET ?? 'complypic-salt'
  return createHash('sha256').update(ip + salt).digest('hex')
}
