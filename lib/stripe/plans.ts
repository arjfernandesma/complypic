export type PlanId = 'free' | 'pro' | 'business' | 'founding_pro'

export interface PlanLimits {
  imageCredits: number
  batchSize: number
  aiParsePerMonth: number
  seats: number
  apiAccess: boolean
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    imageCredits: 0,
    batchSize: 0,
    aiParsePerMonth: 0,
    seats: 1,
    apiAccess: false,
  },
  pro: {
    imageCredits: 300,
    batchSize: 50,
    aiParsePerMonth: 100,
    seats: 1,
    apiAccess: false,
  },
  founding_pro: {
    imageCredits: 300,
    batchSize: 50,
    aiParsePerMonth: 100,
    seats: 1,
    apiAccess: false,
  },
  business: {
    imageCredits: 2000,
    batchSize: 500,
    aiParsePerMonth: 500,
    seats: 5,
    apiAccess: true,
  },
}

export const CREDIT_PACK_PRICES = {
  starter: { priceId: process.env.STRIPE_PRICE_PACK_STARTER ?? '', credits: 50, amount: 4.99 },
  standard: { priceId: process.env.STRIPE_PRICE_PACK_STANDARD ?? '', credits: 200, amount: 14.99 },
  pro_pack: { priceId: process.env.STRIPE_PRICE_PACK_PRO ?? '', credits: 600, amount: 39.99 },
} as const
