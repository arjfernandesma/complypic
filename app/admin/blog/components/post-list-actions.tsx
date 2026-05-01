'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePostAction, togglePublishAction } from '../actions'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

interface Props {
  postId: string
  slug: string
  published: boolean
}

export function PostListActions({ postId, slug, published }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isPublished, setIsPublished] = useState(published)

  function handleToggle() {
    startTransition(async () => {
      await togglePublishAction(postId, isPublished)
      setIsPublished((prev) => !prev)
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button asChild variant="ghost" size="icon-sm">
        <Link href={`/admin/blog/${postId}/edit`} aria-label="Edit post">
          <Pencil className="size-3.5" />
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isPublished ? 'Unpublish' : 'Publish'}
        title={isPublished ? 'Unpublish' : 'Publish'}
      >
        {isPublished ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label="Delete post">
            <Trash2 className="size-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => startTransition(() => deletePostAction(postId))}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
