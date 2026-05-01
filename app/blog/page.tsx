import type { Metadata } from 'next'
import { listPublishedPosts } from '@/lib/blog/queries'
import { PostCard } from '@/components/blog/post-card'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog | ComplyPic',
  description:
    'Image compliance tips, tutorials, and guides — passport photos, document specs, e-commerce requirements and more.',
  openGraph: {
    title: 'Blog | ComplyPic',
    description:
      'Image compliance tips, tutorials, and guides — passport photos, document specs, e-commerce requirements and more.',
    url: 'https://complypic.com/blog',
  },
  twitter: {
    title: 'Blog | ComplyPic',
    description:
      'Image compliance tips, tutorials, and guides — passport photos, document specs, e-commerce requirements and more.',
  },
}

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof listPublishedPosts>> = []
  try {
    posts = await listPublishedPosts()
  } catch {
    // DB unavailable at build time
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Blog
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Image compliance tips, tutorials, and guides.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <p className="text-sm text-muted-foreground">No posts published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </div>
  )
}
