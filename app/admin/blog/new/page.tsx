import { PostEditor } from '../components/post-editor'
import { createPostAction } from '../actions'

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">New Post</h1>
      <PostEditor mode="create" action={createPostAction} />
    </div>
  )
}
