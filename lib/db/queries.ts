import { eq, and, inArray } from 'drizzle-orm'
import { db } from './client'
import { users, subscriptions } from './schema'
import { nanoid } from 'nanoid'

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return rows[0] ?? null
}

export async function getActiveSubscription(userId: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        inArray(subscriptions.status, ['active', 'trialing', 'past_due']),
      ),
    )
    .limit(1)
  return rows[0] ?? null
}

export async function upsertUserFromStripe(
  email: string,
  stripeCustomerId: string,
): Promise<typeof users.$inferSelect> {
  const existing = await getUserByEmail(email)
  if (existing) {
    if (!existing.stripeCustomerId) {
      const updated = await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, existing.id))
        .returning()
      return updated[0]
    }
    return existing
  }

  const created = await db
    .insert(users)
    .values({
      id: nanoid(),
      email,
      stripeCustomerId,
    })
    .returning()
  return created[0]
}
