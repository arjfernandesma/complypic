import type { ComplianceRequirements } from '@/lib/compliance-types'

export type BatchImageStatus = 'queued' | 'processing' | 'done' | 'failed'
export type BatchStatus = 'created' | 'processing' | 'completed' | 'partial' | 'failed'

export interface BatchImageState {
  imageId: string
  filename: string
  status: BatchImageStatus
  width?: number
  height?: number
  fileSizeKb?: number
  format?: string
  compliant?: boolean
  error?: string
  resultKey?: string
}

export interface BatchJob {
  batchId: string
  userId: string
  plan: string
  status: BatchStatus
  total: number
  completed: number
  failed: number
  requirements: ComplianceRequirements
  retentionHours: number
  createdAt: string
  completedAt?: string
}
