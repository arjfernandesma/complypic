"use client"

import { useCallback, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PlanId } from "@/lib/stripe/plans"
import type { ComplianceRequirements } from "@/lib/compliance-types"
import type { FileWithPreview } from "./bulk-uploader"
import type { BatchStatusResponse } from "@/app/api/batch/[batchId]/status/route"
import { BulkUploader } from "./bulk-uploader"
import { BatchConfig } from "./batch-config"
import { BatchReview } from "./batch-review"
import { BatchProgress } from "./batch-progress"
import { BatchDownload } from "./batch-download"
import { UpgradeModal } from "@/components/upgrade-modal"

type WorkflowStep = "upload" | "configure" | "review" | "processing" | "download"

const STEPS: { id: WorkflowStep; label: string; title: string; description: string }[] = [
  { id: "upload", label: "Upload", title: "Step 1: Upload", description: "Select the images you want to process" },
  { id: "configure", label: "Configure", title: "Step 2: Configure", description: "Set compliance requirements for all images" },
  { id: "review", label: "Review", title: "Step 3: Review", description: "Confirm credit cost and submit" },
  { id: "processing", label: "Processing", title: "Step 4: Processing", description: "Your batch is being processed" },
  { id: "download", label: "Download", title: "Step 5: Download", description: "Your images are ready" },
]

const STEP_ORDER: WorkflowStep[] = ["upload", "configure", "review", "processing", "download"]

interface BatchWorkflowProps {
  plan: PlanId
  creditsRemaining: number
}

export function BatchWorkflow({ plan, creditsRemaining }: BatchWorkflowProps) {
  const [step, setStep] = useState<WorkflowStep>("upload")
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [requirements, setRequirements] = useState<ComplianceRequirements | null>(null)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [batchId, setBatchId] = useState<string | null>(null)
  const [creditsReserved, setCreditsReserved] = useState(0)
  const [lastStatusData, setLastStatusData] = useState<BatchStatusResponse | null>(null)
  const [showUpgradeGate, setShowUpgradeGate] = useState(false)

  const canUseBulk = plan === "pro" || plan === "founding_pro" || plan === "business"

  const currentIdx = STEP_ORDER.indexOf(step)
  const currentMeta = STEPS[currentIdx]

  const goTo = (s: WorkflowStep) => setStep(s)

  const handleFilesChange = useCallback((updated: FileWithPreview[]) => {
    setFiles(updated)
  }, [])

  const handleReset = () => {
    files.forEach((f) => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl) })
    setFiles([])
    setRequirements(null)
    setRemoveBackground(false)
    setBatchId(null)
    setCreditsReserved(0)
    setLastStatusData(null)
    setStep("upload")
  }

  const handleProgressComplete = useCallback(async () => {
    if (!batchId) return
    try {
      const res = await fetch(`/api/batch/${batchId}/status`)
      if (res.ok) {
        const data: BatchStatusResponse = await res.json()
        setLastStatusData(data)
      }
    } catch {
      // proceed to download regardless
    }
    goTo("download")
  }, [batchId])

  const handleRetryFromDownload = () => {
    setLastStatusData(null)
    goTo("processing")
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-3 sm:px-6 md:px-12">
      <div className="mb-10 flex w-full items-center justify-between sm:mb-12">
        <div className="shrink-0">
          <button
            onClick={() => {
              if (currentIdx > 0 && step !== "processing" && step !== "download") {
                goTo(STEP_ORDER[currentIdx - 1])
              }
            }}
            disabled={currentIdx === 0 || step === "processing" || step === "download"}
            className={cn(
              "group flex h-10 items-center gap-1.5 rounded-md border border-border bg-card/50 px-3 sm:px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm transition-all hover:bg-secondary hover:text-primary",
              (currentIdx === 0 || step === "processing" || step === "download") && "pointer-events-none opacity-0"
            )}
          >
            <ChevronLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>

        <div className="relative flex flex-1 max-w-xl items-center justify-between px-2 mx-1 sm:mx-8">
          <div className="absolute left-8 right-8 h-px bg-muted-foreground/10" />
          <div
            className="absolute left-8 h-px bg-primary transition-all duration-500 ease-in-out"
            style={{
              width: `${(currentIdx / (STEPS.length - 1)) * 100 - (currentIdx === 0 ? 0 : 5)}%`,
              maxWidth: "calc(100% - 4rem)",
            }}
          />
          {STEPS.map((s, idx) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                  step === s.id
                    ? "border-primary bg-primary text-primary-foreground scale-110 shadow-[0_0_15px_var(--color-primary)]"
                    : idx < currentIdx
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/20 bg-card text-muted-foreground/40"
                )}
              >
                {idx < currentIdx ? "✓" : idx + 1}
              </div>
              <span
                className={cn(
                  "absolute -bottom-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                  step === s.id ? "text-primary" : "text-muted-foreground/40"
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="shrink-0 w-16 sm:w-24" />
      </div>

      <div className="w-full mt-4">
        <Card className="border-border bg-card shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] ring-1 ring-border/5">
          <CardHeader className="space-y-1 py-6 text-center">
            <CardTitle className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {currentMeta.title}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground">
              {currentMeta.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-10 pb-6 sm:pb-8">
            {step === "upload" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <BulkUploader
                  files={files}
                  onFilesChange={handleFilesChange}
                  plan={plan}
                  onNext={() => {
                    if (!canUseBulk) {
                      setShowUpgradeGate(true)
                    } else {
                      goTo("configure")
                    }
                  }}
                />
              </div>
            )}

            {step === "configure" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <BatchConfig
                  requirements={requirements}
                  onRequirementsChange={setRequirements}
                  removeBackground={removeBackground}
                  onRemoveBackgroundChange={setRemoveBackground}
                  onNext={() => goTo("review")}
                  onBack={() => goTo("upload")}
                />
              </div>
            )}

            {step === "review" && requirements && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <BatchReview
                  files={files}
                  requirements={requirements}
                  creditsRemaining={creditsRemaining}
                  removeBackground={removeBackground}
                  onNext={({ batchId: id, creditsReserved: credits }) => {
                    setBatchId(id)
                    setCreditsReserved(credits)
                    goTo("processing")
                  }}
                  onBack={() => goTo("configure")}
                />
              </div>
            )}

            {step === "processing" && batchId && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <BatchProgress
                  batchId={batchId}
                  onComplete={handleProgressComplete}
                />
              </div>
            )}

            {step === "download" && batchId && (
              <div className="animate-in zoom-in-95 fade-in duration-500">
                <BatchDownload
                  batchId={batchId}
                  statusData={lastStatusData}
                  onRetry={handleRetryFromDownload}
                  onReset={handleReset}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UpgradeModal
        open={showUpgradeGate}
        onOpenChange={setShowUpgradeGate}
        trigger="batch-gate"
      />
    </div>
  )
}
