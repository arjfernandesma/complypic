import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getActiveSubscription } from "@/lib/db/queries"
import { AppBackground } from "@/components/app-background"
import { SiteHeader } from "@/components/site-header"
import { BatchWorkflow } from "./components/batch-workflow"
import type { PlanId } from "@/lib/stripe/plans"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Bulk Image Processing",
  description: "Process up to 50 images at once with ComplyPic Pro. Apply compliance requirements to entire batches and download a ZIP.",
  robots: { index: false },
}

export default async function BatchPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/batch")
  }

  const sub = await getActiveSubscription(session.user.id)
  const plan = (sub?.plan ?? "free") as PlanId
  const creditsRemaining = sub?.imageCreditsRemaining ?? 0

  return (
    <>
      <AppBackground />
      <SiteHeader />
      <main className="relative z-10 flex min-h-screen flex-col items-center pb-20 pt-12 sm:pt-16">
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Bulk Processing
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Apply compliance requirements to multiple images at once
          </p>
        </div>
        <BatchWorkflow plan={plan} creditsRemaining={creditsRemaining} />
      </main>
    </>
  )
}
