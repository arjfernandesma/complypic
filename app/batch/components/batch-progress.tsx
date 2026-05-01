"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BatchStatusResponse, BatchImageResult } from "@/app/api/batch/[batchId]/status/route"

interface BatchProgressProps {
  batchId: string
  onComplete: () => void
}

const TERMINAL_STATUSES = new Set(["completed", "partial", "failed"])

export function BatchProgress({ batchId, onComplete }: BatchProgressProps) {
  const [data, setData] = useState<BatchStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const completedTimestamps = useRef<number[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/batch/${batchId}/status`)
        if (res.status === 410) {
          setError("Batch expired — please resubmit your images.")
          clearInterval(intervalRef.current!)
          return
        }
        if (!res.ok) throw new Error("Failed to fetch status")
        const json: BatchStatusResponse = await res.json()
        setData(json)

        if (json.completed > 0) {
          completedTimestamps.current.push(Date.now())
          if (completedTimestamps.current.length > 20) {
            completedTimestamps.current.shift()
          }
        }

        if (TERMINAL_STATUSES.has(json.status)) {
          clearInterval(intervalRef.current!)
          setTimeout(onComplete, 800)
        }
      } catch {
        setError("Lost connection to server — retrying…")
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 2000)
    return () => clearInterval(intervalRef.current!)
  }, [batchId, onComplete])

  const eta = computeEta(data, completedTimestamps.current)
  const progressPct = data ? (data.total > 0 ? (data.completed / data.total) * 100 : 0) : 0

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-black uppercase tracking-widest text-foreground">
            {data ? `${data.completed} of ${data.total} processed` : "Starting…"}
          </span>
          {eta !== null && (
            <span className="text-xs text-muted-foreground">~{formatSeconds(eta)} remaining</span>
          )}
        </div>
        <Progress value={progressPct} className="h-2" />
        <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {data && (
            <>
              <span className="text-green-600 dark:text-green-400">{data.completed} done</span>
              {data.processing > 0 && <span className="text-primary">{data.processing} processing</span>}
              {data.queued > 0 && <span>{data.queued} queued</span>}
              {data.failed > 0 && <span className="text-destructive">{data.failed} failed</span>}
            </>
          )}
        </div>
      </div>

      {data && data.results.length > 0 && (
        <div className="overflow-y-auto max-h-64 rounded-xl border border-border divide-y divide-border sm:max-h-96">
          {data.results.map((img) => (
            <ImageRow key={img.filename} img={img} />
          ))}
        </div>
      )}

      {!data && !error && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}

function ImageRow({ img }: { img: BatchImageResult }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <StatusIcon status={img.status} />
      <span className="flex-1 truncate text-sm text-foreground" title={img.filename}>
        {img.filename}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {img.fileSizeKb && (
          <span className="text-[10px] text-muted-foreground">{img.fileSizeKb} KB</span>
        )}
        <StatusBadge status={img.status} />
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: BatchImageResult["status"] }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="size-4 shrink-0 text-green-500" />
    case "failed":
      return <XCircle className="size-4 shrink-0 text-destructive" />
    case "processing":
      return <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
    default:
      return <Clock className="size-4 shrink-0 text-muted-foreground/50" />
  }
}

function StatusBadge({ status }: { status: BatchImageResult["status"] }) {
  const map: Record<BatchImageResult["status"], { label: string; cls: string }> = {
    queued: { label: "queued", cls: "bg-secondary text-secondary-foreground border-border" },
    processing: { label: "processing", cls: "bg-primary/10 text-primary border-primary/20" },
    done: { label: "done", cls: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400" },
    failed: { label: "failed", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  }
  const { label, cls } = map[status]
  return (
    <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest", cls)}>
      {label}
    </span>
  )
}

function computeEta(data: BatchStatusResponse | null, timestamps: number[]): number | null {
  if (!data || data.total === 0 || data.completed === 0) return null
  const remaining = data.total - data.completed
  if (remaining === 0) return 0
  if (timestamps.length < 2) return null
  const windowMs = timestamps[timestamps.length - 1] - timestamps[0]
  const rate = (timestamps.length - 1) / (windowMs / 1000)
  if (rate <= 0) return null
  return Math.ceil(remaining / rate)
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`
}
