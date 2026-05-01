import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { requireUser } from '@/lib/auth-helpers'
import { getActiveSubscription } from '@/lib/db/queries'
import { PLAN_LIMITS, type PlanId } from '@/lib/stripe/plans'
import { PlanSection } from './components/plan-section'
import { BillingSection } from './components/billing-section'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Account',
}

export default async function AccountPage() {
  const user = await requireUser()
  const sub = await getActiveSubscription(user.id)

  const plan = (sub?.plan ?? 'free') as PlanId
  const limits = PLAN_LIMITS[plan]
  const creditsRemaining = sub?.imageCreditsRemaining ?? 0
  const totalCredits = limits.imageCredits

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-8 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Back to app
          </Link>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold">Account</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PlanSection
                plan={plan}
                creditsRemaining={creditsRemaining}
                totalCredits={totalCredits}
                nextResetDate={sub?.currentPeriodEnd ?? null}
              />
              <Separator />
              <BillingSection
                plan={plan}
                currentPeriodEnd={sub?.currentPeriodEnd ?? null}
                cancelAtPeriodEnd={sub?.cancelAtPeriodEnd ?? false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
