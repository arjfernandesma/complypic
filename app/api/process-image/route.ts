import { type NextRequest, NextResponse } from "next/server"
import type { ImageFormat, FitMode } from "@/lib/compliance-types"
import { processImage } from "@/lib/image/process"
import { processImageLimit, getRealIp, hashIp } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const ip = getRealIp(req)
  const { success } = await processImageLimit.limit(hashIp(ip))
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const width = Number.parseInt(formData.get("width") as string, 10)
    const height = Number.parseInt(formData.get("height") as string, 10)
    const dpi = Number.parseInt(formData.get("dpi") as string, 10)
    const format = formData.get("format") as ImageFormat
    const fit = (formData.get("fit") as FitMode) || "cover"
    const maxFileSizeKbRaw = formData.get("maxFileSizeKb") as string | null
    const maxFileSizeKb = maxFileSizeKbRaw ? Number.parseInt(maxFileSizeKbRaw, 10) : undefined
    const cropRegionRaw = formData.get("cropRegion") as string | null
    const cropRegion = cropRegionRaw
      ? (JSON.parse(cropRegionRaw) as { x: number; y: number; width: number; height: number })
      : null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!width || !height || !dpi || !format) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    if (width < 32 || height < 32 || width > 8000 || height > 8000) {
      return NextResponse.json({ error: "Dimensions must be between 32 and 8000 px" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const result = await processImage({
      fileBuffer,
      mimeType: file.type,
      width,
      height,
      dpi,
      format,
      fit,
      maxFileSizeKb,
      cropRegion: cropRegion ?? undefined,
    })

    return NextResponse.json({
      dataUrl: result.dataUrl,
      width: result.width,
      height: result.height,
      dpi: result.dpi,
      format: result.format,
      fileSizeKb: result.fileSizeKb,
      compliant: result.compliant,
      issues: result.issues,
      appliedTransformations: result.appliedTransformations,
    })
  } catch (err) {
    console.error("[v0] process-image error:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: `Processing failed: ${message}` }, { status: 500 })
  }
}
