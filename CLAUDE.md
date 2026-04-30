# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Architecture

ComplyPic is a **Next.js 16 App Router** application that transforms images to meet specific compliance requirements (passport photos, social media, e-commerce, etc.).

### Core workflow

The main tool is a multi-step wizard in `components/image-compliance-tool.tsx`:
1. Upload image
2. Configure requirements (manual form, preset selector, or AI prompt)
3. Download processed result

### API routes

**`/api/process-image`** — Heavy lifting via Sharp (server-side):
- Accepts FormData: `file`, `width`, `height`, `dpi`, `format`, `fit`, `maxFileSizeKb`, `cropRegion`
- Pipeline: EXIF auto-rotate → optional crop → smart resize (attention-based) → DPI metadata → format conversion → size reduction loop
- Returns JSON: `dataUrl`, dimensions, compliance status, `issues[]`, `appliedTransformations[]`

**`/api/parse-prompt`** — AI spec extraction via Vercel AI SDK + OpenAI:
- Takes a natural language string, returns structured `ComplianceRequirements` via Zod schema
- Converts units (mm/inches → pixels) and applies sensible defaults (300 DPI for print, JPEG for photos)

### Data types

All shared types and presets live in `lib/compliance-types.ts`:
- `ComplianceRequirements`: `{ width, height, dpi, format, fit, maxFileSizeKb, cropRegion }`
- `ProcessingResult`: `{ dataUrl, compliant, issues[], appliedTransformations[] }`
- `FitMode`: `"cover" | "contain" | "fill"`
- `ImageFormat`: `"jpeg" | "png" | "webp"`
- 18+ presets (US/EU passports, LinkedIn, Instagram, Amazon, etc.)

### Key architectural decisions

- **Client vs server**: UI interactions and background removal run client-side (WASM via `@imgly/background-removal`). Final image processing always hits the server (Sharp).
- **No file storage**: Images flow through as base64 `dataUrl` — nothing is persisted server-side.
- **Middleware** (`middleware.ts`): Enforces 10MB payload cap on `/api/process-image` and sets security headers (CSP, HSTS, Permissions-Policy) on all routes.

### Styling

- Tailwind CSS 4 with PostCSS
- OKLch color system (custom professional blue/gray palette defined in `app/globals.css`)
- Fonts: Plus Jakarta Sans (headings), Inter (body)
- shadcn/ui components in `components/ui/` — use `cn()` from `lib/utils.ts` for class merging

### Environment

- **OpenAI API key** must be set for `/api/parse-prompt` to work (injected via Vercel env vars in production)
- `next.config.mjs` has `typescript.ignoreBuildErrors: true` — TypeScript errors won't fail builds
- Deployed on Vercel; uses `@vercel/analytics` for page analytics
