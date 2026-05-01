import { listPublishedPosts } from '@/lib/blog/queries'

export const revalidate = 3600

const BASE = 'https://complypic.com'

export async function GET() {
  let posts: Awaited<ReturnType<typeof listPublishedPosts>> = []
  try {
    posts = await listPublishedPosts()
  } catch {
    // DB unavailable
  }

  const items = posts
    .map((post) => {
      const date = post.publishedAt ?? post.createdAt
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE}/blog/${post.slug}</guid>
      ${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ''}
      <pubDate>${new Date(date).toUTCString()}</pubDate>
      ${post.tag ? `<category>${post.tag}</category>` : ''}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ComplyPic Blog</title>
    <link>${BASE}/blog</link>
    <description>Image compliance tips, tutorials, and guides.</description>
    <language>en</language>
    <atom:link href="${BASE}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
