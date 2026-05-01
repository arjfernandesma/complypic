import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { getOptionalUser } from "@/lib/auth-helpers"
import { getActiveSubscription } from "@/lib/db/queries"
import { aiParseFreeLimit, decrementAiParse, getRealIp, hashIp } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 30

const schema = z.object({
  width: z.number().int().min(32).max(8000).describe("Output width in pixels"),
  height: z.number().int().min(32).max(8000).describe("Output height in pixels"),
  dpi: z.number().int().min(72).max(1200).describe("Dots per inch"),
  format: z.enum(["jpeg", "png", "webp"]).describe("Output file format"),
  fit: z.enum(["cover", "contain", "fill"]).describe("How to fit the image into the target dimensions"),
  maxFileSizeKb: z.number().int().positive().optional().describe("Maximum file size in kilobytes, if specified"),
})

const PAID_PLANS = new Set(['pro', 'founding_pro', 'business'])

export async function POST(req: NextRequest) {
  try {
    const user = await getOptionalUser()

    if (user?.id) {
      const sub = await getActiveSubscription(user.id)
      const plan = sub?.plan ?? 'free'

      if (PAID_PLANS.has(plan)) {
        const allowed = await decrementAiParse(user.id)
        if (!allowed) {
          return NextResponse.json(
            { error: 'AI parse quota exhausted for this billing period', upgradeUrl: '/pricing' },
            { status: 429 },
          )
        }
      } else {
        const ip = getRealIp(req)
        const key = hashIp(ip)
        const { success } = await aiParseFreeLimit.limit(key)
        if (!success) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Upgrade to Pro for more AI parses.', upgradeUrl: '/pricing' },
            { status: 429 },
          )
        }
      }
    } else {
      const ip = getRealIp(req)
      const key = hashIp(ip)
      const { success } = await aiParseFreeLimit.limit(key)
      if (!success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Sign in and upgrade to Pro for more AI parses.', upgradeUrl: '/pricing' },
          { status: 429 },
        )
      }
    }

    const { prompt } = (await req.json()) as { prompt?: string }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: "openai/gpt-5-mini",
      schema,
      system: [
        "You extract image compliance requirements from a user's natural-language description.",
        "Convert all measurements to pixels if given in mm or inches using the specified DPI (1 inch = 25.4 mm).",
        "If the user does not specify DPI, default to 300 for print/passport photos and 72 for web/profile images.",
        "If the user does not specify format, default to jpeg for photos and png for logos/graphics.",
        "If the user does not specify fit, default to 'cover' (smart crop).",
        "Only include maxFileSizeKb if the user explicitly mentions a size limit.",
      ].join(" "),
      prompt,
    })

    return NextResponse.json(object)
  } catch (err) {
    console.error("[v0] parse-prompt error:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: `Failed to parse prompt: ${message}` }, { status: 500 })
  }
}
