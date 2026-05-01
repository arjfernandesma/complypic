import Link from 'next/link'
import { UserIcon } from 'lucide-react'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export async function SiteHeader() {
  const session = await auth()
  const user = session?.user

  return (
    <header className="border-b border-border/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="ComplyPic" className="h-9 w-auto object-contain" />
          <div>
            <p className="text-sm font-bold leading-none text-foreground">ComplyPic</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Compliance in one pass
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            Pricing
          </Link>
          {user ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/account">
                <UserIcon className="size-4" />
                Account
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/pricing">Upgrade</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
