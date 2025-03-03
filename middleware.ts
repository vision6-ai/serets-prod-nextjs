import createMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/config/i18n';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    // Handle i18n routing first
    const response = await intlMiddleware(request);

    // Special handling for movie detail pages
    const pathname = request.nextUrl.pathname;
    if (pathname.match(/^\/movies\/[^\/]+$/)) {
      // Extract the movie slug
      const slug = pathname.split('/').pop();
      // Redirect to the localized version
      const locale = response.headers.get('x-middleware-request-locale') || defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/movies/${slug}`, request.url));
    }

    // Special handling for actor detail pages
    if (pathname.match(/^\/actors\/[^\/]+$/)) {
      const slug = pathname.split('/').pop();
      const locale = response.headers.get('x-middleware-request-locale') || defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/actors/${slug}`, request.url));
    }

    // Special handling for genre pages
    if (pathname.match(/^\/genres\/[^\/]+$/)) {
      const slug = pathname.split('/').pop();
      const locale = response.headers.get('x-middleware-request-locale') || defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/genres/${slug}`, request.url));
    }

    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth session error:', error);
    }

    // Add caching headers
    const path = request.nextUrl.pathname;
    if (
      path.startsWith('/_next/') || // Static assets
      path.startsWith('/public/') || // Public files
      path.endsWith('.jpg') ||
      path.endsWith('.png') ||
      path.endsWith('.webp')
    ) {
      response.headers.set(
        'Cache-Control',
        'public, max-age=3600, stale-while-revalidate=86400'
      );
    } else if (path.startsWith('/api/')) {
      response.headers.set(
        'Cache-Control',
        'public, max-age=60, stale-while-revalidate=600'
      );
    } else {
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
    }

    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    return res;
  }
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};