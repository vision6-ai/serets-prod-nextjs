import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://serets.co.il'),
  title: 'SERETS.CO.IL - Israeli Movie Database',
  description: 'Discover the best of Israeli cinema. Browse movies and actors.',
  keywords: ['Israeli movies', 'Israeli cinema', 'Hebrew movies', 'Israeli actors'],
  openGraph: {
    type: 'website',
    url: 'https://serets.co.il',
    title: 'SERETS.CO.IL - Israeli Movie Database',
    description: 'Discover the best of Israeli cinema. Browse movies and actors.',
    siteName: 'SERETS.CO.IL',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SERETS.CO.IL'
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
