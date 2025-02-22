'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MovieList } from '@/components/movies/movie-list'
import { MovieFilters } from '@/components/movies/movie-filters'
import { createBrowserClient } from '@supabase/ssr'

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
}

interface Filters {
  genres: Array<string>
  year?: number | null
  rating?: number | null
  sortBy: 'release_date' | 'rating' | 'title'
  sortOrder: 'asc' | 'desc'
}

export function MoviesContent() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const currentFilters = useRef<Filters>({
    genres: Array<string>(),
    sortBy: 'release_date',
    sortOrder: 'desc'
  })

  // Get the current page category from the URL
  const category = pathname.split('/').pop() || ''

  const fetchMovies = useCallback(async (filters: Filters) => {
    // Don't show loading state if filters haven't changed
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(currentFilters.current)
    if (filtersChanged) {
      setLoading(true)
    }
    currentFilters.current = filters

    try {
      let query = supabase.from('movies').select('*')
      const now = new Date().toISOString()

      // Apply category-specific filters
      switch (category) {
        case 'latest':
          query = query
            .lt('release_date', now)
            .gt('release_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
          break
        
        case 'top-rated':
          query = query
            .lt('release_date', now)
            .gte('rating', 7)
          break
      }

      // Apply user filters
      if (filters.genres.length > 0) {
        const { data: movieIds } = await supabase
          .from('movie_genres')
          .select('movie_id')
          .in('genre_id', filters.genres)
        
        if (movieIds && movieIds.length > 0) {
          query = query.in('id', movieIds.map(item => item.movie_id))
        } else {
          setMovies([])
          setLoading(false)
          return
        }
      }

      if (filters.year) {
        query = query
          .gte('release_date', `${filters.year}-01-01`)
          .lte('release_date', `${filters.year}-12-31`)
      }

      if (filters.rating) {
        query = query.gte('rating', filters.rating)
      }

      // Apply sorting
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })

      const { data, error } = await query

      if (error) throw error
      
      // Only update if these are still the current filters
      if (JSON.stringify(filters) === JSON.stringify(currentFilters.current)) {
        setMovies(data || [])
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
      setMovies([])
    } finally {
      // Only update loading state if these are still the current filters
      if (JSON.stringify(filters) === JSON.stringify(currentFilters.current)) {
        setLoading(false)
      }
    }
  }, [category, supabase])

  useEffect(() => {
    const initialFilters: Filters = {
      genres: [],
      sortBy: category === 'top-rated' ? 'rating' : 'release_date',
      sortOrder: 'desc'
    }

    fetchMovies(initialFilters)
  }, [category, fetchMovies])

  return (
    <div className="space-y-8">
      <MovieFilters onFilterChange={fetchMovies} />
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[2/3] bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {movies.length > 0 ? (
              <MovieList movies={movies} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No movies found matching your filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
