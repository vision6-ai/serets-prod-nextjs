import { MeiliSearch } from 'meilisearch'

const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST
const MEILISEARCH_SEARCH_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY

const searchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_SEARCH_KEY
})

const indexes = {
  movies: searchClient.index('movies'),
  actors: searchClient.index('actors')
}

export interface MovieSearchResult {
  id: string
  title: string
  hebrew_title: string | null
  slug: string
  poster_url: string | null
  release_date: string | null
  rating: number | null
}

export interface ActorSearchResult {
  id: string
  name: string
  hebrew_name: string | null
  slug: string
  photo_url: string | null
}

export async function searchMovies(query: string): Promise<MovieSearchResult[]> {
  try {
    const { hits } = await indexes.movies.search(query, {
      limit: 5,
      attributesToRetrieve: [
        'id',
        'title',
        'hebrew_title',
        'slug',
        'poster_url',
        'release_date',
        'rating',
        'synopsis'
      ],
      attributesToHighlight: [
        'title',
        'hebrew_title'
      ]
    })
    return hits as MovieSearchResult[]
  } catch (error) {
    if (error.code !== 'index_not_found') {
      console.error('Error searching movies:', error)
    }
    return []
  }
}

export async function searchActors(query: string): Promise<ActorSearchResult[]> {
  try {
    const { hits } = await indexes.actors.search(query, {
      limit: 5,
      attributesToRetrieve: [
        'id',
        'name',
        'hebrew_name',
        'slug',
        'photo_url'
      ],
      attributesToHighlight: [
        'name',
        'hebrew_name'
      ]
    })
    return hits as ActorSearchResult[]
  } catch (error) {
    if (error.code !== 'index_not_found') {
      console.error('Error searching actors:', error)
    }
    return []
  }
}