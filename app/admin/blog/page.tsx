import Link from 'next/link'
import { listAllPosts } from '@/lib/blog/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PostListActions } from './components/post-list-actions'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const posts = await listAllPosts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Blog Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">{posts.length} posts total</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/blog/new">
            <Plus className="size-4" />
            New Post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <p className="text-sm text-muted-foreground">No posts yet.</p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/admin/blog/new">Create your first post</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border/60 sm:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tag
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {posts.map((post) => (
                  <tr key={post.id} className="bg-background transition-colors hover:bg-muted/20">
                    <td className="max-w-[220px] px-4 py-3">
                      <span className="block truncate font-medium text-foreground">
                        {post.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className="font-mono">{post.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      {post.tag && (
                        <Badge variant="outline" className="text-xs">
                          {post.tag}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={post.published ? 'default' : 'secondary'} className="text-xs">
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PostListActions
                        postId={post.id}
                        slug={post.slug}
                        published={post.published}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-border/60 bg-card/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{post.title}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                      {post.slug}
                    </p>
                  </div>
                  <Badge
                    variant={post.published ? 'default' : 'secondary'}
                    className="shrink-0 text-xs"
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.tag && (
                      <Badge variant="outline" className="text-xs">
                        {post.tag}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <PostListActions
                    postId={post.id}
                    slug={post.slug}
                    published={post.published}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
