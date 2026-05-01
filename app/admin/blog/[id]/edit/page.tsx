import { getPostById } from '@/lib/blog/queries'
import { PostEditor } from '../../components/post-editor'
import { updatePostAction } from '../../actions'
import { notFound } from 'next/navigation'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) notFound()
  const action = updatePostAction.bind(null, id)
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Edit Post</h1>
      <PostEditor mode="edit" post={post} action={action} />
    </div>
  )
}
