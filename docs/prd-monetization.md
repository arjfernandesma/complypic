# PRD — ComplyPic Monetization & Bulk Processing

**Status:** Approved for implementation  
**Date:** 2026-05-01  
**Scope:** Billing layer, bulk image processing, auth, rate limiting

---

## 1. Objective

Add a paid tier to ComplyPic without degrading the free single-image experience that drives organic SEO traffic. Revenue is unlocked through bulk image processing — the core paid feature — while the free tier retains full single-image utility with a rate-limited AI prompt.

---

## 2. Pricing Tiers

### Free (no auth required)
- Single-image processing: unlimited
- All 18+ presets: yes
- AI prompt parse: **1 per day per IP** (Upstash Redis, hashed IP, 86400s TTL)
- Bulk batch: no
- ZIP download: no
- Background removal: yes (WASM, client-side, free)
- Saved custom presets: no
- Processing history: no

### Pro — $12/month or $99/year
- Everything in Free
- AI prompt parse: 100/month (per user, tracked in DB)
- Bulk batch: up to **50 images per batch**
- Monthly credits: **300** (reset each billing cycle)
- ZIP batch download: yes
- Saved custom presets: yes (personal)
- Processing history: last 30 days (metadata only, no image data)
- Batch result retention: **1 hour** (Redis TTL)

### Business — $39/month or $299/year
- Everything in Pro
- Bulk batch: up to **500 images per batch**
- Monthly credits: **2,000**
- Team seats: **5**
- Saved presets: 50 (shared across team)
- Batch result retention: **24 hours**
- API access: 500 calls/month (authenticated via API key)
- Webhooks: POST to endpoint on batch completion

### Credit Packs (one-time, no subscription)
| Pack | Price | Credits |
|---|---|---|
| Starter | $4.99 | 50 |
| Standard | $14.99 | 200 |
| Pro Pack | $39.99 | 600 |

Credits never expire. 1 credit = 1 image processed via bulk. Single-image (free flow) never consumes credits.

### Founding Member Offer (first 60 days post-launch)
- $7/month or $59/year — locked forever while subscription is active
- Hard cap: 100 subscriptions
- Counter visible on `/pricing` page

---

## 3. Feature Requirements

### 3.1 Authentication

**Rule: Free users never see a login prompt.**

- Paid users authenticate via **magic link** (email only, no passwords, no OAuth)
- Auth flow: user clicks "Upgrade" → Stripe Checkout → payment success → webhook creates account → magic link email sent → user clicks link → authenticated session
- Session: JWT in HttpOnly cookie, 30-day expiry
- JWT payload: `userId`, `plan`, `creditsRemaining`, `teamId`
- Providers: **Resend** for transactional email (magic link + receipts)
- Library: **Auth.js v5 (NextAuth)** with Drizzle adapter

### 3.2 Database

**Stack: Vercel Postgres + Drizzle ORM**

Tables:
- `users` — id, email, email_verified, stripe_customer_id, created_at
- `accounts`, `verification_tokens` — Auth.js adapter requirements
- `subscriptions` — plan, status, billing_interval, current_period_end, image_credits_remaining, ai_parse_remaining, credits_reset_at
- `credit_ledger` — delta, reason, ref_id, stripe_event_id (idempotency anchor)
- `saved_presets` — owner_id, team_id, label, requirements (JSONB)
- `teams` + `team_members` — Business plan seat management
- `processing_history` — metadata only (filename, dimensions, format, compliant), 30-day retention
- `api_keys` — key_hash, prefix, last_used_at (Business plan)
- `webhook_endpoints` — url, secret, active (Business plan)

**Critical constraint:** `subscriptions` has a partial unique index on `(user_id) WHERE status IN ('active','trialing','past_due')` to prevent duplicate active subscriptions.

### 3.3 Billing

**Stack: Stripe**

Stripe products/prices to create in dashboard before deploy:
- Pro Monthly / Pro Annual
- Business Monthly / Business Annual
- Founding Pro Monthly / Founding Pro Annual
- Credit Pack Starter / Standard / Pro (one-time payments)

API routes:
- `POST /api/billing/checkout` — creates Stripe Checkout Session (subscription or one-time). Auth optional: unauthenticated users provide email, account created via webhook.
- `POST /api/billing/portal` — creates Stripe Customer Portal session. Auth required.
- `POST /api/webhooks/stripe` — webhook handler with signature verification.

Webhook events handled:
| Event | Action |
|---|---|
| `checkout.session.completed` | Create user if new, create/update subscription row |
| `invoice.payment_succeeded` | Reset `image_credits_remaining` (300 Pro / 2000 Business) + grant via ledger |
| `customer.subscription.updated` | Update plan, status, period_end |
| `customer.subscription.deleted` | Set status = canceled |

All webhook handlers are **idempotent** via `credit_ledger.stripe_event_id` unique constraint.

### 3.4 Rate Limiting

**Stack: Upstash Redis + @upstash/ratelimit**

| Gate | Free | Pro | Business |
|---|---|---|---|
| AI prompt parse | 1/day per hashed IP | 100/month per userId (DB) | 500/month per userId (DB) |
| API endpoint | — | — | 500/month per API key (Redis) |

IP hashing: SHA-256 + `AUTH_SECRET` salt. Redis key: `ai-parse:ip:{hash}`, TTL 86400s.

When limit hit, API returns `429` with body `{ error: "...", upgradeUrl: "/pricing" }`.

### 3.5 Credit System

**Consumption rule:** Credits are only consumed for bulk batch processing. The free single-image flow (`/api/process-image`) is never gated by credits.

Credit decrement: single atomic SQL operation:
```sql
UPDATE subscriptions
SET image_credits_remaining = image_credits_remaining - $n
WHERE user_id = $userId AND image_credits_remaining >= $n
RETURNING image_credits_remaining
```

Returns 0 rows → throw `InsufficientCreditsError` → 402 response.

Every debit and credit is recorded in `credit_ledger` with a reason and ref_id for auditability.

**Refunds:** Failed images in a batch refund their credits. Refund is applied exactly once on the download endpoint, gated by `ref_id = '{batchId}:refund'` uniqueness in the ledger.

### 3.6 Bulk Processing — Backend

**Architecture: fan-out over existing `/api/process-image`**

The existing Sharp pipeline in `/api/process-image` is extracted to `lib/image/process.ts` and called directly (no HTTP overhead) by the batch runner.

New routes:
- `POST /api/batch/create` — validates plan limits, reserves credits, creates batch in Redis, returns `batchId`
- `POST /api/batch/[batchId]/submit` — accepts multipart with N files + shared requirements JSON, triggers fan-out via Next.js `after()` API
- `GET /api/batch/[batchId]/status` — reads Redis, returns per-image status for polling
- `GET /api/batch/[batchId]/download` — streams ZIP via `archiver`, refunds failed image credits
- `POST /api/batch/[batchId]/retry` — re-runs failed images, charges credits

**Fan-out concurrency:** Max 5 simultaneous Sharp invocations per batch. Enforced by Upstash Redis semaphore (sorted-set sliding window, key `semaphore:process-image`, slot TTL 60s).

**Batch state storage:** Upstash Redis hash `batch:{batchId}`. TTL: 3600s (Pro) / 86400s (Business).

**Large batches (Business, 500 images):** Chunks of 50 enqueued to **QStash** (Upstash) to avoid Vercel function wall-clock limits. Each chunk triggers `/api/batch/[batchId]/process-chunk`.

**ZIP generation:** `archiver` package, streaming mode. No full in-memory buffer. Each processed image piped directly into the archive as it completes.

### 3.7 Bulk Processing — Frontend

New page: `/batch` (gated: Pro+ only, redirects free users to `/pricing`)

Steps:
1. **Upload** — multi-file drag-and-drop. Per-file cards with filename, size, detected format, remove button. HEIC detection via magic bytes → client-side conversion with `heic2any` (dynamic import). Files > 10MB show inline error and are excluded. Credit cost preview shown as files are added.
2. **Configure** — single `RequirementsInput` (existing component) applied to all files. Optional background removal toggle (runs WASM client-side before submit, does not consume credits).
3. **Review** — file count, credit cost (`n credits of your {remaining} remaining`), "Confirm & Process" CTA.
4. **Progress** — polls `/api/batch/[batchId]/status` every 2 seconds. Per-image row with status indicator. Overall progress bar with ETA (rolling average of completed images). No WebSockets required.
5. **Download** — ZIP download button (primary). Per-image download links. Failed images section with reason and "Retry Failed" button.

### 3.8 Upgrade Gates in Existing UI

Three upgrade touch-points in the current single-image tool:

1. **Second-image upload attempt** — when a free (unauthenticated) user tries to upload a new image after already having one, show `<UpgradeModal>` with bulk pitch.
2. **Post-process result card** — soft CTA: "Need to process 50 photos at once? Try Bulk →" (not a hard gate).
3. **AI parse limit hit** — when API returns 429, show `<UpgradeModal>` instead of error toast.

`UpgradeModal` is a shared shadcn Dialog component with plan summary and "See Plans" → `/pricing` CTA.

### 3.9 New Pages

**`/pricing`**
- 3 tier cards (Free / Pro / Business)
- Credit pack section
- Founding member banner with real-time counter (read from Postgres)
- Annual toggle with savings callout
- Buttons call `POST /api/billing/checkout?priceId=...`
- Trust signals: "Your images are never stored", "Cancel anytime"

**`/account`** (auth required)
- Plan name, credits remaining, next reset date
- Progress bar for credits used/remaining
- "Buy credit pack" CTA
- "Manage billing" → Stripe Customer Portal
- Processing history table (30 days, paginated)
- Saved presets CRUD
- Team seats section (Business only)

### 3.10 Edge Cases

| Scenario | Handling |
|---|---|
| HEIC file | Detect by magic bytes (bytes 4–11 = `ftyp`). Convert client-side with `heic2any` (dynamic import ~1.3MB). Excluded from batch if > 10MB after conversion. |
| File > 10MB | Inline per-file error at upload step. Not submitted. |
| Aspect ratio requires > 40% crop | Flagged as "needs review". Not auto-processed. Shown with crop preview overlay in result. |
| Partial batch failure | ZIP includes successful images only. Credits for failed images refunded on download. |
| Duplicate filenames | Renamed in ZIP: `photo.jpg`, `photo-1.jpg`, `photo-2.jpg`. |
| Webhook delivered twice | `stripe_event_id` unique in ledger. Second delivery is no-op, returns 200. |
| Founding member race (101st buyer) | Webhook checks count. If over 100, downgrades to standard Pro pricing and emails user. |
| Subscription canceled mid-cycle | Credits and bulk access remain until `current_period_end`. After that, plan = free. |
| Redis TTL elapsed (batch expired) | `/status` and `/download` return 410 Gone. UI shows "Batch expired — please resubmit." |
| CSP conflicts | Update middleware.ts: add `https://api.stripe.com` to `connect-src`, verify Resend script not inline. |

---

## 4. Technical Stack

| Concern | Tool |
|---|---|
| Auth | Auth.js v5 (NextAuth) + magic link |
| Email | Resend |
| Database | Vercel Postgres + Drizzle ORM |
| Cache / rate limiting / batch state | Upstash Redis |
| Async jobs (large batches) | Upstash QStash |
| Billing | Stripe (Checkout + Webhooks + Customer Portal) |
| ZIP generation | archiver (streaming) |
| HEIC conversion | heic2any (dynamic import) |

---

## 5. New Dependencies

```
next-auth@5
@auth/core
@auth/drizzle-adapter
drizzle-orm
drizzle-kit
@vercel/postgres
postgres
@upstash/redis
@upstash/ratelimit
@upstash/qstash
stripe
archiver
@types/archiver
resend
heic2any
nanoid
```

---

## 6. New Environment Variables

```
DATABASE_URL
POSTGRES_URL_NON_POOLING
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
UPSTASH_QSTASH_URL
UPSTASH_QSTASH_TOKEN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY
STRIPE_PRICE_BUSINESS_MONTHLY
STRIPE_PRICE_BUSINESS_YEARLY
STRIPE_PRICE_FOUNDING_MONTHLY
STRIPE_PRICE_FOUNDING_YEARLY
STRIPE_PRICE_PACK_STARTER
STRIPE_PRICE_PACK_STANDARD
STRIPE_PRICE_PACK_PRO
AUTH_SECRET
AUTH_URL
RESEND_API_KEY
EMAIL_FROM
```

---

## 7. Implementation Phases

### Phase 1 — Foundation (6–8 days) ← START HERE
- Install deps + scaffold `.env.example`
- Vercel Postgres + Drizzle schema + migrations
- Auth.js v5 magic-link setup + `/signin` + `/verify` pages
- `lib/auth-helpers.ts`: `requireUser()`, `requirePlan()`, `getOptionalUser()`
- Stripe checkout + portal routes
- Stripe webhook handler (4 events, idempotent)
- `/pricing` page
- `/account` page (skeleton: plan + credits + billing button)

### Phase 2 — Rate Limiting & Credits (2–3 days)
- Upstash Redis client + `lib/rate-limit.ts`
- Modify `/api/parse-prompt`: enforce 1/day free IP limit, 100/month Pro limit
- `lib/credits.ts`: atomic decrement + ledger insert
- Webhook renewal grants credits

### Phase 3 — Bulk Backend (5–7 days)
- Extract Sharp pipeline to `lib/image/process.ts`
- `lib/batch/store.ts` + `lib/batch/semaphore.ts`
- `POST /api/batch/create`
- `POST /api/batch/[batchId]/submit` (fan-out via `after()` + QStash for large batches)
- `GET /api/batch/[batchId]/status`
- `GET /api/batch/[batchId]/download` (streaming ZIP + credit refund)
- `POST /api/batch/[batchId]/retry`

### Phase 4 — Bulk UI (4–6 days)
- `/batch` page with plan gate
- `BulkUploader` component (multi-file, HEIC detection, per-file validation)
- `BatchConfig` (wraps existing `RequirementsInput`)
- `BatchReview` (credit cost display)
- `BatchProgress` (2s polling, per-image status)
- `BatchDownload` (ZIP + individual + retry failed)

### Phase 5 — Saved Presets + History + Teams (3–4 days)
- `/api/presets` CRUD + UI in `/account`
- `/api/history` paginated + 30-day retention cron
- `vercel.json` + `/api/cron/prune-history`
- Team invite flow + seat management UI (Business)

### Phase 6 — Existing UI Integration (2–3 days)
- `<UpgradeModal>` component
- Gate second-image upload for free users
- AI parse 429 → upgrade modal
- Post-process soft CTA → bulk
- `<SiteHeader>` with auth state + "Pricing" link
- Founding member countdown banner on `/pricing`

### Phase 7 — Business Features (4–5 days)
- API key generation + `key_hash` verification middleware for `/api/v1/*`
- `POST /api/v1/process` external endpoint
- Webhook endpoint management + signing + batch-completion dispatcher

### Phase 8 — Hardening (2–3 days)
- End-to-end tests with Stripe CLI fixtures
- CSP update in `middleware.ts`
- Observability: log batch durations, credit consumption
- Error boundary on `/batch` page
- Stripe CLI webhook forwarding documented in README

---

## 8. Acceptance Criteria

- [ ] Free user processes single image with no auth prompt
- [ ] Free user hits AI parse limit → 429 + upgrade modal shown
- [ ] Pro checkout creates user, subscription row, grants 300 credits via ledger
- [ ] Renewal webhook grants exactly 300 credits (idempotent on re-delivery)
- [ ] Pro batch of 50 images completes → ZIP downloads → 50 credits deducted
- [ ] Pro batch of 51 → 403 plan limit error at `/api/batch/create`
- [ ] 3 of 50 images fail → ZIP has 47 → 3 credits refunded in ledger
- [ ] Retry of failed images charges 3 credits
- [ ] Business 5th seat invite succeeds, 6th blocked
- [ ] Subscription canceled → access until period_end → plan drops to free
- [ ] HEIC file converted client-side before submit
- [ ] File > 10MB shows inline error, excluded from batch
- [ ] Batch Redis TTL elapsed → 410 with "resubmit" message in UI
- [ ] Founding member counter never exceeds 100
- [ ] `/api/process-image` response shape unchanged (no regressions)
- [ ] Cron prunes `processing_history` rows older than 30 days

---

## 9. Out of Scope (this PRD)

- Mobile app
- Password-based auth
- OAuth providers (Google, GitHub)
- Batch with mixed presets (one preset per batch only)
- Video processing
- White-label embed
- Custom domain for Business
