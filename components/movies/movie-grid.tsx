'use client'

import { useInfiniteMovies, Filters } from '@/hooks/use-infinite-movies'
import { MovieCard } from './movie-card'
import { useTranslations } from 'next-intl'

interface MovieGridProps {
  locale: string
  filters: Filters
  category?: string
}

export function MovieGrid({ locale, filters, category }: MovieGridProps) {
  const t = useTranslations('movies')
  const {
    movies,
    totalMovies,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef,
  } = useInfiniteMovies(locale, filters, category)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[2/3] bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (!movies.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {t('no_results')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} locale={locale} />
        ))}
      </div>
      
      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      
      {/* Intersection observer target */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="h-1" />
      )}
      
      {/* Movies count */}
      <div className="text-center text-sm text-muted-foreground">
        {t('showing_count', {
          shown: movies.length,
          total: totalMovies
        })}
      </div>
    </div>
  )
}