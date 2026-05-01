import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { auth } from '@/lib/auth'
import { getUserByEmail } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { priceId, email } = body as { priceId?: string; email?: string }

  if (!priceId) {
    return NextResponse.json({ error: 'priceId is required' }, { status: 400 })
  }

  const session = await auth()
  const userEmail = session?.user?.email ?? email

  if (!userEmail) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }

  const baseUrl = process.env.AUTH_URL ?? 'https://complypic.com'

  let customerId: string | undefined

  if (session?.user?.email) {
    const user = await getUserByEmail(session.user.email)
    if (user?.stripeCustomerId) {
      customerId = user.stripeCustomerId
    }
  }

  const price = await stripe.prices.retrieve(priceId)
  const isOneTime = price.type === 'one_time'

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: isOneTime ? 'payment' : 'subscription',
    customer: customerId,
    customer_email: customerId ? undefined : userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/account?checkout=success`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { email: userEmail },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
