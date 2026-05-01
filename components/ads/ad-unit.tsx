'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  className?: string
}

export function AdUnit({ slot, format = 'auto', className }: AdUnitProps) {
  const insRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  if (!client) return null

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle${className ? ` ${className}` : ''}`}
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
