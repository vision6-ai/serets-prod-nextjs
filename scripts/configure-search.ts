import { config } from 'dotenv'
import { MeiliSearch } from 'meilisearch'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config()

// Debug environment variables
console.log('Environment variables:')
console.log('MEILISEARCH_HOST:', process.env.NEXT_PUBLIC_MEILISEARCH_HOST)
console.log('MEILISEARCH_ADMIN_KEY:', process.env.MEILISEARCH_ADMIN_KEY ? '***' : 'undefined')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '***' : 'undefined')

if (!process.env.MEILISEARCH_ADMIN_KEY) {
  throw new Error('MEILISEARCH_ADMIN_KEY is not set in environment variables')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
}

// Initialize Meilisearch client with admin key
const meilisearch = new MeiliSearch({
  host: `https://${process.env.NEXT_PUBLIC_MEILISEARCH_HOST}`,
  apiKey: process.env.MEILISEARCH_ADMIN_KEY,
})

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Search settings
const COMMON_SEARCH_SETTINGS = {
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
    'type',
  ],
  // Display attributes
  displayedAttributes: [
    'search_id',
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
    'type',
  ],
  // Pagination settings
  pagination: {
    maxTotalHits: 100,
  },
}

async function waitForTask(taskUid: number) {
  let status = 'processing'
  while (status === 'processing' || status === 'enqueued') {
    const task = await meilisearch.getTask(taskUid)
    status = task.status
    if (status === 'failed') {
      throw new Error(`Task ${taskUid} failed: ${task.error?.message}`)
    }
    if (status === 'processing' || status === 'enqueued') {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  return status
}

async function deleteIndex(indexName: string) {
  try {
    console.log(`Deleting index: ${indexName}...`)
    const task = await meilisearch.deleteIndex(indexName)
    await waitForTask(task.taskUid)
    console.log(`Deleted index: ${indexName}`)
  } catch (error) {
    console.log(`Index ${indexName} does not exist or was already deleted`)
  }
}

async function createAndConfigureIndex(indexName: string) {
  console.log(`Creating index: ${indexName}...`)
  try {
    const task = await meilisearch.createIndex(indexName, { primaryKey: 'search_id' })
    await waitForTask(task.taskUid)
    console.log(`Created index: ${indexName}`)
    
    // Configure index settings
    console.log(`Updating settings for index: ${indexName}...`)
    const settingsTask = await meilisearch.index(indexName).updateSettings({
      ...COMMON_SEARCH_SETTINGS,
      distinctAttribute: 'search_id',
      sortableAttributes: indexName === 'movies' 
        ? ['release_date', 'rating']
        : ['birth_date'],
    })
    await waitForTask(settingsTask.taskUid)
    console.log(`Updated settings for index: ${indexName}`)
  } catch (error) {
    console.error(`Error configuring index ${indexName}:`, error)
    throw error
  }
}

async function syncMovies() {
  console.log('Syncing movies...')
  const { data: movies, error: moviesError } = await supabase
    .from('movies')
    .select(`
      id,
      slug,
      release_date,
      rating,
      movie_translations (
        title,
        synopsis,
        poster_url,
        trailer_url,
        language_code
      )
    `)

  if (moviesError) {
    throw new Error(`Error fetching movies: ${moviesError.message}`)
  }

  if (!movies?.length) {
    console.log('No movies found to sync')
    return
  }

  const searchDocuments = movies.flatMap(movie => 
    movie.movie_translations.map(translation => ({
      search_id: `${movie.id}_${translation.language_code}`,
      slug: movie.slug,
      release_date: movie.release_date,
      rating: movie.rating,
      title: translation.title,
      synopsis: translation.synopsis,
      poster_url: translation.poster_url,
      trailer_url: translation.trailer_url,
      language_code: translation.language_code,
      type: 'movie',
    }))
  )

  if (searchDocuments.length > 0) {
    console.log(`Adding ${searchDocuments.length} movie documents...`)
    const task = await meilisearch.index('movies').addDocuments(searchDocuments)
    await waitForTask(task.taskUid)
    console.log('Movies sync completed')
  }
}

async function syncActors() {
  console.log('Syncing actors...')
  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select(`
      id,
      slug,
      birth_date,
      birth_place,
      photo_url,
      actor_translations (
        name,
        biography,
        language_code
      )
    `)

  if (actorsError) {
    throw new Error(`Error fetching actors: ${actorsError.message}`)
  }

  if (!actors?.length) {
    console.log('No actors found to sync')
    return
  }

  const searchDocuments = actors.flatMap(actor =>
    actor.actor_translations.map(translation => ({
      search_id: `${actor.id}_${translation.language_code}`,
      slug: actor.slug,
      birth_date: actor.birth_date,
      birth_place: actor.birth_place,
      photo_url: actor.photo_url,
      name: translation.name,
      biography: translation.biography,
      language_code: translation.language_code,
      type: 'actor',
    }))
  )

  if (searchDocuments.length > 0) {
    console.log(`Adding ${searchDocuments.length} actor documents...`)
    const task = await meilisearch.index('actors').addDocuments(searchDocuments)
    await waitForTask(task.taskUid)
    console.log('Actors sync completed')
  }
}

async function configureIndexes() {
  try {
    console.log('Deleting existing indexes...')
    await deleteIndex('movies')
    await deleteIndex('actors')
    
    console.log('Creating and configuring Meilisearch indexes...')
    await createAndConfigureIndex('movies')
    await createAndConfigureIndex('actors')
    console.log('Meilisearch indexes created and configured successfully')

    // Sync initial data
    await syncMovies()
    await syncActors()

    console.log('Initial data sync completed')
    
    // Get stats
    const moviesStats = await meilisearch.index('movies').getStats()
    const actorsStats = await meilisearch.index('actors').getStats()
    console.log('Movies index stats:', moviesStats)
    console.log('Actors index stats:', actorsStats)
  } catch (error) {
    console.error('Error configuring Meilisearch indexes:', error)
    process.exit(1)
  }
}

// Run configuration
configureIndexes()
