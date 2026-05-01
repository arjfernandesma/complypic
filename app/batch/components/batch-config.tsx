"use client"

import { useState } from "react"
import { ChevronLeft, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RequirementsInput } from "@/components/requirements-input"
import { type ComplianceRequirements, DEFAULT_REQUIREMENTS } from "@/lib/compliance-types"
import { cn } from "@/lib/utils"

interface BatchConfigProps {
  requirements: ComplianceRequirements | null
  onRequirementsChange: (req: ComplianceRequirements) => void
  removeBackground: boolean
  onRemoveBackgroundChange: (val: boolean) => void
  onNext: () => void
  onBack: () => void
}

export function BatchConfig({
  requirements,
  onRequirementsChange,
  removeBackground,
  onRemoveBackgroundChange,
  onNext,
  onBack,
}: BatchConfigProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const current = requirements ?? DEFAULT_REQUIREMENTS

  return (
    <div className="space-y-6">
      <RequirementsInput
        value={current}
        onChange={onRequirementsChange}
        selectedPresetId={selectedPresetId}
        onPresetSelect={setSelectedPresetId}
      />

      <div className="rounded-2xl border border-border bg-secondary/30 p-4">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Layers className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-foreground">
                Remove background before processing
              </p>
              <p className="text-xs text-muted-foreground">
                Slower — runs client-side via WASM neural network
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={removeBackground}
            onClick={() => onRemoveBackgroundChange(!removeBackground)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              removeBackground ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                removeBackground ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-10 border-border px-5 font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-primary"
        >
          <ChevronLeft className="mr-1.5 size-3.5" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!requirements}
          className="h-10 bg-primary px-6 font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
