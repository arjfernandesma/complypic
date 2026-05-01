"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, X, AlertCircle, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Plan } from "@/lib/stripe/plans"
import { PLAN_LIMITS } from "@/lib/stripe/plans"

const MAX_FILE_BYTES = 10 * 1024 * 1024

export interface FileWithPreview {
  id: string
  file: File
  previewUrl: string
  status: "valid" | "too-large" | "converting"
  error?: string
}

interface BulkUploaderProps {
  files: FileWithPreview[]
  onFilesChange: (files: FileWithPreview[]) => void
  plan: Plan
  onNext: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function isHeic(file: File): Promise<boolean> {
  const buf = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buf)
  const marker = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7])
  return marker === "ftyp"
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default
  const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 })
  const converted = Array.isArray(blob) ? blob[0] : blob
  return new File([converted], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
  })
}

let idCounter = 0
function nextId() {
  return `file-${++idCounter}-${Date.now()}`
}

export function BulkUploader({ files, onFilesChange, plan, onNext }: BulkUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const filesRef = useRef<FileWithPreview[]>(files)
  filesRef.current = files

  const limit = PLAN_LIMITS[plan].maxBatchSize
  const validFiles = files.filter((f) => f.status === "valid")
  const atCapacity = validFiles.length >= limit
  const nearCapacity = validFiles.length >= Math.floor(limit * 0.9) && validFiles.length < limit

  const updateFiles = useCallback(
    (updater: (prev: FileWithPreview[]) => FileWithPreview[]) => {
      const next = updater(filesRef.current)
      filesRef.current = next
      onFilesChange(next)
    },
    [onFilesChange]
  )

  const processFile = useCallback(
    async (raw: File) => {
      const id = nextId()

      const heic = await isHeic(raw)

      if (heic) {
        updateFiles((prev) => [...prev, { id, file: raw, previewUrl: "", status: "converting" }])
        try {
          const converted = await convertHeicToJpeg(raw)
          if (converted.size > MAX_FILE_BYTES) {
            updateFiles((prev) =>
              prev.map((f) =>
                f.id === id
                  ? { id, file: raw, previewUrl: "", status: "too-large", error: "Too large — max 10 MB" }
                  : f
              )
            )
            return
          }
          const previewUrl = URL.createObjectURL(converted)
          updateFiles((prev) =>
            prev.map((f) => (f.id === id ? { id, file: converted, previewUrl, status: "valid" } : f))
          )
        } catch {
          updateFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? { id, file: raw, previewUrl: "", status: "too-large", error: "HEIC conversion failed" }
                : f
            )
          )
        }
        return
      }

      if (raw.size > MAX_FILE_BYTES) {
        const previewUrl = URL.createObjectURL(raw)
        updateFiles((prev) => [
          ...prev,
          { id, file: raw, previewUrl, status: "too-large", error: "Too large — max 10 MB" },
        ])
        return
      }

      const previewUrl = URL.createObjectURL(raw)
      updateFiles((prev) => [...prev, { id, file: raw, previewUrl, status: "valid" }])
    },
    [updateFiles]
  )

  const addFiles = useCallback(
    async (rawFiles: File[]) => {
      const currentValid = filesRef.current.filter((f) => f.status === "valid").length
      const remaining = limit - currentValid
      const toProcess = rawFiles.slice(0, Math.max(0, remaining))
      for (const f of toProcess) {
        await processFile(f)
      }
    },
    [limit, processFile]
  )

  const removeFile = useCallback(
    (id: string) => {
      updateFiles((prev) => {
        const removed = prev.find((f) => f.id === id)
        if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
        return prev.filter((f) => f.id !== id)
      })
    },
    [updateFiles]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const dropped = Array.from(e.dataTransfer.files).filter(
        (f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name)
      )
      addFiles(dropped)
    },
    [addFiles]
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    addFiles(Array.from(e.target.files))
    e.target.value = ""
  }

  const hasValidFiles = validFiles.length > 0

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !atCapacity && inputRef.current?.click()}
        className={cn(
          "flex min-h-48 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-all",
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40",
          atCapacity && "pointer-events-none opacity-50"
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Upload className="size-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-widest text-foreground">
            {dragging ? "Drop files here" : "Drag & drop images"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse · JPEG, PNG, WebP, HEIC · max 10 MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {nearCapacity && !atCapacity && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-700 dark:text-amber-400">
          Approaching limit — {limit - validFiles.length} slots remaining for your {plan} plan.
        </div>
      )}

      {atCapacity && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-700 dark:text-amber-400">
          Batch limit reached — {plan} plan supports up to {limit} images per batch.
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((item) => (
            <FileCard key={item.id} item={item} onRemove={removeFile} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm font-bold text-muted-foreground">
          {hasValidFiles
            ? `This batch will use ${validFiles.length} credit${validFiles.length === 1 ? "" : "s"}`
            : "No valid images selected"}
        </p>
        <Button
          onClick={onNext}
          disabled={!hasValidFiles}
          className="h-10 bg-primary px-6 font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

function FileCard({ item, onRemove }: { item: FileWithPreview; onRemove: (id: string) => void }) {
  const isError = item.status === "too-large"
  const isConverting = item.status === "converting"

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all",
        isError ? "border-destructive/30 opacity-70" : "border-border hover:border-primary/40"
      )}
    >
      <div className="relative aspect-square w-full bg-secondary/30">
        {item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {isConverting ? (
              <Loader2 className="size-8 animate-spin text-primary" />
            ) : (
              <ImageIcon className="size-8 text-muted-foreground/30" />
            )}
          </div>
        )}

        {isConverting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Badge className="gap-1 text-[10px]">
              <Loader2 className="size-3 animate-spin" /> Converting HEIC…
            </Badge>
          </div>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="px-2 py-2">
        <p className="truncate text-[11px] font-medium text-foreground" title={item.file.name}>
          {item.file.name}
        </p>
        {isError ? (
          <Badge variant="destructive" className="mt-1 gap-1 text-[10px]">
            <AlertCircle className="size-3" />
            {item.error}
          </Badge>
        ) : isConverting ? (
          <Badge variant="secondary" className="mt-1 text-[10px]">Converting…</Badge>
        ) : (
          <span className="mt-1 block text-[10px] text-muted-foreground">
            {formatBytes(item.file.size)}
          </span>
        )}
      </div>
    </div>
  )
}
