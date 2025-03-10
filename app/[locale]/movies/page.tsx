'use client'

import { useState } from 'react'
import { MovieGrid } from '@/components/movies/movie-grid'
import { MovieFilters } from '@/components/movies/movie-filters'
import { Filters } from '@/hooks/use-infinite-movies'
import { useTranslations } from 'next-intl'

interface MoviesPageProps {
  params: {
    locale: string
  }
}

export default function MoviesPage({ params: { locale } }: MoviesPageProps) {
  const t = useTranslations('movies')
  const [filters, setFilters] = useState<Filters>({
    genres: [],
    sortBy: 'release_date',
    sortOrder: 'desc',
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
      
      <div className="space-y-8">
        <MovieFilters
          onFilterChange={setFilters}
          locale={locale}
        />
        
        <MovieGrid
          locale={locale}
          filters={filters}
        />
      </div>
    </div>
  )
}
