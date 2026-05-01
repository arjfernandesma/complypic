import { type NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-helpers'
import { getBatch, getAllImageStates } from '@/lib/batch/store'

export const runtime = 'nodejs'

export async function GET(
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

  const results = await getAllImageStates(batchId)

  const queued = results.filter((r) => r.status === 'queued').length
  const processing = results.filter((r) => r.status === 'processing').length

  return NextResponse.json({
    batchId: batch.batchId,
    status: batch.status,
    total: batch.total,
    completed: batch.completed,
    failed: batch.failed,
    queued,
    processing,
    results,
  })
}
