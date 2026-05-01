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
    // blob: required for WASM worker bootstrap; wasm-unsafe-eval for WASM compilation; Google AdSense scripts
    "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline' blob: https://va.vercel-scripts.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com",
    "style-src 'self' 'unsafe-inline'",
    // Google ads serve images from these domains
    "img-src 'self' blob: data: https://*.googlesyndication.com https://*.google.com https://*.googleadservices.com https://*.doubleclick.net",
    "font-src 'self' data:",
    // blob: required for ONNX runtime workers that fetch WASM via blob: URLs
    "connect-src 'self' blob: https://vitals.vercel-insights.com https://api.stripe.com https://pagead2.googlesyndication.com https://adservice.google.com",
    // Web Workers (used by @imgly/background-removal) are created as blob: URLs
    "worker-src 'self' blob:",
    // AdSense renders ads in iframes from these origins
    "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
  ].join('; ')

  const securityHeaders = {
    'Content-Security-Policy': csp,
    'Referrer-Policy': 'origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'microphone=(), geolocation=()',
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
