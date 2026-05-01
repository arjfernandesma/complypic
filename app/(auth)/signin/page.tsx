import { Metadata } from 'next'
import Link from 'next/link'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="ComplyPic" className="mx-auto h-10 w-auto" />
          </Link>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Sign in to ComplyPic
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a magic link.
          </p>
        </div>
        <SignInForm />
        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
