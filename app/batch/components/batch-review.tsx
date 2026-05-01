"use client"

import { useState } from "react"
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type ComplianceRequirements } from "@/lib/compliance-types"
import type { FileWithPreview } from "./bulk-uploader"

interface BatchReviewProps {
  files: FileWithPreview[]
  requirements: ComplianceRequirements
  creditsRemaining: number
  removeBackground: boolean
  onNext: (data: { batchId: string; creditsReserved: number }) => void
  onBack: () => void
}

export function BatchReview({
  files,
  requirements,
  creditsRemaining,
  removeBackground,
  onNext,
  onBack,
}: BatchReviewProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validFiles = files.filter((f) => f.status === "valid")
  const creditCost = validFiles.length
  const creditsAfter = creditsRemaining - creditCost
  const insufficient = creditsAfter < 0

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const createRes = await fetch("/api/batch/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: validFiles.length }),
      })
      if (!createRes.ok) {
        const body = await createRes.json()
        throw new Error(body.error || "Failed to create batch")
      }
      const { batchId, creditsReserved } = await createRes.json()

      const formData = new FormData()
      formData.append("requirements", JSON.stringify(requirements))
      for (const item of validFiles) {
        formData.append("files", item.file, item.file.name)
      }

      const submitRes = await fetch(`/api/batch/${batchId}/submit`, {
        method: "POST",
        body: formData,
      })
      if (!submitRes.ok) {
        const body = await submitRes.json()
        throw new Error(body.error || "Failed to submit batch")
      }

      onNext({ batchId, creditsReserved })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <ReviewRow label="Images selected" value={`${validFiles.length} image${validFiles.length === 1 ? "" : "s"}`} />
        <ReviewRow label="Dimensions" value={`${requirements.width} × ${requirements.height} px`} />
        <ReviewRow label="DPI" value={`${requirements.dpi} DPI`} />
        <ReviewRow label="Format" value={requirements.format.toUpperCase()} />
        <ReviewRow label="Fit" value={requirements.fit === "cover" ? "Crop to fill" : "Add padding"} />
        {requirements.maxFileSizeKb && (
          <ReviewRow label="Max file size" value={`${requirements.maxFileSizeKb} KB`} />
        )}
        {removeBackground && (
          <ReviewRow label="Background removal" value="Enabled (slower)" highlight />
        )}
      </div>

      <div className={`rounded-xl border p-4 ${insufficient ? "border-destructive/30 bg-destructive/10" : "border-border bg-secondary/30"}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-black uppercase tracking-widest text-foreground">Credit cost</span>
          <span className={`font-bold ${insufficient ? "text-destructive" : "text-foreground"}`}>
            {creditCost} credits
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Remaining after this batch</span>
          <span className={insufficient ? "font-bold text-destructive" : ""}>{creditsAfter}</span>
        </div>
        {insufficient && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-destructive">
            <AlertTriangle className="size-3.5" />
            Not enough credits — please reduce batch size or purchase more.
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="h-10 border-border px-5 font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-primary"
        >
          <ChevronLeft className="mr-1.5 size-3.5" /> Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading || insufficient}
          className="h-10 bg-primary px-6 font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Submitting…
            </>
          ) : (
            "Confirm & Process"
          )}
        </Button>
      </div>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  )
}
