import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AppBackground } from '@/components/app-background'
import { ImageComplianceTool } from '@/components/image-compliance-tool'
import { PRESETS } from '@/lib/compliance-types'
import { PRESET_SEO } from '@/lib/preset-seo'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type Props = { params: Promise<{ presetId: string }> }

export function generateStaticParams() {
  return PRESETS.filter((p) => PRESET_SEO[p.id]).map((p) => ({ presetId: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { presetId } = await params
  const seo = PRESET_SEO[presetId]
  if (!seo) return {}
  return {
    title: { absolute: seo.title },
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `/tools/${presetId}`,
    },
    twitter: {
      title: seo.title,
      description: seo.description,
    },
  }
}

export default async function PresetPage({ params }: Props) {
  const { presetId } = await params
  const seo = PRESET_SEO[presetId]
  if (!seo) notFound()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ComplyPic',
    applicationCategory: 'PhotographyApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: seo.description,
  }

  return (
    <>
      <AppBackground />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <main className="relative min-h-dvh">
        <header className="border-b border-border/60 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ComplyPic Logo" className="h-9 w-auto object-contain" />
              <div>
                <p className="text-sm font-bold leading-none text-foreground">ComplyPic</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                  Free Image Tools
                </p>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              <ChevronLeft className="size-3.5" /> All Tools
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 pt-10 sm:pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {seo.h1}
            </h1>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {seo.intro}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <ImageComplianceTool initialPresetId={presetId} />
        </section>

        {seo.bodyHtml && (
          <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-bold [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: seo.bodyHtml }}
            />
            {seo.officialSource && (
              <a
                href={seo.officialSource}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" />
                {seo.officialSourceLabel ?? seo.officialSource}
              </a>
            )}
          </section>
        )}

        {seo.faqs.length > 0 && (
          <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-4">
              {seo.faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card/50 p-5">
                  <dt className="text-sm font-bold text-foreground">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <footer className="mt-auto border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <p>Processed on the edge. Images are never stored.</p>
            <p>Built with Next.js &amp; Sharp</p>
          </div>
        </footer>
      </main>
    </>
  )
}
