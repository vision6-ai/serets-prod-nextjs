import createMiddleware from 'next-intl/middleware'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales } from './config/i18n'

const LOCALE_COOKIE = 'NEXT_LOCALE'
const DEFAULT_LOCALE = 'en'
const ISRAEL_LOCALE = 'he'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always'
})

/**
 * Detects if the user is likely from Israel based on request information
 */
async function isUserFromIsrael(request: NextRequest): Promise<boolean> {
  // 1. Check Cloudflare or Vercel country headers (production environment)
  const cfCountry = request.headers.get('cf-ipcountry')
  const vercelCountry = request.headers.get('x-vercel-ip-country')
  
  if (cfCountry === 'IL' || vercelCountry === 'IL') {
    return true
  }
  
  // 2. Check Accept-Language header (contains 'he' or 'he-IL')
  const acceptLanguage = request.headers.get('accept-language') || ''
  if (acceptLanguage.includes('he') || acceptLanguage.includes('iw')) {
    return true
  }
  
  // 3. If in development and no clear signals, determine based on timezone
  if (process.env.NODE_ENV === 'development') {
    // For development, we'll make a call to detect IP geolocation
    try {
      // Get client IP - in development we can use a free geolocation API
      const forwardedFor = request.headers.get('x-forwarded-for')
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : request.ip
      
      // For local development IPs, we won't be able to determine location
      if (ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168.') || ip?.startsWith('10.')) {
        // For local development, you can set a test environment variable
        return process.env.TEST_LOCALE === 'he'
      }
      
      // Make a request to a geolocation API
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await response.json()
      
      return data.country_code === 'IL'
    } catch (error) {
      console.error('Error detecting location:', error)
      // Default to false if there's an error
      return false
    }
  }
  
  return false
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Check auth session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname
  const { pathname } = request.nextUrl
  
  // Special handling for shorts paths
  if (pathname.startsWith('/shorts') || pathname === '/shorts') {
    // Allow direct access to /shorts and its subpaths
    return NextResponse.next()
  }
  
  // Check if it's a localized shorts URL (e.g., /en/shorts or /he/shorts)
  const isShortsWithLocale = /^\/(he|en)\/shorts(?:\/.*)?$/.test(pathname)
  
  // Redirect localized shorts URLs to the non-localized version
  if (isShortsWithLocale) {
    // Extract the shorts part of the path (everything after /locale/)
    const shortsPath = pathname.replace(/^\/(he|en)\//, '')
    return NextResponse.redirect(new URL(`/${shortsPath}`, request.url))
  }
  
  // Get stored locale preference from cookie
  const localeCookie = request.cookies.get(LOCALE_COOKIE)
  
  // Check if we should auto-detect the locale
  const hasExplicitLocale = pathname.startsWith('/he/') || pathname.startsWith('/en/')
  const hasLocaleCookie = !!localeCookie?.value
  
  // Only auto-detect locale for homepage or when no locale is specified in URL or cookie
  if (pathname === '/' || (!hasExplicitLocale && !hasLocaleCookie)) {
    try {
      // Determine if user is from Israel
      const isFromIsrael = await isUserFromIsrael(request)
      
      // Set locale based on country (Hebrew for Israel, English for others)
      const detectedLocale = isFromIsrael ? ISRAEL_LOCALE : DEFAULT_LOCALE
      
      // If we're on the root path, redirect to the detected locale
      if (pathname === '/') {
        const response = NextResponse.redirect(new URL(`/${detectedLocale}`, request.url))
        
        // Store the detected locale in a cookie for future visits
        response.cookies.set(LOCALE_COOKIE, detectedLocale, { 
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax'
        })
        
        return response
      }
    } catch (error) {
      console.error('Error in locale detection:', error)
      // If there's an error, we'll continue with the default behavior
    }
  }

  // Check if it's a direct route without locale (but not /shorts)
  const isNonLocalizedRoute = /^\/(actors|movies|genres)/.test(pathname)
  
  // Redirect non-localized routes to include the locale (from cookie if available or default)
  if (isNonLocalizedRoute) {
    const redirectLocale = localeCookie?.value || DEFAULT_LOCALE
    return NextResponse.redirect(new URL(`/${redirectLocale}${pathname}`, request.url))
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
  matcher: ['/', '/(he|en)/:path*', '/actors/:path*', '/movies/:path*', '/genres/:path*', '/shorts', '/shorts/:path*']
}
