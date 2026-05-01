import { eq, and, desc, isNull } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { blogPosts } from '@/lib/db/schema'
import { nanoid } from 'nanoid'
import { slugify } from '@/lib/blog/slug'

type PostRow = typeof blogPosts.$inferSelect

const listColumns = {
  id: blogPosts.id,
  slug: blogPosts.slug,
  title: blogPosts.title,
  excerpt: blogPosts.excerpt,
  coverImageUrl: blogPosts.coverImageUrl,
  tag: blogPosts.tag,
  publishedAt: blogPosts.publishedAt,
  createdAt: blogPosts.createdAt,
}

export async function listPublishedPosts() {
  return db
    .select(listColumns)
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(50)
}

export async function listAllPosts() {
  return db
    .select({
      ...listColumns,
      published: blogPosts.published,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
}

export async function getPostBySlug(slug: string): Promise<PostRow | null> {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1)
  return rows[0] ?? null
}

export async function getPostById(id: string): Promise<PostRow | null> {
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1)
  return rows[0] ?? null
}

async function findUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base
  let attempt = 1
  while (true) {
    const rows = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, candidate))
      .limit(1)
    if (rows.length === 0 || (excludeId && rows[0].id === excludeId)) {
      return candidate
    }
    attempt++
    candidate = `${base}-${attempt}`
  }
}

export async function createPost(data: {
  title: string
  slug?: string
  excerpt?: string | null
  content: string
  coverImageUrl?: string | null
  tag?: string | null
  published: boolean
  authorId?: string | null
}): Promise<PostRow> {
  const id = nanoid()
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.title)
  const slug = await findUniqueSlug(baseSlug)
  const now = new Date()
  const rows = await db
    .insert(blogPosts)
    .values({
      id,
      slug,
      title: data.title,
      excerpt: data.excerpt ?? null,
      content: data.content,
      coverImageUrl: data.coverImageUrl ?? null,
      tag: data.tag ?? null,
      published: data.published,
      publishedAt: data.published ? now : null,
      authorId: data.authorId ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
  return rows[0]
}

export async function updatePost(
  id: string,
  data: Partial<{
    title: string
    slug: string
    excerpt: string | null
    content: string
    coverImageUrl: string | null
    tag: string | null
    published: boolean
  }>,
): Promise<PostRow> {
  const existing = await getPostById(id)
  const now = new Date()

  const slugUpdate =
    data.slug !== undefined
      ? { slug: await findUniqueSlug(slugify(data.slug), id) }
      : {}

  const publishedAtUpdate =
    data.published === true && existing && !existing.publishedAt
      ? { publishedAt: now }
      : {}

  const rows = await db
    .update(blogPosts)
    .set({
      ...data,
      ...slugUpdate,
      ...publishedAtUpdate,
      updatedAt: now,
    })
    .where(eq(blogPosts.id, id))
    .returning()
  return rows[0]
}

export async function deletePost(id: string): Promise<void> {
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
}

export async function togglePublish(id: string, published: boolean): Promise<void> {
  const existing = await getPostById(id)
  const now = new Date()
  const publishedAtUpdate =
    published && existing && !existing.publishedAt ? { publishedAt: now } : {}
  await db
    .update(blogPosts)
    .set({ published, ...publishedAtUpdate, updatedAt: now })
    .where(eq(blogPosts.id, id))
}
