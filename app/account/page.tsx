import { Metadata } from 'next'
import { requireUser } from '@/lib/auth-helpers'
import { getActiveSubscription } from '@/lib/db/queries'
import { PLAN_LIMITS, type PlanId } from '@/lib/stripe/plans'
import { SiteHeader } from '@/components/site-header'
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
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">Account</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
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
