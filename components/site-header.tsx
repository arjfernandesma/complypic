"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  ScanLine,
  Eraser,
  Layers,
  CreditCard,
  BookOpen,
  User,
  LogOut,
  Menu,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "Compliance Tool", icon: ScanLine, exact: true },
  { href: "/batch", label: "Bulk Processing", icon: Layers, badge: "Pro" },
  { href: "/blog", label: "Blog", icon: BookOpen, exact: false },
  { href: "/pricing", label: "Pricing", icon: CreditCard, exact: false },
] as const

const TOOLS = [
  {
    href: "/tools/background-removal",
    label: "Background Remover",
    icon: Eraser,
    desc: "AI-powered · runs in your browser",
  },
] as const

export function SiteHeader() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  const toolsActive = TOOLS.some((t) => pathname.startsWith(t.href))

  const initials = session?.user?.email
    ? session.user.email.slice(0, 2).toUpperCase()
    : null

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md transition-shadow duration-200",
        scrolled && "shadow-[0_1px_16px_0_oklch(0.15_0.02_240/0.07)]"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ComplyPic" className="h-8 w-auto object-contain" />
          <span className="text-sm font-bold leading-none text-foreground">ComplyPic</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-3 hidden items-center gap-0.5 md:flex" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon, badge, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors",
                isActive(href, exact)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {label}
              {badge && (
                <span className="rounded-full bg-primary/15 px-1.5 py-px text-[9px] font-black tracking-wider text-primary">
                  {badge}
                </span>
              )}
            </Link>
          ))}

          {/* Tools dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "group flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-widest outline-none transition-colors",
                  toolsActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                Tools
                <ChevronDown className="size-3 transition-transform duration-150 group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-1.5">
              {TOOLS.map(({ href, label, icon: Icon, desc }) => (
                <DropdownMenuItem key={href} asChild className="rounded-md p-0 focus:bg-secondary">
                  <Link href={href} className="flex cursor-pointer items-center gap-3 px-2 py-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-3.5" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold">{label}</span>
                      <span className="block text-[10px] text-muted-foreground">{desc}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex-1" />

        {/* Desktop right */}
        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <div className="size-8 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary ring-offset-background transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-2">
                  <p className="truncate text-xs font-medium text-foreground">
                    {session.user?.name || session.user?.email}
                  </p>
                  {session.user?.name && (
                    <p className="truncate text-[11px] text-muted-foreground">{session.user.email}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex cursor-pointer items-center gap-2">
                    <User className="size-3.5" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 size-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="text-[11px] font-bold uppercase tracking-widest">
              <Link href="/signin">Sign in</Link>
            </Button>
          )}

          {pathname !== "/pricing" && (
            <Button asChild size="sm" className="text-[11px] font-bold uppercase tracking-widest">
              <Link href="/pricing">Get Pro</Link>
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-[min(80vw,18rem)] flex-col gap-0 p-0">
            {/* Sheet logo */}
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ComplyPic" className="h-7 w-auto" />
              <span className="text-sm font-bold text-foreground">ComplyPic</span>
            </div>

            {/* Sheet links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Mobile">
              {NAV.map(({ href, label, icon: Icon, badge, exact }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(href, exact)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="rounded-full bg-primary/15 px-2 py-px text-[10px] font-black text-primary">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="pt-3">
                <p className="mb-1 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Tools
                </p>
                {TOOLS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname.startsWith(href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Sheet footer */}
            <div className="space-y-2 border-t border-border p-3">
              {session ? (
                <>
                  <div className="rounded-lg bg-muted/60 px-3 py-2">
                    <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <User className="size-4 shrink-0" />
                    Account
                  </Link>
                  <button
                    onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }) }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="size-4 shrink-0" />
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Sign in
                </Link>
              )}
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Pro
              </Link>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  )
}
