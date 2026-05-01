# ComplyPic — SaaS Product Document

## Overview

ComplyPic is a free, browser-based image compliance tool that transforms images to meet strict technical specifications required by passports, official documents, professional platforms, and e-commerce marketplaces.

**Domain:** complypic.com  
**Stack:** Next.js 16 (App Router) · Vercel Serverless · Sharp · OpenAI · WASM  
**Pricing:** Free (no login required)

---

## Problem

Users regularly get photos rejected by passport agencies, job portals, and LinkedIn because of wrong pixel dimensions, DPI, format, or file size. The correction process is manual, confusing, and error-prone without the right tools.

---

## Solution

A multi-step wizard that accepts any image and outputs a fully compliant file in seconds:

1. **Upload** — drag-drop or click (20MB limit; JPEG, PNG, WebP, HEIC)
2. **Configure** — pick a preset, fill a manual form, or describe requirements in plain language
3. **Fine-tune** — interactive crop editor + optional background removal
4. **Download** — compliant file with a detailed compliance report

---

## Features

### Image Processing Pipeline (server-side, Sharp)
- EXIF auto-rotation
- Attention-based smart resize (auto-detects face/subject)
- Exact DPI embedding
- Format conversion (JPEG / PNG / WebP)
- Iterative quality reduction to meet file-size caps
- Compliance validation with issue list and transformation log

### Preset Library (18 presets)
| Category | Presets |
|---|---|
| Official Documents | US Passport, EU/Schengen Passport, Ireland Employment Permit |
| Careers | CV headshot, Job portal, LinkedIn profile, LinkedIn banner, LinkedIn company banner |
| YouTube | Thumbnail, Banner, Profile picture |
| Instagram | Square post, Portrait post, Story/Reel |
| E-commerce | Amazon main product, Amazon secondary |

### AI Prompt Parsing
- Natural language → structured requirements via OpenAI (gpt-4.5-mini)
- Automatic unit conversion (mm/inches → pixels) and sensible defaults
- Powered by Vercel AI SDK with Zod validation

### Background Removal
- Standalone `/tools/background-removal` page
- WASM neural network via @imgly/background-removal — fully client-side
- Zero server upload; images never leave the browser

### SEO & Content
- Dedicated landing page per preset (`/tools/[presetId]`)
- FAQPage + SoftwareApplication structured data (JSON-LD)
- XML sitemap and robots.txt
- Official source citations (US State Dept, ICAO, DETE, etc.)

---

## Architecture

```
Browser
  ├── image-compliance-tool.tsx  (4-step wizard)
  ├── background-remover.tsx     (WASM, client-side)
  └── crop-editor.tsx            (react-easy-crop)

Vercel Edge / Serverless
  ├── /api/process-image         (Sharp pipeline)
  └── /api/parse-prompt          (OpenAI structured output)

middleware.ts
  ├── 10 MB payload cap
  └── Security headers (CSP, HSTS, X-Frame-Options…)
```

**Key decisions:**
- No file storage — images flow as base64 dataURLs only
- Background removal runs client-side (privacy + cost)
- Final processing runs server-side (reliability + security)
- TypeScript errors suppressed in build (`ignoreBuildErrors: true`)

---

## Data Types

```typescript
ComplianceRequirements {
  width, height: number       // pixels
  dpi: number                 // 72 (web) – 600 (print)
  format: "jpeg" | "png" | "webp"
  fit: "cover" | "contain" | "fill"
  maxFileSizeKb?: number
  cropRegion?: CropRegion
}

ProcessingResult {
  dataUrl: string             // base64 image
  width, height, dpi, format, fileSizeKb: number
  compliant: boolean
  issues: string[]
  appliedTransformations: string[]
}
```

---

## Security

| Control | Implementation |
|---|---|
| CSP | Strict; allows `wasm-unsafe-eval`, Vercel scripts only |
| HSTS | 1-year max-age, includeSubDomains, preload |
| Framing | `X-Frame-Options: DENY` |
| Payload | 10 MB hard cap (middleware) |
| Privacy | No server-side image persistence |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Required for `/api/parse-prompt` (AI spec extraction) |

---

## Deployment

- **Host:** Vercel (serverless, Node.js runtime)
- **Serverless timeout:** 30 seconds
- **CDN rewrite:** `/bg-assets/*` → staticimgly.com (CORS proxy for WASM assets)
- **Analytics:** @vercel/analytics (production only)
- **Build command:** `pnpm build`
- **No vercel.json** — relies on Next.js/Vercel implicit integration

---

## Monetization (not yet implemented)

Current state: fully free, no auth, no payment gate.

Potential paths:
1. B2B API licensing (image processing / background removal)
2. Batch processing for agencies and e-commerce sellers
3. White-label SaaS for HR platforms, photo studios
4. Freemium: free for web presets, paid for high-DPI print output

---

## Competitive Positioning

**Strengths:** free, no login, privacy-first (client-side WASM), AI natural language input, 18 official presets, SEO landing pages  
**Gaps:** no batch processing, no saved history, no mobile app, no monetization

---

## Commands

```bash
pnpm dev        # development server
pnpm build      # production build
pnpm start      # production server
pnpm lint       # ESLint
```
