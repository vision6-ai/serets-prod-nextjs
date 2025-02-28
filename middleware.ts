import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  try {
    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth session error:', error)
    }

    // Add caching headers for static assets and public content
    const path = req.nextUrl.pathname
    if (
      path.startsWith('/_next/') || // Static assets
      path.startsWith('/public/') || // Public files
      path.endsWith('.jpg') ||
      path.endsWith('.png') ||
      path.endsWith('.webp')
    ) {
      res.headers.set(
        'Cache-Control',
        'public, max-age=3600, stale-while-revalidate=86400'
      )
    } else if (path.startsWith('/api/')) {
      // API routes - shorter cache
      res.headers.set(
        'Cache-Control',
        'public, max-age=60, stale-while-revalidate=600'
      )
    } else {
      // Dynamic routes - no cache
      res.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )
    }

    return res
  } catch (e) {
    console.error('Middleware error:', e)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
