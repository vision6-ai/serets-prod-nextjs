'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MovieSlider } from './movie-slider'

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

export function MovieSections() {
  const [sections, setSections] = useState<{
    latest: Movie[]
    topRated: Movie[]
    genreMovies: { [key: string]: { name: string, movies: Movie[] } }
    loading: boolean
  }>({
    latest: [],
    topRated: [],
    genreMovies: {},
    loading: true
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchMovies() {
      try {
        const now = new Date().toISOString()

        // Fetch genres first
        const { data: genres } = await supabase
          .from('genres')
          .select('*')
          .order('name')

        if (!genres) return

        // Fetch latest and top rated in parallel
        const [latestRes, topRatedRes] = await Promise.all([
          // Latest releases (last 6 months)
          supabase
            .from('movies')
            .select('*')
            .lt('release_date', now)
            .gt('release_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
            .order('release_date', { ascending: false })
            .limit(10),

          // Top rated movies
          supabase
            .from('movies')
            .select('*')
            .lt('release_date', now)
            .order('rating', { ascending: false })
            .limit(10)
        ])

        // Fetch movies for each genre
        const genreMovies: { [key: string]: { name: string, movies: Movie[] } } = {}
        
        await Promise.all(genres.map(async (genre) => {
          const { data: movieIds } = await supabase
            .from('movie_genres')
            .select('movie_id')
            .eq('genre_id', genre.id)
            .limit(10)

          if (movieIds && movieIds.length > 0) {
            const { data: movies } = await supabase
              .from('movies')
              .select('*')
              .in('id', movieIds.map(m => m.movie_id))
              .lt('release_date', now)
              .order('release_date', { ascending: false })

            if (movies && movies.length > 0) {
              genreMovies[genre.slug] = {
                name: genre.name,
                movies: movies
              }
            }
          }
        }))

        setSections({
          latest: latestRes.data || [],
          topRated: topRatedRes.data || [],
          genreMovies,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching movies:', error)
        setSections(prev => ({ ...prev, loading: false }))
      }
    }

    fetchMovies()
  }, [supabase])

  return (
    <>
      <MovieSlider
        title="Latest Releases"
        movies={sections.latest}
        loading={sections.loading}
        viewAllHref="/movies/latest"
      />
      
      <MovieSlider
        title="Top Rated"
        movies={sections.topRated}
        loading={sections.loading}
        viewAllHref="/movies/top-rated"
      />
      
      {/* Genre-based movie sliders */}
      {Object.entries(sections.genreMovies).map(([slug, { name, movies }]) => (
        <MovieSlider
          key={slug}
          title={name}
          movies={movies}
          loading={sections.loading}
          viewAllHref={`/genres/${slug}`}
        />
      ))}
    </>
  )
}
