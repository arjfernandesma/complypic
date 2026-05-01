'use client'

import { useState } from 'react'
import { StarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface FoundingBannerProps {
  count: number
  cap: number
  monthlyPriceId: string
  yearlyPriceId: string
  isAnnual: boolean
}

export function FoundingBanner({
  count,
  cap,
  monthlyPriceId,
  yearlyPriceId,
  isAnnual,
}: FoundingBannerProps) {
  const [loading, setLoading] = useState(false)
  const remaining = Math.max(0, cap - count)
  const pct = Math.min(100, (count / cap) * 100)
  const priceId = isAnnual ? yearlyPriceId : monthlyPriceId
  const price = isAnnual ? '$59/year' : '$7/month'

  async function handleJoin() {
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

  if (remaining === 0) return null

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <StarIcon className="size-4 text-primary" />
            <span className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
              Founding Member Offer
            </span>
          </div>
          <p className="font-display text-xl font-bold">
            Pro features at {price} — locked forever
          </p>
          <p className="text-sm text-muted-foreground">
            Only available to the first {cap} subscribers. Rate stays the same
            for as long as your subscription is active.
          </p>
        </div>
        <Button
          onClick={handleJoin}
          disabled={loading || !priceId}
          className="shrink-0"
        >
          {loading ? 'Redirecting…' : 'Claim founding rate'}
        </Button>
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{count} claimed</span>
          <span>{remaining} spots left</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>
    </div>
  )
}
