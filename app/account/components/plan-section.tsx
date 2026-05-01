import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface PlanSectionProps {
  plan: string
  creditsRemaining: number
  totalCredits: number
  nextResetDate: Date | null
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  founding_pro: 'Founding Pro',
}

export function PlanSection({
  plan,
  creditsRemaining,
  totalCredits,
  nextResetDate,
}: PlanSectionProps) {
  const used = totalCredits - creditsRemaining
  const pct = totalCredits > 0 ? Math.round((creditsRemaining / totalCredits) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-lg font-semibold">Current plan</h2>
        <Badge variant={plan === 'free' ? 'outline' : 'default'}>
          {PLAN_LABELS[plan] ?? plan}
        </Badge>
      </div>
      {totalCredits > 0 ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Credits remaining</span>
            <span className="font-medium">{creditsRemaining} / {totalCredits}</span>
          </div>
          <Progress value={pct} />
          <p className="text-xs text-muted-foreground">
            {used} credits used
            {nextResetDate && (
              <> · resets {nextResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
            )}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Free plan — upgrade to unlock bulk processing credits.
        </p>
      )}
    </div>
  )
}
