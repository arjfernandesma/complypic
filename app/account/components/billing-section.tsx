'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLinkIcon, ZapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BillingSectionProps {
  plan: string
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export function BillingSection({ plan, currentPeriodEnd, cancelAtPeriodEnd }: BillingSectionProps) {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">Billing</h2>
      {plan === 'free' ? (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4">
          <p className="text-sm text-muted-foreground">
            You&apos;re on the free plan. Upgrade to unlock bulk processing.
          </p>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href="/pricing">
                <ZapIcon className="size-4" />
                View plans
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              {cancelAtPeriodEnd
                ? `Access ends on ${currentPeriodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                : `Next billing date: ${currentPeriodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={openPortal} disabled={loading}>
              <ExternalLinkIcon className="size-4" />
              {loading ? 'Opening portal…' : 'Manage billing'}
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing">
                <ZapIcon className="size-4" />
                Buy credit pack
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
