import { type NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { requireUser } from '@/lib/auth-helpers'
import { getBatch, getAllImageStates, setImageState, updateBatch, getFile } from '@/lib/batch/store'
import { consumeCredits, InsufficientCreditsError, getCreditBalance } from '@/lib/credits'
import { processBatchImage } from '@/lib/batch/runner'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(
  _req: NextRequest,
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

  const allStates = await getAllImageStates(batchId)
  const failedImages = allStates.filter((s) => s.status === 'failed')

  if (failedImages.length === 0) {
    return NextResponse.json({ retried: 0 })
  }

  const retryRef = `${batchId}:retry-${Date.now()}`
  try {
    await consumeCredits(user.id, failedImages.length, retryRef)
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      const remaining = await getCreditBalance(user.id)
      return NextResponse.json(
        { error: 'Insufficient credits', creditsRemaining: remaining },
        { status: 402 },
      )
    }
    throw err
  }

  const ttlSeconds = batch.retentionHours * 3600

  const imagesWithFiles = await Promise.all(
    failedImages.map(async (img) => {
      const file = await getFile(batchId, img.imageId)
      return { img, file }
    }),
  )

  await Promise.all(
    failedImages.map((img) =>
      setImageState(batchId, { ...img, status: 'queued', error: undefined }, ttlSeconds),
    ),
  )

  await updateBatch(batchId, {
    status: 'processing',
    failed: batch.failed - failedImages.length,
    completedAt: undefined,
  })

  after(async () => {
    await Promise.all(
      imagesWithFiles.map(({ img, file }) =>
        processBatchImage(
          batchId,
          img.imageId,
          img.filename,
          file?.buffer ?? Buffer.alloc(0),
          file?.mimeType ?? 'application/octet-stream',
          batch.requirements,
          ttlSeconds,
        ),
      ),
    )
  })

  return NextResponse.json({ retried: failedImages.length })
}
