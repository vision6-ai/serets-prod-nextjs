import { Suspense } from 'react'
import { Locale } from '@/config/i18n'
import { MoviesContent } from '@/components/movies/movies-content'
import { MovieSkeleton } from '@/components/skeletons'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Now in Theaters | MovieTime',
  description: 'Discover movies currently showing in theaters.',
}

interface NowInTheatersPageProps {
  params: {
    locale: Locale
  }
}

export default function NowInTheatersPage({ params: { locale } }: NowInTheatersPageProps) {
  unstable_setRequestLocale(locale)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Now in Theaters</h1>
        <p className="text-muted-foreground">
          Discover movies currently showing in theaters
        </p>
      </div>

      <Suspense fallback={<MovieSkeleton />}>
        <MoviesContent locale={locale} category="now-in-theaters" />
      </Suspense>
    </div>
  )
} 