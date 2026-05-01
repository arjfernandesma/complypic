import { Metadata } from 'next'
import { PricingContent } from './pricing-content'
import { SiteHeader } from '@/components/site-header'
import { db } from '@/lib/db/client'
import { subscriptions } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for ComplyPic. Free for single images, Pro and Business plans for bulk processing.',
}

export const revalidate = 60

async function getFoundingCount(): Promise<number> {
  try {
    const rows = await db
      .select({ c: count() })
      .from(subscriptions)
      .where(eq(subscriptions.plan, 'founding_pro'))
    return Number(rows[0]?.c ?? 0)
  } catch {
    return 0
  }
}

export default async function PricingPage() {
  const foundingCount = await getFoundingCount()

  return (
    <>
      <SiteHeader />
      <PricingContent
        foundingCount={foundingCount}
        foundingCap={100}
        prices={{
          proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
          proYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
          businessMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? '',
          businessYearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? '',
          foundingMonthly: process.env.STRIPE_PRICE_FOUNDING_MONTHLY ?? '',
          foundingYearly: process.env.STRIPE_PRICE_FOUNDING_YEARLY ?? '',
          packStarter: process.env.STRIPE_PRICE_PACK_STARTER ?? '',
          packStandard: process.env.STRIPE_PRICE_PACK_STANDARD ?? '',
          packPro: process.env.STRIPE_PRICE_PACK_PRO ?? '',
        }}
      />
    </>
  )
}
