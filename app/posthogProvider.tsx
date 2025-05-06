// app/providers.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import SuspendedPostHogPageView from './PostHogPageView';

export function PostHogProvider({ children }: { children: ReactNode }) {
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== 'undefined') {
			posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
				api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
				capture_pageview: false, // We'll handle this ourselves
				persistence: 'localStorage',
				autocapture: true,
				loaded: (posthog) => {
					if (process.env.NODE_ENV === 'development') {
						// This logs in dev only
						posthog.debug();
					}
				}
			});
		}
	}, []);

	if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
		return <>{children}</>;
	}

	return (
		<PHProvider client={posthog}>
			<SuspendedPostHogPageView />
			{children}
		</PHProvider>
	);
}
