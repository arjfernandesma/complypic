"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"
import { Upload, ImageIcon, X, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  file: File | null
  previewUrl: string | null
  onChange: (file: File | null) => void
}

const MAX_SIZE_MB = 20
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]

export function ImageUploader({ file, previewUrl, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    (f: File | null) => {
      setError(null)
      if (!f) {
        onChange(null)
        return
      }
      if (!ACCEPTED.includes(f.type) && !f.type.startsWith("image/")) {
        setError("Please upload a valid image file (JPEG, PNG, or WebP).")
        return
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image must be under ${MAX_SIZE_MB}MB.`)
        return
      }
      onChange(f)
    },
    [onChange],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const onBrowse = () => inputRef.current?.click()
  const onCamera = () => cameraRef.current?.click()

  return (
    <div className="space-y-3">
      {/* Gallery / file-picker input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        aria-label="Choose image from gallery"
      />
      {/* Camera input – opens camera directly on mobile */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        aria-label="Take photo with camera"
      />

      {!file || !previewUrl ? (
        <>
          {/* ── Mobile: two explicit tap targets ─────────────────── */}
          <div className="flex gap-3 sm:hidden">
            <button
              type="button"
              onClick={onCamera}
              className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 text-center transition-colors active:bg-muted/50"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-black/5">
                <Camera className="size-5 text-primary" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-foreground">Take Photo</span>
            </button>

            <button
              type="button"
              onClick={onBrowse}
              className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 text-center transition-colors active:bg-muted/50"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-black/5">
                <ImageIcon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-foreground">Gallery</span>
            </button>
          </div>

          <p className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground/40 sm:hidden">
            JPEG, PNG or WebP · MAX {MAX_SIZE_MB}MB
          </p>

          {/* ── Desktop: drag-and-drop zone ──────────────────────── */}
          <button
            type="button"
            onClick={onBrowse}
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={cn(
              "hidden sm:flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors",
              "hover:border-primary/60 hover:bg-muted/50",
              dragActive && "border-primary bg-primary/5",
            )}
            aria-label="Upload image by clicking or drag and drop"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-black/5">
              <Upload className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-base font-bold tracking-tight text-foreground">Drop image here, or click to browse</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/40">JPEG, PNG or WebP · MAX {MAX_SIZE_MB}MB</p>
            </div>
          </button>
        </>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-background sm:size-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl || "/placeholder.svg"} alt="Uploaded preview" className="size-full object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold tracking-tight text-foreground">{file.name}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/40">
                    {(file.size / 1024).toFixed(0)} KB · {file.type?.split("/")[1] || "IMAGE"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFile(null)}
                  aria-label="Remove image"
                  className="shrink-0"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-fit border-primary/20 bg-primary/5 px-4 text-[10px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-primary-foreground dark:border-primary/20"
                onClick={onBrowse}
              >
                <ImageIcon className="mr-1.5 size-3.5" aria-hidden="true" />
                Replace image
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
