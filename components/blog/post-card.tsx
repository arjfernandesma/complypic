import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { estimateReadingTime } from '@/lib/blog/markdown'
import { format } from 'date-fns'

interface PostCardProps {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImageUrl: string | null
  tag: string | null
  publishedAt: Date | null
  createdAt: Date
}

export function PostCard({ slug, title, excerpt, coverImageUrl, tag, publishedAt, createdAt }: PostCardProps) {
  const date = publishedAt ?? createdAt
  const formattedDate = format(new Date(date), 'MMMM d, yyyy')

  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 transition-all hover:border-border hover:bg-card/70 hover:shadow-sm"
    >
      {coverImageUrl && (
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageUrl}
            alt={title}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {tag && (
          <Badge variant="outline" className="w-fit text-xs">
            {tag}
          </Badge>
        )}
        <h2 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {title}
        </h2>
        {excerpt && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={new Date(date).toISOString()}>{formattedDate}</time>
        </div>
      </div>
    </Link>
  )
}
