import { MeiliSearch, Index } from 'meilisearch'

// Types for our search indexes
export interface MovieSearchDocument {
  id: string
  slug: string
  release_date: string | null
  rating: number | null
  title: string
  synopsis: string | null
  poster_url: string | null
  trailer_url: string | null
  language_code: string
}

export interface ActorSearchDocument {
  id: string
  slug: string
  birth_date: string | null
  birth_place: string | null
  photo_url: string | null
  name: string
  biography: string | null
  language_code: string
}

// Initialize Meilisearch client
const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST!,
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY!,
})

// Get typed indexes
export const moviesIndex: Index<MovieSearchDocument> = client.index('movies')
export const actorsIndex: Index<ActorSearchDocument> = client.index('actors')

// Search settings
export const COMMON_SEARCH_SETTINGS = {
  // Enable typo tolerance
  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 8,
    },
  },
  // Ranking rules
  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
  ],
  // Searchable attributes
  searchableAttributes: [
    'title',
    'synopsis',
    'name',
    'biography',
  ],
  // Filterable attributes
  filterableAttributes: [
    'language_code',
    'release_date',
    'rating',
    'birth_date',
  ],
  // Display attributes
  displayedAttributes: [
    'id',
    'slug',
    'title',
    'synopsis',
    'poster_url',
    'trailer_url',
    'release_date',
    'rating',
    'name',
    'biography',
    'photo_url',
    'birth_date',
    'birth_place',
    'language_code',
  ],
  // Pagination settings
  pagination: {
    maxTotalHits: 100,
  },
}

// Helper function to configure indexes
export async function configureIndexes() {
  try {
    // Configure movies index
    await moviesIndex.updateSettings({
      ...COMMON_SEARCH_SETTINGS,
      // Additional movie-specific settings
      distinctAttribute: 'id',
      sortableAttributes: ['release_date', 'rating'],
    })

    // Configure actors index
    await actorsIndex.updateSettings({
      ...COMMON_SEARCH_SETTINGS,
      // Additional actor-specific settings
      distinctAttribute: 'id',
      sortableAttributes: ['birth_date'],
    })

    console.log('Meilisearch indexes configured successfully')
  } catch (error) {
    console.error('Error configuring Meilisearch indexes:', error)
  }
}

// Helper function to perform search with language filtering
export async function performSearch(
  query: string,
  languageCode: string,
  type: 'movies' | 'actors'
) {
  const index = type === 'movies' ? moviesIndex : actorsIndex
  
  try {
    const results = await index.search(query, {
      filter: [`language_code = ${languageCode}`],
      limit: 10,
    })
    
    return results
  } catch (error) {
    console.error(`Error searching ${type}:`, error)
    return null
  }
}

// Analytics event types
export type AnalyticsEvent = 'click' | 'conversion'

/**
 * Send an analytics event to Meilisearch
 * @param event The type of event (click or conversion)
 * @param queryId The ID of the search query
 * @param objectIds The IDs of the objects that were interacted with
 * @param positions The positions of the objects in the search results (only for click events)
 */
export async function sendAnalyticsEvent(
  event: AnalyticsEvent,
  queryId: string,
  objectIds: string[],
  positions?: number[]
) {
  try {
    if (!queryId || !objectIds.length) {
      console.warn('Missing required parameters for analytics event')
      return
    }

    // Construct the event data
    const eventData: Record<string, any> = {
      queryId,
      objectIds,
    }

    // Add positions for click events
    if (event === 'click' && positions && positions.length === objectIds.length) {
      eventData.positions = positions
    }

    // Send the event to Meilisearch using the new edge URL format
    await fetch(`https://${process.env.NEXT_PUBLIC_MEILISEARCH_HOST}/events/${event}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY}`,
      },
      body: JSON.stringify(eventData),
    })
  } catch (error) {
    console.error(`Error sending ${event} event to Meilisearch:`, error)
  }
}

// Export the client for use in other files
export default client
