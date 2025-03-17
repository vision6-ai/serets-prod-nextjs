'use client'

import { Suspense, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Locale } from '@/config/i18n'
import { MoviesContent } from '@/components/movies/movies-content'
import { MovieSkeleton } from '@/components/skeletons'
import { Filters } from '@/hooks/use-infinite-movies'

interface NowInTheatersProps {
  locale: Locale
}

export function NowInTheaters({ locale }: NowInTheatersProps) {
  const t = useTranslations('home')
  const [filters, setFilters] = useState<Filters>({
    genres: [],
    sortBy: 'release_date',
    sortOrder: 'desc',
  })

  return (
    <section className="w-full py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('nowInTheaters')}</h1>
        <p className="text-muted-foreground">
          {t('nowInTheatersSubtitle')}
        </p>
      </div>

      <Suspense fallback={<MovieSkeleton />}>
        <MoviesContent 
          locale={locale} 
          category="now-in-theaters" 
          filters={filters}
          onFilterChange={setFilters}
        />
      </Suspense>
    </section>
  )
} 