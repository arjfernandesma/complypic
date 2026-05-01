'use client'

import Link from 'next/link'
import { ZapIcon, ImageIcon, ArchiveIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: 'bulk' | 'ai-parse'
}

const COPY = {
  bulk: {
    title: 'Process up to 50 images at once',
    description:
      'Upgrade to Pro to unlock bulk image processing — apply compliance requirements to an entire batch, download as ZIP, and save hours of manual work.',
    icon: ArchiveIcon,
  },
  'ai-parse': {
    title: "You've hit today's AI parse limit",
    description:
      'Free users get 1 AI prompt parse per day. Upgrade to Pro for 100 parses per month and bulk processing.',
    icon: ZapIcon,
  },
}

export function UpgradeModal({ open, onOpenChange, reason = 'bulk' }: UpgradeModalProps) {
  const { title, description, icon: Icon } = COPY[reason]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="size-6 text-primary" />
          </div>
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pro — $12/month
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <ImageIcon className="size-3.5 text-primary" />
              Bulk batch: up to 50 images
            </li>
            <li className="flex items-center gap-2">
              <ZapIcon className="size-3.5 text-primary" />
              300 credits / month
            </li>
            <li className="flex items-center gap-2">
              <ArchiveIcon className="size-3.5 text-primary" />
              ZIP batch download
            </li>
          </ul>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button asChild>
            <Link href="/pricing" onClick={() => onOpenChange(false)}>
              See plans
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
