'use client'

import { useState } from 'react'
import { ZapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CreditPack {
  name: string
  credits: number
  price: number
  priceId: string
}

interface CreditPacksProps {
  packs: CreditPack[]
}

function CreditPackCard({ pack }: { pack: CreditPack }) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ priceId: pack.priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setLoading(false)
    }
  }

  const perCredit = (pack.price / pack.credits).toFixed(3)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-display text-lg">{pack.name}</CardTitle>
        <CardDescription>{pack.credits} credits · ${perCredit}/credit</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="font-display text-3xl font-bold">${pack.price.toFixed(2)}</p>
        <p className="mt-1 text-xs text-muted-foreground">One-time · credits never expire</p>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleBuy}
          disabled={loading || !pack.priceId}
        >
          {loading ? 'Redirecting…' : 'Buy now'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function CreditPacks({ packs }: CreditPacksProps) {
  return (
    <section className="space-y-6">
      <div className="text-center">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground">
          <ZapIcon className="size-3" />
          One-time credit packs
        </div>
        <h2 className="font-display text-2xl font-semibold">Need more credits?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Top-up anytime. Credits never expire and stack with your subscription.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {packs.map((pack) => (
          <CreditPackCard key={pack.name} pack={pack} />
        ))}
      </div>
    </section>
  )
}
