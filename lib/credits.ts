import { db } from './db/client'
import { subscriptions, creditLedger } from './db/schema'
import { eq, and, gte, inArray, sql } from 'drizzle-orm'

export class InsufficientCreditsError extends Error {
  constructor(message = 'Insufficient credits') {
    super(message)
    this.name = 'InsufficientCreditsError'
  }
}

export async function consumeCredits(
  userId: string,
  n: number,
  refId?: string,
): Promise<number> {
  const updated = await db
    .update(subscriptions)
    .set({
      imageCreditsRemaining: sql`${subscriptions.imageCreditsRemaining} - ${n}`,
    })
    .where(
      and(
        eq(subscriptions.userId, userId),
        inArray(subscriptions.status, ['active', 'trialing', 'past_due']),
        gte(subscriptions.imageCreditsRemaining, n),
      ),
    )
    .returning({ imageCreditsRemaining: subscriptions.imageCreditsRemaining })

  if (updated.length === 0) {
    throw new InsufficientCreditsError()
  }

  const remaining = updated[0].imageCreditsRemaining

  await db.insert(creditLedger).values({
    userId,
    delta: -n,
    reason: 'image_processed',
    refId: refId ?? null,
  })

  return remaining
}

export async function refundCredits(
  userId: string,
  n: number,
  refId: string,
): Promise<void> {
  await db
    .insert(creditLedger)
    .values({
      userId,
      delta: n,
      reason: 'refund',
      refId,
    })
    .onConflictDoNothing()

  await db
    .update(subscriptions)
    .set({
      imageCreditsRemaining: sql`${subscriptions.imageCreditsRemaining} + ${n}`,
    })
    .where(
      and(
        eq(subscriptions.userId, userId),
        inArray(subscriptions.status, ['active', 'trialing', 'past_due']),
      ),
    )
}

export async function grantCredits(
  userId: string,
  n: number,
  stripeEventId: string,
): Promise<void> {
  const inserted = await db
    .insert(creditLedger)
    .values({
      userId,
      delta: n,
      reason: 'subscription_renewal',
      stripeEventId,
    })
    .onConflictDoNothing()
    .returning({ id: creditLedger.id })

  if (inserted.length === 0) {
    return
  }

  await db
    .update(subscriptions)
    .set({
      imageCreditsRemaining: sql`${subscriptions.imageCreditsRemaining} + ${n}`,
    })
    .where(
      and(
        eq(subscriptions.userId, userId),
        inArray(subscriptions.status, ['active', 'trialing', 'past_due']),
      ),
    )
}

export async function getCreditBalance(userId: string): Promise<number> {
  const rows = await db
    .select({ imageCreditsRemaining: subscriptions.imageCreditsRemaining })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        inArray(subscriptions.status, ['active', 'trialing', 'past_due']),
      ),
    )
    .limit(1)

  return rows[0]?.imageCreditsRemaining ?? 0
}
