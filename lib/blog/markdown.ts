import { marked } from 'marked'

export function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string
  if (typeof window !== 'undefined') {
    const DOMPurify = require('isomorphic-dompurify')
    return DOMPurify.sanitize(raw)
  }
  return raw
}

export function estimateReadingTime(md: string): number {
  const words = md.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
