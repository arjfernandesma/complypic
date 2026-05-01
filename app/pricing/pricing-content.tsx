'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheckIcon } from 'lucide-react'
import { PricingCard } from './components/pricing-card'
import { CreditPacks } from './components/credit-packs'
import { FoundingBanner } from './components/founding-banner'

interface Prices {
  proMonthly: string
  proYearly: string
  businessMonthly: string
  businessYearly: string
  foundingMonthly: string
  foundingYearly: string
  packStarter: string
  packStandard: string
  packPro: string
}

interface PricingContentProps {
  foundingCount: number
  foundingCap: number
  prices: Prices
}

export function PricingContent({ foundingCount, foundingCap, prices }: PricingContentProps) {
  const [isAnnual, setIsAnnual] = useState(false)

  const freeFeatures = [
    { text: 'Single-image processing — unlimited' },
    { text: '18+ compliance presets' },
    { text: 'Background removal (free, WASM)' },
    { text: '1 AI prompt parse / day' },
    { text: 'No sign-up required' },
  ]

  const proFeatures = [
    { text: 'Everything in Free' },
    { text: '300 credits / month (reset each cycle)' },
    { text: 'Bulk batch: up to 50 images' },
    { text: '100 AI prompt parses / month' },
    { text: 'ZIP batch download' },
    { text: 'Saved custom presets' },
    { text: '30-day processing history' },
  ]

  const businessFeatures = [
    { text: 'Everything in Pro' },
    { text: '2,000 credits / month' },
    { text: 'Bulk batch: up to 500 images' },
    { text: '500 AI prompt parses / month' },
    { text: '5 team seats' },
    { text: '50 shared presets' },
    { text: 'API access (500 calls/month)' },
    { text: 'Batch completion webhooks' },
  ]

  const proMonthlyCost = 12
  const proYearlyCost = 99
  const businessMonthlyCost = 39
  const businessYearlyCost = 299

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="ComplyPic" className="mx-auto h-10 w-auto" />
            </Link>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Free for single-image compliance. Upgrade when you need bulk processing.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className={isAnnual ? 'text-muted-foreground text-sm' : 'text-sm font-medium'}>
                Monthly
              </span>
              <button
                role="switch"
                aria-checked={isAnnual}
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[checked=true]:bg-primary"
                data-checked={isAnnual}
              >
                <span
                  className={`pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${isAnnual ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
              <span className={isAnnual ? 'text-sm font-medium' : 'text-muted-foreground text-sm'}>
                Annual
                <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  Save ~30%
                </span>
              </span>
            </div>
          </div>

          {foundingCount < foundingCap && (
            <FoundingBanner
              count={foundingCount}
              cap={foundingCap}
              monthlyPriceId={prices.foundingMonthly}
              yearlyPriceId={prices.foundingYearly}
              isAnnual={isAnnual}
            />
          )}

          <div className="grid gap-6 sm:grid-cols-3">
            <PricingCard
              name="Free"
              description="Perfect for occasional use"
              monthlyPrice={0}
              yearlyPrice={0}
              monthlyPriceId={null}
              yearlyPriceId={null}
              features={freeFeatures}
              isAnnual={isAnnual}
              isFree
            />
            <PricingCard
              name="Pro"
              description="For professionals who process images regularly"
              monthlyPrice={proMonthlyCost}
              yearlyPrice={proYearlyCost}
              monthlyPriceId={prices.proMonthly}
              yearlyPriceId={prices.proYearly}
              features={proFeatures}
              highlighted
              badge="Most popular"
              isAnnual={isAnnual}
            />
            <PricingCard
              name="Business"
              description="For teams and high-volume workflows"
              monthlyPrice={businessMonthlyCost}
              yearlyPrice={businessYearlyCost}
              monthlyPriceId={prices.businessMonthly}
              yearlyPriceId={prices.businessYearly}
              features={businessFeatures}
              isAnnual={isAnnual}
            />
          </div>

          <CreditPacks
            packs={[
              { name: 'Starter', credits: 50, price: 4.99, priceId: prices.packStarter },
              { name: 'Standard', credits: 200, price: 14.99, priceId: prices.packStandard },
              { name: 'Pro Pack', credits: 600, price: 39.99, priceId: prices.packPro },
            ]}
          />

          <div className="flex flex-col items-center gap-2 pt-4 text-center text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="size-4 text-primary" />
              Your images are never stored
            </div>
            <p>Cancel anytime · No lock-in · Secure payments via Stripe</p>
          </div>
        </div>
      </div>
    </div>
  )
}
