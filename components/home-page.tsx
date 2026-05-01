"use client"

import { ImageIcon } from "lucide-react"
import { ImageComplianceTool } from "@/components/image-compliance-tool"
import { AppBackground } from "@/components/app-background"
import { SiteHeader } from "@/components/site-header"

export function HomePage() {
  return (
    <>
      <AppBackground />
      <SiteHeader />
      <main className="relative min-h-dvh">
        <section className="mx-auto max-w-6xl px-4 pt-6 sm:pt-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <ImageIcon className="size-3" aria-hidden="true" />
              Passports · Permits · Profiles · E‑commerce
            </div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Make any photo meet{" "}
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                official requirements
              </span>
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Upload an image, describe the spec in plain language or pick a preset, and get a fully compliant file —
              correct dimensions, DPI, format, and file size — in a single pass.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
          <ImageComplianceTool />
        </section>

        <footer className="border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <p>Processed on the edge. Images are never stored.</p>
            <p>Built with Next.js &amp; Sharp</p>
          </div>
        </footer>
      </main>
    </>
  )
}
