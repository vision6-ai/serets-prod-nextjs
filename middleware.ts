import createMiddleware from 'next-intl/middleware'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales } from './config/i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'he',
  localePrefix: 'always'
})

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Check auth session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname
  const { pathname } = request.nextUrl

  // Check if it's a direct route without locale
  const isNonLocalizedRoute = /^\/(actors|movies|genres)/.test(pathname)
  
  // Redirect non-localized routes to include the default locale
  if (isNonLocalizedRoute) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url))
  }

  // Check if it's a profile page request
  const isProfilePage = /\/(he|en)\/profile/.test(pathname)

  // Handle profile page access
  if (isProfilePage && !session) {
    // Get the locale from the pathname
    const locale = pathname.startsWith('/he/') ? 'he' : 'en'
    // Redirect to auth page with the correct locale
    return NextResponse.redirect(new URL(`/${locale}/auth`, request.url))
  }

  // Continue with the intl middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(he|en)/:path*', '/actors/:path*', '/movies/:path*', '/genres/:path*']
}
