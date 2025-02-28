import { ThemeProvider } from '@/components/theme-provider'
import { PageTransition } from '@/components/page-transition'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://serets.co.il'),
  title: {
    default: 'SERETS.CO.IL - Israeli Movie Database',
    template: '%s | SERETS.CO.IL'
  },
  description: 'Discover the best of Israeli cinema. Browse movies, actors, and reviews.',
  keywords: ['Israeli movies', 'Israeli cinema', 'Hebrew movies', 'Israeli actors'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://serets.co.il',
    siteName: 'SERETS.CO.IL',
    title: 'SERETS.CO.IL - Israeli Movie Database',
    description: 'Discover the best of Israeli cinema. Browse movies, actors, and reviews.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SERETS.CO.IL'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SERETS.CO.IL - Israeli Movie Database',
    description: 'Discover the best of Israeli cinema. Browse movies, actors, and reviews.',
    images: ['/og-image.jpg']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
