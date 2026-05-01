import type { ComplianceRequirements } from '@/lib/compliance-types'
import { processImage } from '@/lib/image/process'
import { acquireSlot, releaseSlot } from './semaphore'
import {
  setImageState,
  getBatch,
  updateBatch,
  storeResult,
  getAllImageStates,
} from './store'

export async function processBatchImage(
  batchId: string,
  imageId: string,
  filename: string,
  fileBuffer: Buffer,
  mimeType: string,
  requirements: ComplianceRequirements,
  ttlSeconds: number,
): Promise<void> {
  await setImageState(
    batchId,
    { imageId, filename, status: 'processing' },
    ttlSeconds,
  )

  const acquired = await acquireSlot(batchId, imageId)
  if (!acquired) {
    await setImageState(
      batchId,
      { imageId, filename, status: 'failed', error: 'Timed out waiting for processing slot' },
      ttlSeconds,
    )
    await incrementBatchFailed(batchId)
    return
  }

  try {
    const result = await processImage({
      fileBuffer,
      mimeType,
      width: requirements.width,
      height: requirements.height,
      dpi: requirements.dpi,
      format: requirements.format,
      fit: requirements.fit,
      maxFileSizeKb: requirements.maxFileSizeKb,
      cropRegion: requirements.cropRegion,
    })

    const base64 = result.dataUrl.split(',')[1]
    await storeResult(batchId, imageId, base64, ttlSeconds)

    await setImageState(
      batchId,
      {
        imageId,
        filename,
        status: 'done',
        width: result.width,
        height: result.height,
        fileSizeKb: result.fileSizeKb,
        format: result.format,
        compliant: result.compliant,
        resultKey: `batch:${batchId}:result:${imageId}`,
      },
      ttlSeconds,
    )

    await releaseSlot(batchId, imageId)
    await incrementBatchCompleted(batchId)
  } catch (err) {
    await releaseSlot(batchId, imageId)
    const message = err instanceof Error ? err.message : 'Unknown error'
    await setImageState(
      batchId,
      { imageId, filename, status: 'failed', error: message },
      ttlSeconds,
    )
    await incrementBatchFailed(batchId)
  }
}

async function incrementBatchCompleted(batchId: string): Promise<void> {
  const batch = await getBatch(batchId)
  if (!batch) return

  const completed = batch.completed + 1
  const total = batch.total

  if (completed + batch.failed >= total) {
    const allStates = await getAllImageStates(batchId)
    const failedCount = allStates.filter((s) => s.status === 'failed').length
    const finalStatus = failedCount === 0 ? 'completed' : failedCount === total ? 'failed' : 'partial'
    await updateBatch(batchId, {
      completed,
      status: finalStatus,
      completedAt: new Date().toISOString(),
    })
  } else {
    await updateBatch(batchId, { completed })
  }
}

async function incrementBatchFailed(batchId: string): Promise<void> {
  const batch = await getBatch(batchId)
  if (!batch) return

  const failed = batch.failed + 1
  const total = batch.total

  if (batch.completed + failed >= total) {
    const allStates = await getAllImageStates(batchId)
    const failedCount = allStates.filter((s) => s.status === 'failed').length
    const finalStatus =
      failedCount === 0 ? 'completed' : failedCount === total ? 'failed' : 'partial'
    await updateBatch(batchId, {
      failed,
      status: finalStatus,
      completedAt: new Date().toISOString(),
    })
  } else {
    await updateBatch(batchId, { failed })
  }
}
