import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

export interface Actor {
  id: string
  name: string
  photo_url: string | null
  slug: string
  biography?: string | null
  birth_date?: string | null
  birth_place?: string | null
}

export interface ActorFilters {
  sortBy: 'name' | 'birth_date'
  sortOrder: 'asc' | 'desc'
}

interface ActorTranslation {
  actor_id: string
  language_code: string
  name: string
  biography: string | null
}

interface ActorWithTranslations {
  id: string
  slug: string
  photo_url: string | null
  birth_date: string | null
  birth_place: string | null
  actor_translations: ActorTranslation[]
}

interface FetchActorsOptions {
  pageParam: number
  locale: string
  filters: ActorFilters
}

interface FetchActorsResponse {
  actors: Actor[]
  nextPage: number | null
  total: number
}

const ACTORS_PER_PAGE = 24

async function fetchActorsPage({ pageParam, locale, filters }: FetchActorsOptions): Promise<FetchActorsResponse> {
  const supabase = createClientComponentClient()
  const from = pageParam * ACTORS_PER_PAGE
  const to = from + ACTORS_PER_PAGE - 1

  console.log('Fetching actors with params:', { pageParam, locale, filters, from, to })

  try {
    // Create the query without complex ordering
    const query = supabase
      .from('actors')
      .select(`
        id, 
        slug, 
        photo_url, 
        birth_date, 
        birth_place,
        actor_translations!inner(
          actor_id,
          language_code,
          name,
          biography
        )
      `, { count: 'exact' })
      .eq('actor_translations.language_code', locale)
      .range(from, to)

    // For birth_date sorting only, we can use the simple column name
    if (filters.sortBy === 'birth_date') {
      query.order('birth_date', { 
        ascending: filters.sortOrder === 'asc',
        nullsFirst: false
      })
    }

    console.log('Executing Supabase query...')
    
    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching actors from Supabase:', error)
      throw new Error(`Supabase query error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.log('No actors found or empty data returned')
      return { actors: [], nextPage: null, total: 0 }
    }

    console.log('Actors data received:', { count, dataLength: data?.length, firstActor: data[0] })

    // Transform the data with additional error handling
    let actors = data.map((actor: any) => {
      // Ensure we have translations before accessing them
      if (!actor.actor_translations || actor.actor_translations.length === 0) {
        console.warn(`Actor ${actor.id} has no translations for locale ${locale}`)
        return {
          id: actor.id,
          name: 'Unknown',
          photo_url: actor.photo_url,
          slug: actor.slug,
          biography: null,
          birth_date: actor.birth_date,
          birth_place: actor.birth_place
        }
      }
      
      return {
        id: actor.id,
        name: actor.actor_translations[0].name,
        photo_url: actor.photo_url,
        slug: actor.slug,
        biography: actor.actor_translations[0].biography,
        birth_date: actor.birth_date,
        birth_place: actor.birth_place
      }
    })

    // If sorting by name, sort the results in JavaScript
    if (filters.sortBy === 'name') {
      console.log('Sorting actors by name in JavaScript')
      actors = actors.sort((a, b) => {
        if (!a.name) return filters.sortOrder === 'asc' ? -1 : 1
        if (!b.name) return filters.sortOrder === 'asc' ? 1 : -1
        
        return filters.sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      })
    }

    const hasMore = count ? from + actors.length < count : false
    const nextPage = hasMore ? pageParam + 1 : null

    console.log('Transformed actors:', { 
      actorsLength: actors.length, 
      hasMore, 
      nextPage, 
      total: count || 0,
      firstActorName: actors.length > 0 ? actors[0].name : 'none'
    })

    return {
      actors,
      nextPage,
      total: count || 0
    }
  } catch (error) {
    console.error('Error fetching actors:', error)
    throw error
  }
}

export function useInfiniteActors(locale: string, filters: ActorFilters) {
  const { ref, inView } = useInView()

  console.log('useInfiniteActors hook called with:', { locale, filters })

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error
  } = useInfiniteQuery<
    FetchActorsResponse,
    Error,
    InfiniteData<FetchActorsResponse>,
    [string, string, ActorFilters],
    number
  >({
    queryKey: ['actors', locale, filters],
    queryFn: ({ pageParam }) => fetchActorsPage({ pageParam, locale, filters }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    gcTime: 1000 * 60 * 30, // Keep data in garbage collection for 30 minutes
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  })

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Error in useInfiniteActors hook:', error)
    }
  }, [error])

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log('Loading next page of actors...')
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const actors = data?.pages.flatMap((page: FetchActorsResponse) => page.actors) ?? []
  const totalActors = data?.pages[0]?.total ?? 0

  console.log('useInfiniteActors returning:', { 
    actorsCount: actors.length, 
    totalActors, 
    isLoading, 
    isFetching,
    hasNextPage,
    firstActor: actors.length > 0 ? actors[0] : null
  })

  return {
    actors,
    totalActors,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef: ref,
    error
  }
} 