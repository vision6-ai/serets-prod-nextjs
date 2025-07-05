import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	metadataBase: new URL('https://serets.co.il'),
	title: 'MovieTime - Israeli Movie Database',
	description: 'Discover the best of Israeli cinema. Browse movies and actors.',
	keywords: [
		'Israeli movies',
		'Israeli cinema',
		'Hebrew movies',
		'Israeli actors',
	],
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: 'any' },
			{ url: '/favicon.png', type: 'image/png' },
		],
		apple: { url: '/favicon.png', type: 'image/png' },
	},
	openGraph: {
		type: 'website',
		url: 'https://serets.co.il',
		title: 'MovieTime - Israeli Movie Database',
		description:
			'Discover the best of Israeli cinema. Browse movies and actors.',
		siteName: 'MovieTime',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'MovieTime',
			},
		],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
