'use server'

import { requireAdmin } from '@/lib/auth-helpers'
import { createPost, updatePost, deletePost, togglePublish } from '@/lib/blog/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/blog/slug'

function extractFields(formData: FormData) {
  return {
    title: formData.get('title') as string,
    slug: (formData.get('slug') as string) || undefined,
    excerpt: (formData.get('excerpt') as string) || null,
    content: (formData.get('content') as string) ?? '',
    coverImageUrl: (formData.get('coverImageUrl') as string) || null,
    tag: (formData.get('tag') as string) || null,
    published: formData.get('published') === 'true',
  }
}

export async function createPostAction(formData: FormData) {
  const user = await requireAdmin()
  const fields = extractFields(formData)
  await createPost({ ...fields, authorId: user.id })
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  redirect('/admin/blog')
}

export async function updatePostAction(id: string, formData: FormData) {
  await requireAdmin()
  const fields = extractFields(formData)
  const post = await updatePost(id, fields)
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/sitemap.xml')
  redirect('/admin/blog')
}

export async function deletePostAction(id: string) {
  await requireAdmin()
  await deletePost(id)
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  redirect('/admin/blog')
}

export async function togglePublishAction(id: string, currentPublished: boolean) {
  await requireAdmin()
  await togglePublish(id, !currentPublished)
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
}
