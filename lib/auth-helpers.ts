import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function getOptionalUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireUser() {
  const user = await getOptionalUser()
  if (!user) {
    redirect('/signin')
  }
  return user
}

export async function requirePlan(minPlan: 'pro' | 'business') {
  const user = await requireUser()
  const planOrder: Record<string, number> = {
    free: 0,
    pro: 1,
    founding_pro: 1,
    business: 2,
  }
  const userRank = planOrder[user.plan ?? 'free'] ?? 0
  const requiredRank = planOrder[minPlan] ?? 0
  if (userRank < requiredRank) {
    redirect('/pricing')
  }
  return user
}
