import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

const CACHE_RULES = {
  static: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  dynamic: 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
  api: 'public, max-age=30, s-maxage=300, stale-while-revalidate=3600'
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Refresh session if expired
  supabase.auth.getSession()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Static pages
  if (request.nextUrl.pathname.match(/^\/(movies|actors)\/[^/]+$/)) {
    response.headers.set('Cache-Control', CACHE_RULES.static)
    response.headers.set('CDN-Cache-Control', CACHE_RULES.static)
  }
  
  // List pages
  else if (request.nextUrl.pathname.match(/^\/(movies|actors)$/)) {
    response.headers.set('Cache-Control', CACHE_RULES.dynamic)
    response.headers.set('CDN-Cache-Control', CACHE_RULES.dynamic)
  }
  
  // API routes
  else if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', CACHE_RULES.api)
    response.headers.set('CDN-Cache-Control', CACHE_RULES.api)
  }

  return response
}

export const config = {
  matcher: [
    '/movies/:path*',
    '/actors/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ],
}