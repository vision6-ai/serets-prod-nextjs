'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MovieList } from '@/components/movies/movie-list'
import { useTranslations } from 'next-intl'

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
}

interface Genre {
  id: string
  name: string
  slug: string
}

export function GenreContent({ params }: { params: { slug: string; locale: string } }) {
  const [genre, setGenre] = useState<Genre | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const t = useTranslations('genres')

  useEffect(() => {
    async function fetchGenreData() {
      try {
        // First get the genre details
        const { data: genreData, error: genreError } = await supabase
          .from('genres')
          .select('id, name, slug')
          .eq('slug', params.slug)
          .single()

        if (genreError) {
          console.error('Error fetching genre:', genreError)
          return
        }

        if (genreData) {
          setGenre(genreData)

          // Get movie IDs for this genre
          const { data: movieGenres, error: movieGenresError } = await supabase
            .from('movie_genres')
            .select('movie_id')
            .eq('genre_id', genreData.id)

          if (movieGenresError) {
            console.error('Error fetching movie genres:', movieGenresError)
            return
          }

          if (movieGenres && movieGenres.length > 0) {
            // Get full movie details for these IDs
            const movieIds = movieGenres.map(mg => mg.movie_id)
            const { data: moviesData, error: moviesError } = await supabase
              .from('movies')
              .select('*')
              .in('id', movieIds)
              .order('release_date', { ascending: false })

            if (moviesError) {
              console.error('Error fetching movies:', moviesError)
              return
            }

            if (moviesData) {
              setMovies(moviesData)
            }
          } else {
            setMovies([])
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchGenreData()
    }
  }, [params.slug, supabase])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-48 bg-muted rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[2/3] bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!genre) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{t('notFound')}</h1>
          <p className="text-muted-foreground">
            {t('notFoundDesc')}
          </p>
        </div>
      </div>
    )
  }

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
          <MovieList movies={movies} />
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
