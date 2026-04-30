"use client"

import { useEffect, useState, useRef } from "react"
import { ChevronLeft, ChevronRight, Loader2, Wand2, Plus, Download, Sparkles, Eraser, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ImageUploader } from "@/components/image-uploader"
import { RequirementsInput } from "@/components/requirements-input"
import { ResultPreview } from "@/components/result-preview"
import { CropEditor } from "@/components/crop-editor"
import {
  type ComplianceRequirements,
  type CropRegion,
  DEFAULT_REQUIREMENTS,
  type ProcessingResult,
} from "@/lib/compliance-types"
import { cn } from "@/lib/utils"

export function ImageComplianceTool() {
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<ComplianceRequirements>(DEFAULT_REQUIREMENTS)
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [removingBg, setRemovingBg] = useState(false)
  const [bgRemovalProgress, setBgRemovalProgress] = useState(0)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const toolRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentStep > 1) {
      toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [currentStep])

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      setResult(null)
      setCropRegion(null)
      if (currentStep > 1) setCurrentStep(1)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setResult(null)
    setCropRegion(null)

    if (currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 500)
    }

    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    setCropRegion(null)
  }, [requirements.width, requirements.height])

  const onRemoveBackground = async () => {
    if (!file) return
    if (!originalFile) setOriginalFile(file)
    
    setRemovingBg(true)
    setBgRemovalProgress(0)
    
    try {
      // Dynamic import to avoid SSR issues with WASM
      const { removeBackground } = await import("@imgly/background-removal")
      
      const blob = await removeBackground(file, {
        publicPath: "/bg-assets/",
        progress: (key, current, total) => {
          setBgRemovalProgress((current / total) * 100)
        },
      })
      
      const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "-no-bg.png", { type: "image/png" })
      setFile(newFile)
    } catch (err) {
      console.error("[background-removal]", err)
      setError("Failed to remove background. Please try again.")
    } finally {
      setRemovingBg(false)
    }
  }

  const onRestoreOriginal = () => {
    if (originalFile) {
      setFile(originalFile)
      setOriginalFile(null)
    }
  }

  const onProcess = async (targetStep?: number) => {
    if (!file) return
    setProcessing(true)
    setProcessingMessage(null)
    setError(null)
    setResult(null) 
    try {
      let currentFile = file

      setProcessingMessage(null)
      const formData = new FormData()
      formData.append("file", currentFile)
      formData.append("width", String(requirements.width))
      formData.append("height", String(requirements.height))
      formData.append("dpi", String(requirements.dpi))
      formData.append("format", requirements.format)
      formData.append("fit", requirements.fit)
      if (requirements.maxFileSizeKb) {
        formData.append("maxFileSizeKb", String(requirements.maxFileSizeKb))
      }
      if (cropRegion) {
        formData.append("cropRegion", JSON.stringify(cropRegion))
      }

      const res = await fetch("/api/process-image", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Processing failed")
      setResult(data as ProcessingResult)
      
      // Navigate to the target step or the default next step
      if (targetStep) {
        setCurrentStep(targetStep)
      } else {
        setCurrentStep(3)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed")
    } finally {
      setProcessing(false)
    }
  }

  const onDownload = () => {
    if (!result) return
    const a = document.createElement("a")
    a.href = result.dataUrl
    const ext = result.format === "jpeg" ? "jpg" : result.format
    a.download = `compliant-${result.width}x${result.height}-${result.dpi}dpi.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const canProcess = !!file && requirements.width > 0 && requirements.height > 0 && !processing
  const aspect = requirements.width / requirements.height
  const aspectLabel = `${requirements.width} : ${requirements.height}`

  const steps = [
    { id: 1, title: "Upload" },
    { id: 2, title: "Configure" },
    { id: 3, title: "Fine-tune" },
    { id: 4, title: "Result" },
  ]


  const goToStep = (stepId: number) => {
    if (stepId === currentStep) return
    // Allow going back
    if (stepId < currentStep) {
      setCurrentStep(stepId)
      return
    }
    // Forward validation
    if (currentStep === 1 && !file) return
    if (currentStep === 2 && !result && !processing) {
      onProcess()
      return
    }
    setCurrentStep(stepId)
  }

  const nextStep = () => goToStep(currentStep + 1)
  const prevStep = () => goToStep(currentStep - 1)

  return (
    <div ref={toolRef} className="relative mx-auto flex max-w-6xl flex-col items-center px-3 sm:px-6 md:px-12">
      {/* Side Navigation Buttons (Desktop) */}

      {/* Header Navigation & Progress */}
      <div className={cn(
        "mb-10 sm:mb-12 flex w-full items-center justify-between transition-all duration-500 ease-in-out",
        currentStep === 1 ? "max-w-2xl" : "max-w-5xl"
      )}>
        {/* Back Button */}
        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 1 || processing}
            className={cn(
              "group h-10 border-border bg-card/50 px-3 sm:px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm transition-all hover:bg-secondary hover:text-primary dark:border-border dark:bg-card/50",
              currentStep === 1 && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="size-3.5 transition-transform group-hover:-translate-x-1 sm:mr-1.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="relative flex flex-1 max-w-md items-center justify-between px-2 mx-1 sm:mx-8">
          {/* Connection Line (Inactive) */}
          <div className="absolute left-8 right-8 h-px bg-muted-foreground/10" />
          
          {/* Connection Line (Active) */}
          <div 
            className="absolute left-8 h-px bg-primary transition-all duration-500 ease-in-out" 
            style={{ 
              width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * (100) - (currentStep === 1 ? 0 : 5)}%`,
              maxWidth: "calc(100% - 4rem)"
            }}
          />

          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              disabled={step.id > currentStep + 1}
              className="group relative z-10 flex flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-all"
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                  currentStep === step.id
                    ? "border-primary bg-primary text-primary-foreground scale-110 shadow-[0_0_15px_var(--color-primary)]"
                    : currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/20 bg-card text-muted-foreground/40 group-hover:border-primary/40 group-hover:text-primary/40"
                )}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <span
                className={cn(
                  "absolute -bottom-6 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] transition-colors",
                  currentStep === step.id ? "text-primary" : "text-muted-foreground/40"
                )}
              >
                {step.title}
              </span>
            </button>
          ))}
        </div>

        {/* Next Button */}
        <div className="shrink-0">
          <Button
            onClick={nextStep}
            disabled={currentStep === 4 || (currentStep === 1 && !file) || processing}
            className={cn(
              "group h-10 bg-primary px-3 sm:px-5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
              currentStep === 4 && "opacity-0 pointer-events-none"
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1 sm:ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Active Card Area */}
      <div className={cn(
        "relative w-full transition-all duration-500 ease-in-out",
        currentStep === 1 ? "max-w-2xl" : "max-w-5xl"
      )}>
        {/* Processing Overlay */}
        {processing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-background/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 sm:p-10 shadow-2xl ring-1 ring-white/10">
              <div className="relative">
                <Loader2 className="size-12 animate-spin text-primary" />
                <div className="absolute inset-0 size-12 animate-ping rounded-full border-2 border-primary/20" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">
                Optimizing & Verifying Compliance…
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <Card className="border-border bg-card shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] ring-1 ring-border/5">
              <CardHeader className="space-y-1 py-6 text-center">
                <CardTitle className="font-display text-3xl font-black tracking-tight text-foreground">Step 1: Upload</CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">Drag and drop your image to begin compliance check</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-10 pb-6 sm:pb-8">
                <ImageUploader file={file} previewUrl={previewUrl} onChange={setFile} />
                <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                    Industry standard presets available in Step 2
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Configure */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <Card className="border-border bg-card shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] ring-1 ring-border/5">
              <CardHeader className="space-y-1 py-6 text-center">
                <CardTitle className="font-display text-3xl font-black tracking-tight text-foreground">Step 2: Setup</CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">Define dimensions and technical requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-10 pb-6 sm:pb-8">
                <RequirementsInput
                  value={requirements} 
                  onChange={setRequirements} 
                  selectedPresetId={selectedPresetId}
                  onPresetSelect={setSelectedPresetId}
                />
                <div className="flex justify-center">
                  <Button
                    onClick={() => onProcess()}
                    disabled={!canProcess}
                    size="lg"
                    className="group mx-auto h-12 bg-primary px-10 font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" /> {processingMessage || "Analyzing…"}
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 size-5 transition-transform group-hover:rotate-12" /> Generate Image
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Fine-tune */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <Card className="border-border bg-card shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] ring-1 ring-border/5">
              <CardHeader className="space-y-1 py-6 text-center">
                <CardTitle className="font-display text-3xl font-black tracking-tight text-foreground">Step 3: Fine-tune</CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">Adjust the focal point and framing manually</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-10 pb-6 sm:pb-8">
                {/* AI Magic Actions */}
                <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-secondary/30 p-4 ring-1 ring-border/5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[0_0_15px_var(--color-primary)]/10">
                      <Sparkles className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-foreground">AI Enhancements</p>
                      <p className="text-[10px] font-medium text-muted-foreground/60 uppercase">Professional Background Removal</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {originalFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRestoreOriginal}
                        disabled={removingBg}
                        className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Restore Original"
                      >
                        <RotateCcw className="mr-1.5 size-3" /> Restore
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={originalFile ? "secondary" : "default"}
                      onClick={onRemoveBackground}
                      disabled={removingBg}
                      className="h-9 px-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/5 transition-all hover:scale-[1.02]"
                    >
                      {removingBg ? (
                        <>
                          <Loader2 className="mr-2 size-3 animate-spin" />
                          {Math.round(bgRemovalProgress)}%
                        </>
                      ) : originalFile ? (
                        <>
                          <Eraser className="mr-1.5 size-3" /> Re-process
                        </>
                      ) : (
                        <>
                          <Eraser className="mr-1.5 size-3" /> Remove BG
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {removingBg && (
                  <div className="mb-6 space-y-2">
                    <Progress value={bgRemovalProgress} className="h-1 bg-primary/10">
                      <div className="h-full bg-primary shadow-[0_0_10px_var(--color-primary)] transition-all duration-300" />
                    </Progress>
                    <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60">
                      Processing WASM Neural Network…
                    </p>
                  </div>
                )}

                <CropEditor
                  imageSrc={previewUrl!}
                  aspect={aspect}
                  aspectLabel={aspectLabel}
                  initialCrop={cropRegion}
                  onSave={setCropRegion}
                  onClear={() => setCropRegion(null)}
                />
                <div className="mt-8 flex justify-center">
                  <Button 
                    size="lg" 
                    className="h-12 w-full bg-primary font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98]" 
                    onClick={() => onProcess(4)}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> 
                        {processingMessage || "Finalizing…"}
                      </>
                    ) : (
                      <>
                        Apply & Finish <ChevronRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Result */}
        {currentStep === 4 && (
          <div className="animate-in zoom-in-95 fade-in duration-500">
            <Card className="border-border bg-card shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] ring-1 ring-border/5">
              <CardHeader className="space-y-1 py-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <CardTitle className="font-display text-3xl font-black tracking-tight text-foreground">Step 4: Result</CardTitle>
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[0_0_15px_var(--color-primary)]/10">
                    <div className="text-sm font-bold">✓</div>
                  </div>
                </div>
                <CardDescription className="text-sm font-medium text-primary/60">Compliance check passed successfully</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-10 pb-6 sm:pb-8">
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button 
                    size="lg" 
                    className="h-12 bg-primary font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={onDownload}
                  >
                    <Download className="mr-2 size-4" /> Download Image
                  </Button>

                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-12 border-border font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-secondary hover:text-primary"
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      setCropRegion(null);
                      setSelectedPresetId(null);
                      setCurrentStep(1);
                    }}
                  >
                    <Plus className="mr-2 size-4" /> Upload New
                  </Button>

                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-12 border-border font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-secondary hover:text-primary" 
                    onClick={() => setCurrentStep(2)}
                  >
                    Refactor Specs
                  </Button>

                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-12 border-border font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-secondary hover:text-primary" 
                    onClick={() => setCurrentStep(3)}
                  >
                    Re-Adjust Frame
                  </Button>
                </div>

                <ResultPreview originalUrl={previewUrl} result={result} requirements={requirements} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="fixed bottom-10 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-6 py-4 text-sm font-bold text-destructive shadow-2xl backdrop-blur-xl">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}
