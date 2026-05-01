'use server'

import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'

export async function registerUser(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const normalized = email.toLowerCase().trim()

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const [existing] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1)

  if (existing) {
    if (existing.passwordHash) {
      return { error: 'An account with this email already exists.' }
    }
    // Google-only account — add password
    const hash = await bcrypt.hash(password, 12)
    await db.update(users).set({ passwordHash: hash }).where(eq(users.email, normalized))
    return {}
  }

  const hash = await bcrypt.hash(password, 12)
  await db.insert(users).values({
    id: crypto.randomUUID(),
    email: normalized,
    passwordHash: hash,
    emailVerified: new Date(),
  })
  return {}
}
