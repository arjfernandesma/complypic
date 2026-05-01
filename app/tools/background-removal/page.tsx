import type { Metadata } from "next"
import { BackgroundRemover } from "@/components/background-remover"
import { AppBackground } from "@/components/app-background"
import { SiteHeader } from "@/components/site-header"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Remove Background from Photo Free — AI Online Tool | ComplyPic",
  description:
    "Remove background from any photo instantly, free. AI-powered, runs entirely in your browser — your image never leaves your device. Works on portraits, products, IDs and more.",
  openGraph: {
    title: "Remove Background from Photo Free — AI Online Tool | ComplyPic",
    description:
      "Remove background from any photo instantly, free. AI-powered, runs entirely in your browser — your image never leaves your device.",
    url: "https://complypic.com/tools/background-removal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Background from Photo Free — AI Online Tool | ComplyPic",
    description:
      "Remove background from any photo instantly, free. AI-powered and privacy-first — your image never leaves your device.",
  },
}

export default function BackgroundRemovalPage() {
  return (
    <>
      <AppBackground />
      <SiteHeader />
      <main className="relative min-h-dvh">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <BackgroundRemover />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="space-y-6 rounded-xl border border-border bg-card/50 p-6 text-sm text-muted-foreground">
            <div>
              <h2 className="mb-2 text-base font-semibold text-foreground">
                Free background removal — no upload, no account
              </h2>
              <p className="leading-relaxed">
                ComplyPic's background remover runs entirely inside your browser using a WebAssembly AI model.
                Your image is processed locally on your device and <strong className="text-foreground">never sent to any server</strong>.
                It works on portraits, product photos, ID pictures, and anything else you need to cut out.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">Frequently asked questions</h2>

              <details className="group rounded-lg border border-border">
                <summary className="cursor-pointer list-none px-4 py-3 font-medium text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                  Is it really free?
                </summary>
                <p className="border-t border-border px-4 py-3">
                  Yes — completely free, no limits, no account required. The AI model runs in WebAssembly
                  directly in your browser, so there's no server cost for us to pass on to you.
                </p>
              </details>

              <details className="group rounded-lg border border-border">
                <summary className="cursor-pointer list-none px-4 py-3 font-medium text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                  Does my photo get uploaded to your servers?
                </summary>
                <p className="border-t border-border px-4 py-3">
                  No. The entire process happens on your device. ComplyPic never receives, stores, or
                  processes your image on a server when using the background remover. This makes it safe
                  for sensitive documents like ID photos and passports.
                </p>
              </details>

              <details className="group rounded-lg border border-border">
                <summary className="cursor-pointer list-none px-4 py-3 font-medium text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                  What image formats are supported?
                </summary>
                <p className="border-t border-border px-4 py-3">
                  JPEG, PNG, and WebP are all supported as input. The result is exported as a PNG with a
                  transparent background, which you can then use directly or pass through the{" "}
                  <Link href="/" className="text-primary underline-offset-2 hover:underline">
                    compliance tool
                  </Link>{" "}
                  to resize it to exact passport or ID photo specs.
                </p>
              </details>
            </div>
          </div>
        </section>

        <footer className="mt-auto border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <p>Processed on your device. Images are never uploaded to our servers.</p>
            <p>Powered by WASM &amp; @imgly/background-removal</p>
          </div>
        </footer>
      </main>
    </>
  )
}
