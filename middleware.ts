import createMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales } from './config/i18n';

const intlMiddleware = createMiddleware({
	locales,
	defaultLocale: 'he',
	localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req: request, res });

	// Check auth session
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// Get the pathname
	const { pathname } = request.nextUrl;

	// Check if it's an SEO file (sitemap.xml or robots.txt)
	if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
		return NextResponse.next();
	}

	// Check if it's a direct route without locale
	const isNonLocalizedRoute = /^\/(actors|movies|genres)/.test(pathname);

	// Redirect non-localized routes to include the default locale
	if (isNonLocalizedRoute) {
		return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
	}

	// Check if it's a profile page request (generic profile route)
	const isGenericProfilePage = /\/(he|en)\/profile$/.test(pathname);

	// Check if it's a username-specific profile page (like /profile/username)
	const isUsernameProfilePage = /\/(he|en)\/profile\/[^\/]+$/.test(pathname);

	// Handle generic profile page access
	if (isGenericProfilePage && !session) {
		// Get the locale from the pathname
		const locale = pathname.startsWith('/he/') ? 'he' : 'en';
		// Redirect to auth page with the correct locale
		return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
	}

	// Allow access to username-specific profile pages without requiring auth
	if (isUsernameProfilePage) {
		return NextResponse.next();
	}

	// Continue with the intl middleware
	return intlMiddleware(request);
}

export const config = {
	matcher: [
		'/',
		'/(he|en)/:path*',
		'/actors/:path*',
		'/movies/:path*',
		'/genres/:path*',
		'/sitemap.xml',
		'/robots.txt',
	],
};
