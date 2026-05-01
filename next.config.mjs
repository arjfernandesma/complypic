import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    'drizzle-orm',
    'postgres',
    '@auth/drizzle-adapter',
    'stripe',
    'resend',
    'nanoid',
    'archiver',
    '@upstash/redis',
    '@upstash/ratelimit',
    'sharp',
  ],
  turbopack: {
    root: 'C:\\projetos\\complypic\\.claude\\worktrees\\agent-a24cea8aa4cb2c4ab',
    resolveAlias: {
      'next': 'C:\\projetos\\complypic\\.claude\\worktrees\\agent-a24cea8aa4cb2c4ab\\node_modules\\next',
    },
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["*.vusercontent.net", "*.vercel.app", "localhost"],
  async rewrites() {
    // Proxy @imgly/background-removal CDN assets through our own origin.
    // The CDN (staticimgly.com) blocks browser requests with CORS 403, but
    // allows server-side requests. Vercel fetches server-side and returns
    // the response to the browser as same-origin — no CORS issue.
    return [
      {
        source: "/bg-assets/:path*",
        destination:
          "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/:path*",
      },
    ]
  },
}

export default nextConfig
