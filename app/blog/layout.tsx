import { SiteHeader } from '@/components/site-header'
import { AppBackground } from '@/components/app-background'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBackground />
      <SiteHeader />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {children}
      </div>
    </>
  )
}
