"use client"

import { useState } from "react"
import { Upload, Trash2, Download, Loader2, Sparkles, ImageIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ImageUploader } from "./image-uploader"

export function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile)
    if (newFile) {
      setPreviewUrl(URL.createObjectURL(newFile))
    } else {
      setPreviewUrl(null)
    }
    setResultUrl(null)
    setError(null)
    setProgress(0)
  }

  const removeBg = async () => {
    if (!file) return
    setProcessing(true)
    setError(null)
    setProgress(10)

    try {
      // Dynamic import to avoid SSR issues with WASM
      const { removeBackground } = await import("@imgly/background-removal")
      
      setProgress(30)
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          const p = Math.round((current / total) * 100)
          // Scale progress to 30-90% range during actual removal
          setProgress(30 + (p * 0.6))
        },
        publicPath: "https://static.img.ly/packages/@imgly/background-removal/1.7.0/assets/", // Using CDN for assets to simplify Next.js integration
      })

      setProgress(100)
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error("Background removal error:", err)
      setError("Failed to remove background. Please try a different image.")
    } finally {
      setProcessing(false)
    }
  }

  const downloadResult = () => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "no-background.png"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="mx-auto w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-border bg-card shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] ring-1 ring-border/5">
        <CardHeader className="space-y-1 py-8 text-center">
          <div className="mb-2 flex justify-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_20px_var(--color-primary)]/10">
              <Sparkles className="size-6" />
            </div>
          </div>
          <CardTitle className="font-display text-3xl font-black tracking-tight text-foreground">Background Remover</CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Professional-grade background removal powered by WASM. Fast, private, and 100% free.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          {!resultUrl ? (
            <div className="space-y-8">
              <div className={cn("transition-all duration-500", processing ? "opacity-50 pointer-events-none grayscale" : "opacity-100")}>
                <ImageUploader file={file} previewUrl={previewUrl} onChange={handleFileChange} />
              </div>

              {processing ? (
                <div className="space-y-6 rounded-2xl bg-secondary/30 p-8 ring-1 ring-border/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Loader2 className="size-5 animate-spin text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest text-primary">Processing AI Model…</span>
                    </div>
                    <span className="text-xs font-black text-primary">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-primary/10">
                    <div className="h-full bg-primary shadow-[0_0_10px_var(--color-primary)] transition-all duration-500" />
                  </Progress>
                  <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                    WASM models are being initialized in your browser.
                  </p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    onClick={removeBg}
                    disabled={!file || processing}
                    size="lg"
                    className="group h-14 bg-primary px-12 font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="mr-2 size-5 transition-transform group-hover:rotate-12" /> Remove Background
                  </Button>
                </div>
              )}
              
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center text-xs font-bold text-destructive">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Original</span>
                  <div className="aspect-square overflow-hidden rounded-2xl border border-border/40 bg-muted/20">
                    <img src={previewUrl!} alt="Original" className="h-full w-full object-contain" />
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Processed</span>
                  <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-primary/20 bg-[url('/checkerboard.png')] bg-repeat shadow-2xl">
                     {/* Placeholder for checkerboard background if file doesn't exist, using CSS gradient instead */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)", backgroundSize: "20px 20px", backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px" }} />
                    <img src={resultUrl} alt="Result" className="relative h-full w-full object-contain" />
                    <div className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      <CheckCircle2 className="size-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-14 bg-primary px-12 font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={downloadResult}
                >
                  <Download className="mr-2 size-5" /> Download PNG
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 border-border px-12 font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-secondary hover:text-primary"
                  onClick={() => handleFileChange(null)}
                >
                  <Trash2 className="mr-2 size-5" /> Start Over
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "100% Private", desc: "Images never leave your browser. All processing is local." },
          { icon: ImageIcon, title: "High Quality", desc: "Neural networks ensure clean edges and sharp details." },
          { icon: CheckCircle2, title: "Easy Export", desc: "Download high-resolution transparent PNGs in one click." },
        ].map((feat, i) => (
          <div key={i} className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-card border border-border/60 text-primary shadow-sm">
              <feat.icon className="size-5" />
            </div>
            <h4 className="mb-1 text-xs font-black uppercase tracking-widest text-foreground">{feat.title}</h4>
            <p className="text-[11px] font-medium text-muted-foreground/60">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

import { ShieldCheck } from "lucide-react"
