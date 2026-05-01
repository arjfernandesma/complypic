import sharp from 'sharp'

export interface ProcessImageInput {
  fileBuffer: Buffer
  mimeType: string
  width: number
  height: number
  dpi: number
  format: 'jpeg' | 'png' | 'webp'
  fit: 'cover' | 'contain' | 'fill'
  maxFileSizeKb?: number
  cropRegion?: { x: number; y: number; width: number; height: number; unit?: 'px' | 'percent' }
}

export interface ProcessImageOutput {
  dataUrl: string
  width: number
  height: number
  dpi: number
  format: string
  fileSizeKb: number
  compliant: boolean
  issues: string[]
  appliedTransformations: string[]
}

export async function processImage(input: ProcessImageInput): Promise<ProcessImageOutput> {
  const { fileBuffer, width, height, dpi, format, fit, maxFileSizeKb, cropRegion } = input

  const originalMeta = await sharp(fileBuffer).metadata()
  const applied: string[] = []
  const issues: string[] = []

  if (originalMeta.width && originalMeta.height) {
    if (originalMeta.width < width || originalMeta.height < height) {
      issues.push(
        `Source image (${originalMeta.width}×${originalMeta.height}px) is smaller than the required output. Upscaling may reduce quality.`,
      )
    }
  }

  let pipeline = sharp(fileBuffer).rotate()

  if (cropRegion) {
    const rotatedMeta = await sharp(fileBuffer).rotate().metadata()
    const srcW = rotatedMeta.width ?? originalMeta.width ?? 0
    const srcH = rotatedMeta.height ?? originalMeta.height ?? 0

    const left = Math.max(0, Math.round(cropRegion.x))
    const top = Math.max(0, Math.round(cropRegion.y))
    const cropW = Math.max(1, Math.min(Math.round(cropRegion.width), srcW - left))
    const cropH = Math.max(1, Math.min(Math.round(cropRegion.height), srcH - top))

    pipeline = pipeline.extract({ left, top, width: cropW, height: cropH })
    applied.push(`Applied custom framing (${cropW}×${cropH}px from ${srcW}×${srcH}px)`)
  }

  pipeline = pipeline.resize({
    width,
    height,
    fit,
    position: cropRegion ? undefined : 'attention',
    withoutEnlargement: false,
  })
  applied.push(`Resized to ${width}×${height}px (${fit}${cropRegion ? '' : ' + attention'})`)

  pipeline = pipeline.withMetadata({ density: dpi })
  applied.push(`Set density to ${dpi} DPI`)

  const startQuality = format === 'jpeg' ? 92 : 100
  let outputBuffer: Buffer
  let quality = startQuality
  let attempts = 0

  const encode = async (q: number): Promise<Buffer> => {
    let p = pipeline.clone()
    if (format === 'jpeg') {
      p = p.jpeg({ quality: q, mozjpeg: true })
    } else if (format === 'png') {
      p = p.png({ compressionLevel: 9 })
    } else if (format === 'webp') {
      p = p.webp({ quality: q })
    }
    return await p.toBuffer()
  }

  outputBuffer = await encode(quality)
  applied.push(`Converted to ${format.toUpperCase()}`)

  if (maxFileSizeKb && format !== 'png') {
    while (outputBuffer.byteLength / 1024 > maxFileSizeKb && quality > 40 && attempts < 6) {
      quality -= 10
      attempts += 1
      outputBuffer = await encode(quality)
    }
    if (outputBuffer.byteLength / 1024 > maxFileSizeKb) {
      issues.push(
        `Output is ${(outputBuffer.byteLength / 1024).toFixed(0)}KB, above the ${maxFileSizeKb}KB limit.`,
      )
    } else if (attempts > 0) {
      applied.push(`Reduced quality to ${quality} to fit under ${maxFileSizeKb}KB`)
    }
  }

  const outMeta = await sharp(outputBuffer).metadata()
  const actualWidth = outMeta.width ?? width
  const actualHeight = outMeta.height ?? height
  const actualDpi = Math.round(outMeta.density ?? dpi)
  const fileSizeKb = Math.round(outputBuffer.byteLength / 1024)

  const dimensionsOk = actualWidth === width && actualHeight === height
  const dpiOk = Math.abs(actualDpi - dpi) <= 1
  const formatOk = outMeta.format === format
  const sizeOk = !maxFileSizeKb || fileSizeKb <= maxFileSizeKb

  if (!dimensionsOk) issues.push(`Dimensions mismatch: ${actualWidth}×${actualHeight} (expected ${width}×${height})`)
  if (!dpiOk) issues.push(`DPI mismatch: ${actualDpi} (expected ${dpi})`)
  if (!formatOk) issues.push(`Format mismatch: ${outMeta.format} (expected ${format})`)

  const compliant = dimensionsOk && dpiOk && formatOk && sizeOk

  const mime = format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp'
  const dataUrl = `data:${mime};base64,${outputBuffer.toString('base64')}`

  return {
    dataUrl,
    width: actualWidth,
    height: actualHeight,
    dpi: actualDpi,
    format,
    fileSizeKb,
    compliant,
    issues,
    appliedTransformations: applied,
  }
}
