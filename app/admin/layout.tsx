import { requireAdmin } from '@/lib/auth-helpers'
import Link from 'next/link'
import { AppBackground } from '@/components/app-background'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <div className="min-h-dvh bg-background">
      <AppBackground />
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-5xl items-center gap-4 px-4 sm:px-6">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            ComplyPic Admin
          </span>
          <div className="flex-1" />
          <Link
            href="/admin/blog"
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Blog Posts
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; View site
          </Link>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
