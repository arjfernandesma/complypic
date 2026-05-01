"use client"

import { useState } from "react"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

type UpgradeTrigger = "second-image" | "ai-parse" | "batch-gate"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: UpgradeTrigger
  onContinueSingle?: () => void
}

const COPY: Record<UpgradeTrigger, { title: string; description: string; cta: string }> = {
  "second-image": {
    title: "Want to process 50 images at once?",
    description: "Try Bulk — upgrade to Pro and process entire batches in seconds. Your single-image workflow stays free forever.",
    cta: "Try Bulk →",
  },
  "ai-parse": {
    title: "You've used today's AI quota",
    description: "Upgrade to Pro for 100 AI prompt parses per month. Manual configuration is always free.",
    cta: "See Plans →",
  },
  "batch-gate": {
    title: "Bulk processing is a Pro feature",
    description: "Pro handles 50 images per batch. Business scales to 500. Single-image processing remains free forever.",
    cta: "See Plans →",
  },
}

export function UpgradeModal({ open, onOpenChange, trigger, onContinueSingle }: UpgradeModalProps) {
  const copy = COPY[trigger]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Zap className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-display text-xl font-black tracking-tight">
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <span className="text-primary font-bold">✓</span>
              <span>Pro: 50 images/batch · 300 credits/month</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <span className="text-primary font-bold">✓</span>
              <span>Business: 500 images/batch · 2,000 credits/month</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <span className="text-primary font-bold">✓</span>
              <span>ZIP download · Processing history · Saved presets</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full bg-primary font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            onClick={() => {
              window.location.href = "/pricing"
            }}
          >
            <Zap className="mr-2 size-4" />
            {copy.cta}
          </Button>
          {trigger === "second-image" && onContinueSingle && (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                onOpenChange(false)
                onContinueSingle()
              }}
            >
              Continue with single image
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
