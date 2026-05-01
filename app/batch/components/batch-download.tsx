"use client"

import { useState } from "react"
import { Download, Loader2, RotateCcw, Plus, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BatchStatusResponse } from "@/app/api/batch/[batchId]/status/route"

interface BatchDownloadProps {
  batchId: string
  statusData: BatchStatusResponse | null
  onRetry: () => void
  onReset: () => void
}

export function BatchDownload({ batchId, statusData, onRetry, onReset }: BatchDownloadProps) {
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)

  const total = statusData?.total ?? 0
  const completed = statusData?.completed ?? 0
  const failed = statusData?.failed ?? 0
  const failedItems = statusData?.results.filter((r) => r.status === "failed") ?? []

  const handleRetry = async () => {
    setRetrying(true)
    setRetryError(null)
    try {
      const res = await fetch(`/api/batch/${batchId}/retry`, { method: "POST" })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Retry failed")
      }
      onRetry()
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-secondary/30 px-6 py-5 text-center">
        <p className="font-display text-2xl font-black tracking-tight text-foreground">
          {completed} of {total}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">images processed successfully</p>
      </div>

      <a
        href={`/api/batch/${batchId}/download`}
        download
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Download className="size-4" />
        Download ZIP
      </a>

      {retryError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
          {retryError}
        </div>
      )}

      {failedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black uppercase tracking-widest text-destructive">
              Failed images ({failedItems.length})
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retrying}
              className="h-8 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              {retrying ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <RotateCcw className="size-3" />
              )}
              Retry Failed
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-destructive/20 divide-y divide-destructive/10">
            {failedItems.map((img) => (
              <div key={img.filename} className="flex items-start gap-3 px-4 py-3">
                <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground" title={img.filename}>
                    {img.filename}
                  </p>
                  {img.error && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{img.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <Button
          variant="outline"
          onClick={onReset}
          className="w-full h-10 border-border font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-primary"
        >
          <Plus className="mr-2 size-4" /> Process New Batch
        </Button>
      </div>
    </div>
  )
}
