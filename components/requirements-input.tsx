"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { type ComplianceRequirements, type ImageFormat, type FitMode, PRESETS } from "@/lib/compliance-types"
import { cn } from "@/lib/utils"

interface RequirementsInputProps {
  value: ComplianceRequirements
  onChange: (req: ComplianceRequirements) => void
  selectedPresetId: string | null
  onPresetSelect: (id: string | null) => void
}

export function RequirementsInput({ 
  value, 
  onChange, 
  selectedPresetId, 
  onPresetSelect 
}: RequirementsInputProps) {
  const [parsedMessage, setParsedMessage] = useState<string | null>(null)

  const update = <K extends keyof ComplianceRequirements>(key: K, v: ComplianceRequirements[K]) => {
    onPresetSelect(null)
    onChange({ ...value, [key]: v })
  }

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id)
    if (preset) {
      onPresetSelect(id)
      onChange(preset.requirements)
      setParsedMessage(`Applied preset: ${preset.label}`)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {parsedMessage && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center text-xs font-medium text-primary animate-in fade-in slide-in-from-top-1">
            {parsedMessage}
          </div>
        )}

        {/* Manual Form Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Width (px)</Label>
              <Input
                id="width"
                type="number"
                value={value.width}
                onChange={(e) => update("width", Number.parseInt(e.target.value) || 0)}
                className="h-10 transition-all focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Height (px)</Label>
              <Input
                id="height"
                type="number"
                value={value.height}
                onChange={(e) => update("height", Number.parseInt(e.target.value) || 0)}
                className="h-10 transition-all focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="dpi" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">DPI</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-3.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Dots Per Inch. Higher values (300+) are required for high-quality printing. 72 is standard for web.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={String(value.dpi)} onValueChange={(v) => update("dpi", Number.parseInt(v))}>
                <SelectTrigger id="dpi" className="h-10 transition-all focus:ring-primary/20">
                  <SelectValue placeholder="DPI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="72">72 DPI (Web)</SelectItem>
                  <SelectItem value="150">150 DPI (Draft)</SelectItem>
                  <SelectItem value="300">300 DPI (Official)</SelectItem>
                  <SelectItem value="600">600 DPI (High Res)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="format" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Format</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-3.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    JPEG is best for photos; PNG/WebP provide better quality but larger files.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={value.format} onValueChange={(v) => update("format", v as ImageFormat)}>
                <SelectTrigger id="format" className="h-10 transition-all focus:ring-primary/20">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="fit" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Resizing Mode</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-3.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <b className="font-bold">Cover</b>: Fills the entire area (may crop edges).<br/>
                    <b className="font-bold">Contain</b>: Shows specific full image (adds padding).
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={value.fit} onValueChange={(v) => update("fit", v as FitMode)}>
                <SelectTrigger id="fit" className="h-10 transition-all focus:ring-primary/20">
                  <SelectValue placeholder="Fit Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Crop to Fill (Cover)</SelectItem>
                  <SelectItem value="contain">Add Padding (Contain)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSize" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Max File Size (KB)</Label>
              <Input
                id="maxSize"
                type="number"
                value={value.maxFileSizeKb || ""}
                placeholder="Unlimited"
                onChange={(e) => update("maxFileSizeKb", Number.parseInt(e.target.value) || undefined)}
                className="h-10 transition-all focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

      <div className="space-y-3 border-t border-border pt-6">
        <div className="flex items-center justify-between px-1">
          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Industry Presets</Label>
          <span className="text-[10px] font-bold text-muted-foreground/30">{PRESETS.length} available</span>
        </div>
        <Accordion type="multiple" className="w-full">
          {Array.from(new Set(PRESETS.map((p) => p.category))).map((category) => {
            const items = PRESETS.filter((p) => p.category === category)
            const hasActive = items.some((p) => p.id === selectedPresetId)
            return (
              <AccordionItem key={category} value={category} className="border-border">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-2">
                    <span className="truncate font-display text-base font-bold text-foreground">{category}</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/30">
                      {hasActive && (
                        <span className="inline-flex size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" aria-hidden="true" />
                      )}
                      {items.length} options
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4">
                  <ul className="flex flex-col gap-1.5">
                    {items.map((p) => {
                      const active = p.id === selectedPresetId
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => applyPreset(p.id)}
                            className={cn(
                              "group flex w-full flex-col gap-1.5 rounded-md border border-border bg-card/60 p-2.5 text-left transition-colors hover:border-primary/60 hover:bg-muted/50",
                              active && "border-primary bg-primary/5",
                            )}
                            aria-pressed={active}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <span className="block text-sm font-medium leading-tight text-foreground">
                                  {p.label}
                                </span>
                                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                                  {p.description}
                                </span>
                              </div>
                              {active && (
                                <span className="mt-0.5 inline-flex shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <Spec>
                                {p.requirements.width}×{p.requirements.height}px
                              </Spec>
                              <Spec>{p.requirements.dpi} DPI</Spec>
                              <Spec>{p.requirements.format.toUpperCase()}</Spec>
                              {p.requirements.fit !== "cover" && <Spec>{p.requirements.fit}</Spec>}
                              {p.requirements.maxFileSizeKb && <Spec>≤{p.requirements.maxFileSizeKb}KB</Spec>}
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  </TooltipProvider>
)
}

function Spec({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-border/70 bg-background/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  )
}
