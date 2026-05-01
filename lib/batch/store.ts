import { redis } from '@/lib/redis'
import type { BatchJob, BatchImageState } from './types'

const batchKey = (batchId: string) => `batch:${batchId}`
const imgKey = (batchId: string, imageId: string) => `batch:${batchId}:img:${imageId}`
const resultKey = (batchId: string, imageId: string) => `batch:${batchId}:result:${imageId}`
const fileKey = (batchId: string, imageId: string) => `batch:${batchId}:file:${imageId}`
const imagesListKey = (batchId: string) => `batch:${batchId}:images`

export async function createBatch(job: BatchJob, ttlSeconds: number): Promise<void> {
  const imageIds: string[] = []
  await redis.set(batchKey(job.batchId), JSON.stringify(job), { ex: ttlSeconds })
  await redis.set(imagesListKey(job.batchId), JSON.stringify(imageIds), { ex: ttlSeconds })
}

export async function getBatch(batchId: string): Promise<BatchJob | null> {
  const raw = await redis.get<string>(batchKey(batchId))
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : (raw as BatchJob)
}

export async function updateBatch(batchId: string, patch: Partial<BatchJob>): Promise<void> {
  const existing = await getBatch(batchId)
  if (!existing) return
  const updated = { ...existing, ...patch }
  const ttlSeconds = existing.retentionHours * 3600
  await redis.set(batchKey(batchId), JSON.stringify(updated), { ex: ttlSeconds })
}

export async function setImageState(
  batchId: string,
  img: BatchImageState,
  ttlSeconds: number,
): Promise<void> {
  await redis.set(imgKey(batchId, img.imageId), JSON.stringify(img), { ex: ttlSeconds })

  const listRaw = await redis.get<string>(imagesListKey(batchId))
  const list: string[] = listRaw
    ? typeof listRaw === 'string'
      ? JSON.parse(listRaw)
      : (listRaw as string[])
    : []
  if (!list.includes(img.imageId)) {
    list.push(img.imageId)
    await redis.set(imagesListKey(batchId), JSON.stringify(list), { ex: ttlSeconds })
  }
}

export async function getImageState(
  batchId: string,
  imageId: string,
): Promise<BatchImageState | null> {
  const raw = await redis.get<string>(imgKey(batchId, imageId))
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : (raw as BatchImageState)
}

export async function getAllImageStates(batchId: string): Promise<BatchImageState[]> {
  const listRaw = await redis.get<string>(imagesListKey(batchId))
  if (!listRaw) return []

  const imageIds: string[] =
    typeof listRaw === 'string' ? JSON.parse(listRaw) : (listRaw as string[])

  if (imageIds.length === 0) return []

  const keys = imageIds.map((id) => imgKey(batchId, id))
  const raws = await redis.mget<string[]>(...keys)

  return raws
    .filter((r): r is string => r !== null && r !== undefined)
    .map((r) => (typeof r === 'string' ? JSON.parse(r) : (r as BatchImageState)))
}

export async function storeResult(
  batchId: string,
  imageId: string,
  base64: string,
  ttlSeconds: number,
): Promise<void> {
  await redis.set(resultKey(batchId, imageId), base64, { ex: ttlSeconds })
}

export async function getResult(batchId: string, imageId: string): Promise<string | null> {
  const raw = await redis.get<string>(resultKey(batchId, imageId))
  if (!raw) return null
  return typeof raw === 'string' ? raw : String(raw)
}

export async function storeFile(
  batchId: string,
  imageId: string,
  base64: string,
  mimeType: string,
  ttlSeconds: number,
): Promise<void> {
  await redis.set(fileKey(batchId, imageId), JSON.stringify({ base64, mimeType }), { ex: ttlSeconds })
}

export async function getFile(
  batchId: string,
  imageId: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const raw = await redis.get<string>(fileKey(batchId, imageId))
  if (!raw) return null
  const parsed: { base64: string; mimeType: string } =
    typeof raw === 'string' ? JSON.parse(raw) : (raw as { base64: string; mimeType: string })
  return {
    buffer: Buffer.from(parsed.base64, 'base64'),
    mimeType: parsed.mimeType,
  }
}
