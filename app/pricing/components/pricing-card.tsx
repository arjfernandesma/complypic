'use client'

import { useState } from 'react'
import { CheckIcon, SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PricingFeature {
  text: string
}

interface PricingCardProps {
  name: string
  description: string
  monthlyPrice: number | null
  yearlyPrice: number | null
  monthlyPriceId: string | null
  yearlyPriceId: string | null
  features: PricingFeature[]
  highlighted?: boolean
  badge?: string
  isAnnual: boolean
  ctaLabel?: string
  isFree?: boolean
}

export function PricingCard({
  name,
  description,
  monthlyPrice,
  yearlyPrice,
  monthlyPriceId,
  yearlyPriceId,
  features,
  highlighted = false,
  badge,
  isAnnual,
  ctaLabel,
  isFree = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)

  const displayPrice = isAnnual ? yearlyPrice : monthlyPrice
  const priceId = isAnnual ? yearlyPriceId : monthlyPriceId

  async function handleCheckout() {
    if (!priceId) return
    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setLoading(false)
    }
  }

  const monthlyCost = isAnnual && yearlyPrice !== null
    ? (yearlyPrice / 12).toFixed(2)
    : monthlyPrice?.toFixed(2) ?? '0'

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        highlighted && 'border-primary shadow-lg ring-1 ring-primary/30',
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {badge}
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-display text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div>
          {isFree ? (
            <p className="font-display text-4xl font-bold">Free</p>
          ) : (
            <div className="flex items-end gap-1">
              <span className="font-display text-4xl font-bold">${monthlyCost}</span>
              <span className="mb-1 text-sm text-muted-foreground">/month</span>
            </div>
          )}
          {isAnnual && yearlyPrice !== null && !isFree && (
            <p className="mt-1 text-xs text-muted-foreground">
              Billed ${yearlyPrice}/year
            </p>
          )}
        </div>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isFree ? (
          <Button variant="outline" className="w-full" asChild>
            <a href="/">Start for free</a>
          </Button>
        ) : (
          <Button
            className={cn('w-full', highlighted && 'bg-primary text-primary-foreground hover:bg-primary/90')}
            onClick={handleCheckout}
            disabled={loading || !priceId}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <SparklesIcon className="size-4 animate-spin" />
                Redirecting…
              </span>
            ) : (
              ctaLabel ?? `Get ${name}`
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
