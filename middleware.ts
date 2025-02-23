import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ['/profile']
  const { pathname } = request.nextUrl

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If there is no session and the user is trying to access a protected route,
    // redirect them to the auth page
    if (!session && pathname !== '/auth') {
      const redirectUrl = new URL('/auth', request.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If user is already logged in and tries to access auth page,
  // redirect them to profile page
  if (pathname === '/auth') {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }

  return response
}

// Specify which routes the middleware should run on
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
