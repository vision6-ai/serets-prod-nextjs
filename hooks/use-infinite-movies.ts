import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

export interface Movie {
  id: string
  title: string
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
  synopsis?: string | null
  duration?: number | null
}

export interface Filters {
  genres: Array<string>
  year?: number | null
  rating?: number | null
  theaterId?: string | null
  sortBy: 'release_date' | 'rating' | 'title'
  sortOrder: 'asc' | 'desc'
}

interface MovieTranslation {
  movie_id: string
  language_code: string
  title: string
  synopsis: string | null
  poster_url: string | null
  trailer_url: string | null
}

interface MovieWithTranslations {
  id: string
  slug: string
  release_date: string | null
  rating: number | null
  duration: number | null
  movie_translations: MovieTranslation[]
}

interface FetchMoviesOptions {
  pageParam: number
  locale: string
  filters: Filters
  category?: string
}

interface FetchMoviesResponse {
  movies: Movie[]
  nextPage: number | null
  total: number
}

const MOVIES_PER_PAGE = 20

async function fetchMoviesPage({ pageParam, locale, filters, category }: FetchMoviesOptions): Promise<FetchMoviesResponse> {
  const supabase = createClientComponentClient()
  const from = pageParam * MOVIES_PER_PAGE
  const to = from + MOVIES_PER_PAGE - 1

  try {
    let query = supabase
      .from('movies')
      .select('*, movie_translations!inner(*)', { count: 'exact' })
      .eq('movie_translations.language_code', locale)
      .range(from, to)

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
        return { movies: [], nextPage: null, total: 0 }
      }
    }

    // Apply theater filter if selected
    if (filters.theaterId) {
      const { data: movieIds } = await supabase
        .from('movie_showtimes')
        .select('movie_id')
        .eq('theater_id', filters.theaterId)
        .is('deleted_at', null)
      
      if (movieIds && movieIds.length > 0) {
        query = query.in('id', movieIds.map(item => item.movie_id))
      } else {
        return { movies: [], nextPage: null, total: 0 }
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

    // Execute query
    const { data, error, count } = await query

    if (error) throw error

    // Transform the data
    const movies = (data as MovieWithTranslations[]).map(movie => ({
      id: movie.id,
      title: movie.movie_translations[0].title,
      release_date: movie.release_date,
      poster_url: movie.movie_translations[0].poster_url,
      rating: movie.rating,
      slug: movie.slug,
      synopsis: movie.movie_translations[0].synopsis,
      duration: movie.duration,
    }))

    const hasMore = count ? from + movies.length < count : false
    const nextPage = hasMore ? pageParam + 1 : null

    return {
      movies,
      nextPage,
      total: count || 0
    }
  } catch (error) {
    console.error('Error fetching movies:', error)
    throw error
  }
}

export function useInfiniteMovies(locale: string, filters: Filters, category?: string) {
  const { ref, inView } = useInView()

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<
    FetchMoviesResponse,
    Error,
    InfiniteData<FetchMoviesResponse>,
    [string, string, Filters, string | undefined],
    number
  >({
    queryKey: ['movies', locale, filters, category],
    queryFn: ({ pageParam }) => fetchMoviesPage({ pageParam, locale, filters, category }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    gcTime: 1000 * 60 * 30, // Keep data in garbage collection for 30 minutes
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const movies = data?.pages.flatMap((page: FetchMoviesResponse) => page.movies) ?? []
  const totalMovies = data?.pages[0]?.total ?? 0

  return {
    movies,
    totalMovies,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef: ref,
  }
}
