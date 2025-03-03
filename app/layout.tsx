import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://serets.co.il'),
  title: {
    default: 'SERETS.CO.IL - Israeli Movie Database',
    template: '%s | SERETS.CO.IL'
  },
  description: 'Discover the best of Israeli cinema. Browse movies, actors, and reviews.',
  keywords: ['Israeli movies', 'Israeli cinema', 'Hebrew movies', 'Israeli actors']
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
