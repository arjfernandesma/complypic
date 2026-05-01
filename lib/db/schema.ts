import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  bigserial,
  jsonb,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified'),
  name: text('name'),
  image: text('image'),
  passwordHash: text('password_hash'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  }),
)

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  }),
)

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    plan: text('plan').notNull(),
    status: text('status').notNull(),
    billingInterval: text('billing_interval'),
    currentPeriodEnd: timestamp('current_period_end'),
    imageCreditsRemaining: integer('image_credits_remaining').notNull().default(0),
    creditsResetAt: timestamp('credits_reset_at'),
    aiParseRemaining: integer('ai_parse_remaining').notNull().default(0),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
)

export const subscriptionsUserActiveIdx = uniqueIndex('subscriptions_user_active_idx')
  .on(sql`user_id`)
  .where(sql`status IN ('active','trialing','past_due')`)

export const creditLedger = pgTable('credit_ledger', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  delta: integer('delta').notNull(),
  reason: text('reason').notNull(),
  refId: text('ref_id'),
  stripeEventId: text('stripe_event_id').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const savedPresets = pgTable('saved_presets', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: text('team_id'),
  label: text('label').notNull(),
  requirements: jsonb('requirements').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const processingHistory = pgTable('processing_history', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  batchId: text('batch_id'),
  filename: text('filename'),
  width: integer('width'),
  height: integer('height'),
  format: text('format'),
  fileSizeKb: integer('file_size_kb'),
  compliant: boolean('compliant'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const blogPosts = pgTable('blog_posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull().default(''),
  coverImageUrl: text('cover_image_url'),
  tag: text('tag'),
  published: boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
