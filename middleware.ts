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

// The allowed email for dashboard access
const ALLOWED_EMAIL = 'yinon@vision6.ai';

export async function middleware(req: NextRequest) {
	// Check if the request is for the dashboard
	if (req.nextUrl.pathname.startsWith('/dashboard')) {
		const res = NextResponse.next();
		const supabase = createMiddlewareClient({ req, res });

		// Skip authentication check for login page
		if (req.nextUrl.pathname === '/dashboard/login') {
			return res;
		}

		// Check user authentication
		const {
			data: { session },
		} = await supabase.auth.getSession();

		// If not authenticated, redirect to login
		if (!session) {
			const redirectUrl = new URL('/dashboard/login', req.url);
			return NextResponse.redirect(redirectUrl);
		}

		// Check if user has the allowed email
		const userEmail = session.user?.email;

		if (userEmail !== ALLOWED_EMAIL) {
			// User is authenticated but not authorized
			// Sign them out and redirect to login
			await supabase.auth.signOut();

			const redirectUrl = new URL(
				'/dashboard/login?unauthorized=true',
				req.url
			);
			return NextResponse.redirect(redirectUrl);
		}

		return res;
	}

	// Apply internationalization middleware to all other routes
	return intlMiddleware(req);
}

export const config = {
	matcher: [
		// Match all routes except static files, API routes, and specific assets
		'/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/).*)',
	],
};
