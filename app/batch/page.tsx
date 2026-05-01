import type { Metadata } from "next"
import { AppBackground } from "@/components/app-background"
import { BatchWorkflow } from "./components/batch-workflow"
import type { Plan } from "@/lib/stripe/plans"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Bulk Image Processing",
  description: "Process up to 50 images at once with ComplyPic Pro. Apply compliance requirements to entire batches and download a ZIP.",
  robots: { index: false },
}

export default async function BatchPage() {
  const plan: Plan = "pro"
  const creditsRemaining = 300

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AppBackground />
      <main className="relative z-10 flex flex-col items-center pb-20 pt-16 sm:pt-24">
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
    </div>
  )
}
