"use client"

import Script from "next/script"
import { ImageIcon } from "lucide-react"
import { ImageComplianceTool } from "@/components/image-compliance-tool"
import { AppBackground } from "@/components/app-background"
import { SiteHeader } from "@/components/site-header"
import { AdUnit } from "@/components/ads/ad-unit"

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

// Slot IDs — set these env vars after creating ad units in AdSense
const AD_SLOT_LEFT   = process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR_LEFT  ?? ""
const AD_SLOT_RIGHT  = process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR_RIGHT ?? ""
const AD_SLOT_BOTTOM = process.env.NEXT_PUBLIC_AD_SLOT_BOTTOM        ?? ""

export function HomePage() {
  return (
    <>
      {ADSENSE_CLIENT && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      <AppBackground />
      <SiteHeader />

      <main className="relative min-h-dvh">
        {/* Hero */}
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

        {/* Tool + sidebar ads */}
        <section className="mx-auto max-w-[1500px] px-2 py-6 sm:py-12 sm:px-4">
          <div className="flex items-start gap-4">

            {/* Left sidebar ad — visible only on xl+ */}
            <aside className="hidden xl:flex w-[160px] shrink-0 flex-col items-center gap-3 pt-2">
              <AdUnit slot={AD_SLOT_LEFT} format="vertical" className="w-[160px]" />
            </aside>

            {/* Main tool */}
            <div className="min-w-0 flex-1">
              <ImageComplianceTool />
            </div>

            {/* Right sidebar ad — visible only on xl+ */}
            <aside className="hidden xl:flex w-[160px] shrink-0 flex-col items-center gap-3 pt-2">
              <AdUnit slot={AD_SLOT_RIGHT} format="vertical" className="w-[160px]" />
            </aside>

          </div>
        </section>

        {/* Bottom leaderboard ad */}
        {AD_SLOT_BOTTOM && (
          <section className="mx-auto max-w-[900px] px-4 pb-8">
            <AdUnit slot={AD_SLOT_BOTTOM} format="horizontal" />
          </section>
        )}

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
