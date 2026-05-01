import type { MetadataRoute } from 'next'
import { PRESETS } from '@/lib/compliance-types'
import { PRESET_SEO } from '@/lib/preset-seo'
import { listPublishedPosts } from '@/lib/blog/queries'

const BASE = 'https://complypic.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const presetUrls = PRESETS.filter((p) => PRESET_SEO[p.id]).map((p) => ({
    url: `${BASE}/tools/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  let blogPostUrls: MetadataRoute.Sitemap = []
  try {
    const posts = await listPublishedPosts()
    blogPostUrls = posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? p.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB may not be available at build time
  }

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/tools/background-removal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...presetUrls,
    ...blogPostUrls,
  ]
}
