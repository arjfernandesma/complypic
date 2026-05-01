import { type NextRequest, NextResponse } from 'next/server'
import archiver from 'archiver'
import { Readable } from 'stream'
import { requireUser } from '@/lib/auth-helpers'
import { getBatch, getAllImageStates, getResult } from '@/lib/batch/store'
import { refundCredits } from '@/lib/credits'

export const runtime = 'nodejs'
export const maxDuration = 60

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

  if (batch.status === 'created' || batch.status === 'processing') {
    return NextResponse.json({ error: 'Batch still processing' }, { status: 425 })
  }

  const imageStates = await getAllImageStates(batchId)
  const doneImages = imageStates.filter((s) => s.status === 'done')
  const failedImages = imageStates.filter((s) => s.status === 'failed')

  if (failedImages.length > 0) {
    await refundCredits(user.id, failedImages.length, `${batchId}:refund`)
  }

  const archive = archiver('zip', { zlib: { level: 6 } })

  const filenameCount: Record<string, number> = {}
  const getUniqueFilename = (original: string): string => {
    if (!(original in filenameCount)) {
      filenameCount[original] = 0
      return original
    }
    filenameCount[original] += 1
    const dot = original.lastIndexOf('.')
    if (dot === -1) {
      return `${original}-${filenameCount[original]}`
    }
    return `${original.slice(0, dot)}-${filenameCount[original]}${original.slice(dot)}`
  }

  for (const img of doneImages) {
    const base64 = await getResult(batchId, img.imageId)
    if (!base64) continue
    const buf = Buffer.from(base64, 'base64')
    const uniqueName = getUniqueFilename(img.filename)
    archive.append(buf, { name: uniqueName })
  }

  archive.finalize()

  const nodeReadable = archive as unknown as NodeJS.ReadableStream
  const webReadable = Readable.toWeb(nodeReadable as import('stream').Readable) as ReadableStream

  return new NextResponse(webReadable, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="complypic-${batchId}.zip"`,
    },
  })
}
