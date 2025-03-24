'use client'

import { Suspense, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Locale } from '@/config/i18n'
import { MoviesContent } from '@/components/movies/movies-content'
import { MovieSkeleton } from '@/components/skeletons'
import { HomeSearch } from '@/components/home-search'

interface NowInTheatersProps {
  locale: Locale
}

export function NowInTheaters({ locale }: NowInTheatersProps) {
  const t = useTranslations('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  // Handle search with better error handling
  const handleSearch = useCallback((query: string, city: string | null) => {
    console.log('Search triggered:', { query, city })
    setSearchQuery(query)
    setSelectedCity(city)
  }, [])

  return (
    <section className="w-full py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('nowInTheaters')}</h1>
        <p className="text-muted-foreground">
          {t('nowInTheatersSubtitle')}
        </p>
      </div>

      {/* Add the HomeSearch component */}
      <HomeSearch 
        locale={locale} 
        onSearch={handleSearch}
      />

      <Suspense fallback={<MovieSkeleton />}>
        <MoviesContent 
          locale={locale} 
          category="now-in-theaters" 
          hideFilters={true}
          searchQuery={searchQuery}
          selectedCity={selectedCity}
        />
      </Suspense>
    </section>
  )
} 