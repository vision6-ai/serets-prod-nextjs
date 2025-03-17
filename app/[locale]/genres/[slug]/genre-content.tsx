'use client'

import { useTranslations } from 'next-intl'
import { MovieList } from '@/components/movies/movie-list'
import type { Movie } from '@/types/movie'
import { Locale } from '@/config/i18n'

interface Genre {
  id: string
  name: string
  slug: string
}

interface GenreContentProps {
  params: { 
    slug: string
    locale: string 
  }
  initialData: {
    genre: Genre
    movies: Movie[]
  }
}

export function GenreContent({ params, initialData }: GenreContentProps) {
  const t = useTranslations('genres')
  const { genre, movies } = initialData

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{genre.name}</h1>
          <p className="text-sm text-muted-foreground">
            {movies.length} {t('movieCount', { count: movies.length })}
          </p>
        </div>

        {movies.length > 0 ? (
          <MovieList movies={movies} locale={params.locale as Locale} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('noMovies')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
