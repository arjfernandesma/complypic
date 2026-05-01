'use client'

import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import { estimateReadingTime } from '@/lib/blog/markdown'
import { slugify } from '@/lib/blog/slug'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  tag: string | null
  published: boolean
  publishedAt: Date | null
  authorId: string | null
  createdAt: Date
  updatedAt: Date
}

interface Props {
  mode: 'create' | 'edit'
  post?: BlogPost
  action: (formData: FormData) => Promise<void>
}

export function PostEditor({ mode, post, action }: Props) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [content, setContent] = useState(post?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? '')
  const [published, setPublished] = useState(post?.published ?? false)
  const [preview, setPreview] = useState('')
  const [readingTime, setReadingTime] = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const raw = marked.parse(content, { async: false }) as string
      let sanitized = raw
      if (typeof window !== 'undefined') {
        try {
          const DOMPurify = require('isomorphic-dompurify')
          sanitized = DOMPurify.sanitize(raw)
        } catch {
          sanitized = raw
        }
      }
      setPreview(sanitized)
      setReadingTime(estimateReadingTime(content))
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [content])

  function handleTitleBlur() {
    if (!slugTouched && title) {
      setSlug(slugify(title))
    }
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="published" value={published ? 'true' : 'false'} />

      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Post title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugTouched(true)
                }}
                placeholder="auto-generated-from-title"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                name="tag"
                defaultValue={post?.tag ?? ''}
                placeholder="e.g. Tips, Tutorial"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coverImageUrl">Cover Image URL</Label>
              <Input
                id="coverImageUrl"
                name="coverImageUrl"
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {coverImageUrl && (
            <div className="overflow-hidden rounded-lg border border-border/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt="Cover preview"
                className="max-h-48 w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt ?? ''}
              placeholder="Short description shown in post cards..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content in Markdown..."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>
        </div>

        <div className="hidden w-[380px] shrink-0 lg:block">
          <div className="sticky top-20 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Preview
              </p>
              <p className="text-xs text-muted-foreground">{readingTime} min read</p>
            </div>
            <div
              className={cn(
                'min-h-[400px] overflow-auto rounded-lg border border-border/60 bg-card/40 p-5 text-sm',
                'prose-content',
              )}
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3">
        <Switch
          id="published-switch"
          checked={published}
          onCheckedChange={setPublished}
        />
        <Label htmlFor="published-switch" className="cursor-pointer">
          {published ? 'Published' : 'Draft'}
        </Label>
        <div className="flex-1" />
        <Button type="submit" size="sm">
          {mode === 'create' ? 'Create Post' : 'Save Changes'}
        </Button>
      </div>

      <style>{`
        .prose-content h1 { font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .prose-content h2 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
        .prose-content h3 { font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .prose-content h4 { font-size: 1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .prose-content p { margin-bottom: 1rem; line-height: 1.7; }
        .prose-content a { color: var(--color-primary, #3b82f6); text-decoration: underline; }
        .prose-content ul { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
        .prose-content ol { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: decimal; }
        .prose-content li { margin-bottom: 0.25rem; }
        .prose-content code { background: var(--color-muted, #f1f5f9); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875rem; }
        .prose-content pre { background: var(--color-muted, #f1f5f9); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
        .prose-content pre code { background: transparent; padding: 0; }
        .prose-content blockquote { border-left: 4px solid var(--color-border, #e2e8f0); padding-left: 1rem; font-style: italic; color: var(--color-muted-foreground, #64748b); margin-bottom: 1rem; }
        .prose-content img { max-width: 100%; border-radius: 0.5rem; margin-bottom: 1rem; }
        .prose-content hr { border-color: var(--color-border, #e2e8f0); margin: 1.5rem 0; }
      `}</style>
    </form>
  )
}
