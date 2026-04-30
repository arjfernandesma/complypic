import type { MetadataRoute } from 'next'
import { PRESETS } from '@/lib/compliance-types'
import { PRESET_SEO } from '@/lib/preset-seo'

const BASE = 'https://complypic.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const presetUrls = PRESETS.filter((p) => PRESET_SEO[p.id]).map((p) => ({
    url: `${BASE}/tools/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE}/tools/background-removal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...presetUrls,
  ]
}
