'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MovieList } from '@/components/movies/movie-list'

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

export function GenreContent() {
  const params = useParams()
  const slug = params?.slug as string
  const [genre, setGenre] = useState<Genre | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchGenreData() {
      try {
        // First get the genre details with translations
        const { data: genreData, error: genreError } = await supabase
          .from('genres')
          .select(`
            id, 
            slug,
            translations:genre_translations(name, language_code)
          `)
          .eq('slug', slug)
          .single()

        if (genreError) {
          console.error('Error fetching genre:', genreError)
          return
        }

        if (genreData) {
          // Find English translation or fallback to slug
          const englishTranslation = genreData.translations?.find(t => t.language_code === 'en')
          const genreName = englishTranslation?.name || genreData.slug
          
          // Create genre object with the translated name
          const genre = {
            id: genreData.id,
            name: genreName,
            slug: genreData.slug
          }
          
          setGenre(genre)

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
              .select(`
                id,
                slug,
                release_date,
                duration,
                rating,
                translations:movie_translations(
                  title,
                  synopsis,
                  poster_url,
                  language_code
                )
              `)
              .in('id', movieIds)
              .order('release_date', { ascending: false })

            if (moviesError) {
              console.error('Error fetching movies:', moviesError)
              return
            }

            if (moviesData) {
              // Transform movie data to include translations
              const transformedMovies = moviesData.map(movie => {
                const englishTranslation = movie.translations?.find(t => t.language_code === 'en')
                const hebrewTranslation = movie.translations?.find(t => t.language_code === 'he')
                
                return {
                  id: movie.id,
                  title: englishTranslation?.title || movie.slug,
                  hebrew_title: hebrewTranslation?.title || null,
                  release_date: movie.release_date,
                  poster_url: englishTranslation?.poster_url || null,
                  rating: movie.rating,
                  slug: movie.slug
                }
              })
              
              setMovies(transformedMovies)
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

    if (slug) {
      fetchGenreData()
    }
  }, [slug, supabase])

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
          <h1 className="text-4xl font-bold mb-4">Genre Not Found</h1>
          <p className="text-muted-foreground">
            The genre you&apos;re looking for doesn&apos;t exist.
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
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in this category
          </p>
        </div>

        {movies.length > 0 ? (
          <MovieList movies={movies} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No movies found in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
