import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Check Request Size (Basic protection for Large Payload)
  // Note: Standard Next.js server handles this to some extent, 
  // but we add an explicit check for the image processing route.
  if (request.nextUrl.pathname === '/api/process-image') {
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return new NextResponse(
        JSON.stringify({ error: 'Payload too large. Maximum size is 10MB.' }),
        { status: 413, headers: { 'content-type': 'application/json' } }
      )
    }
  }

  const response = NextResponse.next()

  // 2. Security Headers
  const csp = [
    "default-src 'self'",
    // blob: required for WASM worker bootstrap; wasm-unsafe-eval for WASM compilation
    "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline' blob: https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    // staticimgly.com hosts the @imgly/background-removal WASM and model assets
    "connect-src 'self' https://vitals.vercel-insights.com https://staticimgly.com",
    // Web Workers (used by @imgly/background-removal) are created as blob: URLs
    "worker-src 'self' blob:",
  ].join('; ')

  const securityHeaders = {
    'Content-Security-Policy': csp,
    'Referrer-Policy': 'origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'microphone=(), geolocation=(), interest-cohort=()',
  }

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Limit the middleware to specific paths for performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
