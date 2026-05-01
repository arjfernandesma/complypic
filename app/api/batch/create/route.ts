import { type NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { requirePlan } from '@/lib/auth-helpers'
import { getCreditBalance, consumeCredits, InsufficientCreditsError } from '@/lib/credits'
import { PLAN_LIMITS } from '@/lib/stripe/plans'
import { createBatch } from '@/lib/batch/store'
import type { ComplianceRequirements } from '@/lib/compliance-types'
import type { BatchJob } from '@/lib/batch/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const user = await requirePlan('pro')

  let body: { imageCount?: number; requirements?: ComplianceRequirements }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { imageCount, requirements } = body

  if (!imageCount || typeof imageCount !== 'number' || imageCount < 1 || !Number.isInteger(imageCount)) {
    return NextResponse.json({ error: 'imageCount must be a positive integer' }, { status: 400 })
  }

  if (!requirements || typeof requirements !== 'object') {
    return NextResponse.json({ error: 'requirements object is required' }, { status: 400 })
  }

  const plan = (user.plan ?? 'free') as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS['free']

  if (imageCount > limits.batchMaxImages) {
    return NextResponse.json(
      { error: 'Batch size exceeds plan limit', limit: limits.batchMaxImages },
      { status: 403 },
    )
  }

  const balance = await getCreditBalance(user.id)
  if (balance < imageCount) {
    return NextResponse.json(
      { error: 'Insufficient credits', creditsRemaining: balance },
      { status: 402 },
    )
  }

  const batchId = nanoid()
  const ttlSeconds = limits.batchRetentionHours * 3600

  try {
    await consumeCredits(user.id, imageCount, batchId)
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

  const job: BatchJob = {
    batchId,
    userId: user.id,
    plan,
    status: 'created',
    total: imageCount,
    completed: 0,
    failed: 0,
    requirements,
    retentionHours: limits.batchRetentionHours,
    createdAt: new Date().toISOString(),
  }

  await createBatch(job, ttlSeconds)

  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()

  return NextResponse.json({ batchId, expiresAt, creditsReserved: imageCount })
}
