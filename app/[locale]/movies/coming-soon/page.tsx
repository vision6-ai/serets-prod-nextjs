import { Suspense } from 'react'
import { Locale } from '@/config/i18n'
import { MoviesContent } from '@/components/movies/movies-content'
import { MovieSkeleton } from '@/components/skeletons'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coming Soon Movies | SERETS.CO.IL',
  description: 'Discover upcoming movies that are coming soon to theaters.',
}

interface ComingSoonPageProps {
  params: {
    locale: Locale
  }
}

export default function ComingSoonPage({ params: { locale } }: ComingSoonPageProps) {
  unstable_setRequestLocale(locale)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Coming Soon</h1>
        <p className="text-muted-foreground">
          Discover upcoming movies that are coming soon to theaters
        </p>
      </div>

      <Suspense fallback={<MovieSkeleton />}>
        <MoviesContent locale={locale} category="coming-soon" />
      </Suspense>
    </div>
  )
} 