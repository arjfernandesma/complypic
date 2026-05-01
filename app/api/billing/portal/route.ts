import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { requireUser } from '@/lib/auth-helpers'
import { getUserByEmail } from '@/lib/db/queries'

export async function POST() {
  const user = await requireUser()

  if (!user.email) {
    return NextResponse.json({ error: 'No email on session' }, { status: 400 })
  }

  const dbUser = await getUserByEmail(user.email)
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 })
  }

  const baseUrl = process.env.AUTH_URL ?? 'https://complypic.com'

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${baseUrl}/account`,
  })

  return NextResponse.json({ url: portalSession.url })
}
