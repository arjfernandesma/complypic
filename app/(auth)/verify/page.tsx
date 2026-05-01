import { Metadata } from 'next'
import Link from 'next/link'
import { MailIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Check your email',
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <MailIcon className="size-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a magic link to your email address. Click the link to sign in.
            The link expires in 24 hours.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <Link
            href="/signin"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            try again
          </Link>
          .
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
