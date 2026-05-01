import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, listPublishedPosts } from '@/lib/blog/queries'
import { renderMarkdown, estimateReadingTime } from '@/lib/blog/markdown'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ChevronLeft } from 'lucide-react'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const posts = await listPublishedPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: { absolute: `${post.title} | ComplyPic Blog` },
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `https://complypic.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const htmlContent = renderMarkdown(post.content)
  const readingTime = estimateReadingTime(post.content)
  const date = post.publishedAt ?? post.createdAt

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Organization', name: 'ComplyPic' },
    publisher: {
      '@type': 'Organization',
      name: 'ComplyPic',
      url: 'https://complypic.com',
    },
    ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="space-y-8">
        <div className="space-y-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
            All Posts
          </Link>

          {post.tag && (
            <Badge variant="outline" className="text-xs">
              {post.tag}
            </Badge>
          )}

          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={new Date(date).toISOString()}>
              {format(new Date(date), 'MMMM d, yyyy')}
            </time>
            <span>&middot;</span>
            <span>{readingTime} min read</span>
          </div>
        </div>

        {post.coverImageUrl && (
          <div className="overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div
          className="blog-prose text-base text-foreground/90"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className="border-t border-border/60 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to Blog
          </Link>
        </div>
      </article>

      <style>{`
        .blog-prose h1 { font-size: 1.75rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.3; }
        .blog-prose h2 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; line-height: 1.3; }
        .blog-prose h3 { font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .blog-prose h4 { font-size: 1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .blog-prose p { margin-bottom: 1rem; line-height: 1.75; }
        .blog-prose a { color: var(--color-primary, #3b82f6); text-decoration: underline; text-underline-offset: 3px; }
        .blog-prose a:hover { opacity: 0.8; }
        .blog-prose ul { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
        .blog-prose ol { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: decimal; }
        .blog-prose li { margin-bottom: 0.375rem; line-height: 1.6; }
        .blog-prose code { background-color: var(--color-muted, #f1f5f9); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; font-family: ui-monospace, monospace; }
        .blog-prose pre { background-color: var(--color-muted, #f1f5f9); padding: 1rem 1.25rem; border-radius: 0.625rem; overflow-x: auto; margin-bottom: 1.25rem; }
        .blog-prose pre code { background: transparent; padding: 0; font-size: 0.875rem; }
        .blog-prose blockquote { border-left: 4px solid oklch(0.6 0.1 250 / 0.3); padding-left: 1rem; font-style: italic; color: var(--color-muted-foreground, #64748b); margin-bottom: 1rem; }
        .blog-prose img { max-width: 100%; border-radius: 0.625rem; margin-bottom: 1rem; }
        .blog-prose hr { border: none; border-top: 1px solid var(--color-border, #e2e8f0); margin: 2rem 0; }
        .blog-prose table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.875rem; }
        .blog-prose th { background-color: var(--color-muted, #f1f5f9); padding: 0.5rem 0.75rem; text-align: left; font-weight: 600; border: 1px solid var(--color-border, #e2e8f0); }
        .blog-prose td { padding: 0.5rem 0.75rem; border: 1px solid var(--color-border, #e2e8f0); }
        .blog-prose strong { font-weight: 700; }
        .blog-prose em { font-style: italic; }
      `}</style>
    </>
  )
}
