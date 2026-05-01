import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/lib/db/client'
import { subscriptions, creditLedger } from '@/lib/db/schema'
import { upsertUserFromStripe, getActiveSubscription } from '@/lib/db/queries'
import { PLAN_LIMITS, type PlanId } from '@/lib/stripe/plans'
import { grantCredits } from '@/lib/credits'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import Stripe from 'stripe'

export const runtime = 'nodejs'

function planFromPriceId(priceId: string): PlanId {
  const {
    STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY,
    STRIPE_PRICE_BUSINESS_MONTHLY, STRIPE_PRICE_BUSINESS_YEARLY,
    STRIPE_PRICE_FOUNDING_MONTHLY, STRIPE_PRICE_FOUNDING_YEARLY,
  } = process.env

  if (priceId === STRIPE_PRICE_FOUNDING_MONTHLY || priceId === STRIPE_PRICE_FOUNDING_YEARLY) {
    return 'founding_pro'
  }
  if (priceId === STRIPE_PRICE_BUSINESS_MONTHLY || priceId === STRIPE_PRICE_BUSINESS_YEARLY) {
    return 'business'
  }
  if (priceId === STRIPE_PRICE_PRO_MONTHLY || priceId === STRIPE_PRICE_PRO_YEARLY) {
    return 'pro'
  }
  return 'pro'
}

function billingIntervalFromPriceId(priceId: string): string {
  const { STRIPE_PRICE_PRO_YEARLY, STRIPE_PRICE_BUSINESS_YEARLY, STRIPE_PRICE_FOUNDING_YEARLY } = process.env
  if (
    priceId === STRIPE_PRICE_PRO_YEARLY ||
    priceId === STRIPE_PRICE_BUSINESS_YEARLY ||
    priceId === STRIPE_PRICE_FOUNDING_YEARLY
  ) {
    return 'year'
  }
  return 'month'
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session
  if (session.mode !== 'subscription') return

  const customerEmail = session.customer_email ?? session.metadata?.email
  if (!customerEmail) return

  const customerId = session.customer as string
  const user = await upsertUserFromStripe(customerEmail, customerId)

  const stripeSubscriptionId = session.subscription as string
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  const priceId = subscription.items.data[0]?.price.id ?? ''
  const plan = planFromPriceId(priceId)
  const interval = billingIntervalFromPriceId(priceId)
  const credits = PLAN_LIMITS[plan].imageCredits

  const existing = await getActiveSubscription(user.id)

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        stripeSubscriptionId,
        plan,
        status: subscription.status,
        billingInterval: interval,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        imageCreditsRemaining: credits,
        aiParseRemaining: PLAN_LIMITS[plan].aiParsePerMonth,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id))
  } else {
    await db.insert(subscriptions).values({
      id: nanoid(),
      userId: user.id,
      stripeSubscriptionId,
      plan,
      status: subscription.status,
      billingInterval: interval,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      imageCreditsRemaining: credits,
      aiParseRemaining: PLAN_LIMITS[plan].aiParsePerMonth,
    })
  }

  await db
    .insert(creditLedger)
    .values({
      userId: user.id,
      delta: credits,
      reason: 'subscription_created',
      refId: stripeSubscriptionId,
      stripeEventId: event.id,
    })
    .onConflictDoNothing()
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as any
  const stripeSubscriptionId = invoice.subscription as string | null
  if (!stripeSubscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  const priceId = subscription.items.data[0]?.price.id ?? ''
  const plan = planFromPriceId(priceId)
  const credits = PLAN_LIMITS[plan].imageCredits

  const subRows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1)

  if (!subRows[0]) return

  await db
    .update(subscriptions)
    .set({
      imageCreditsRemaining: 0,
      aiParseRemaining: PLAN_LIMITS[plan].aiParsePerMonth,
      creditsResetAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subRows[0].id))

  await grantCredits(subRows[0].userId, credits, event.id)
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription
  const priceId = sub.items.data[0]?.price.id ?? ''
  const plan = planFromPriceId(priceId)
  const interval = billingIntervalFromPriceId(priceId)

  await db
    .update(subscriptions)
    .set({
      plan,
      status: sub.status,
      billingInterval: interval,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription

  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event)
        break
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
