import { BackgroundRemover } from "@/components/background-remover"
import { AppBackground } from "@/components/app-background"
import { Sparkles, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function BackgroundRemovalPage() {
  return (
    <>
      <AppBackground />
      <main className="relative min-h-dvh">
        <header className="border-b border-border/60 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <div className="flex items-center justify-center overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="ComplyPic Logo" className="h-9 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-none text-foreground">ComplyPic</h1>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Tools / Background Remover</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
               <Link href="/">
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
                  <ChevronLeft className="size-3.5" /> Back to Home
                </button>
              </Link>
              <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur sm:flex">
                <Sparkles className="size-3" aria-hidden="true" />
                Powered by AI
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <BackgroundRemover />
        </section>

        <footer className="border-t border-border/60 mt-auto">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <p>Processed on your device. Images are never uploaded to our servers.</p>
            <p>Powered by WASM &amp; @imgly/background-removal</p>
          </div>
        </footer>
      </main>
    </>
  )
}
