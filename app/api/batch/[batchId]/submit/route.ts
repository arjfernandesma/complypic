import { type NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { nanoid } from 'nanoid'
import { requireUser } from '@/lib/auth-helpers'
import { getBatch, updateBatch, setImageState, storeFile } from '@/lib/batch/store'
import { processBatchImage } from '@/lib/batch/runner'
import type { ComplianceRequirements } from '@/lib/compliance-types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const user = await requireUser()
  const { batchId } = await params

  const batch = await getBatch(batchId)
  if (!batch) {
    return NextResponse.json({ error: 'Batch expired', resubmit: true }, { status: 410 })
  }

  if (batch.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (batch.status !== 'created') {
    return NextResponse.json(
      { error: 'Batch already submitted', status: batch.status },
      { status: 409 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Failed to parse multipart form data' }, { status: 400 })
  }

  const fileEntries = formData.getAll('files') as File[]
  if (fileEntries.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  if (fileEntries.length !== batch.total) {
    return NextResponse.json(
      {
        error: `File count mismatch: expected ${batch.total}, received ${fileEntries.length}`,
      },
      { status: 400 },
    )
  }

  const requirementsOverrideRaw = formData.get('requirements') as string | null
  const requirements: ComplianceRequirements = requirementsOverrideRaw
    ? JSON.parse(requirementsOverrideRaw)
    : batch.requirements

  const ttlSeconds = batch.retentionHours * 3600

  const images = await Promise.all(
    fileEntries.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer()
      return {
        imageId: nanoid(),
        filename: file.name,
        buffer: Buffer.from(arrayBuffer),
        mimeType: file.type || 'application/octet-stream',
      }
    }),
  )

  await Promise.all(
    images.flatMap((img) => [
      setImageState(
        batchId,
        { imageId: img.imageId, filename: img.filename, status: 'queued' },
        ttlSeconds,
      ),
      storeFile(batchId, img.imageId, img.buffer.toString('base64'), img.mimeType, ttlSeconds),
    ]),
  )

  await updateBatch(batchId, { status: 'processing', requirements })

  after(async () => {
    await Promise.all(
      images.map((img) =>
        processBatchImage(
          batchId,
          img.imageId,
          img.filename,
          img.buffer,
          img.mimeType,
          requirements,
          ttlSeconds,
        ),
      ),
    )
  })

  return NextResponse.json({ accepted: fileEntries.length })
}
