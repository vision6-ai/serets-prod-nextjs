import { MeiliSearch } from 'meilisearch'

const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
const MEILISEARCH_ADMIN_KEY = process.env.MEILISEARCH_ADMIN_KEY;

if (!MEILISEARCH_HOST || !MEILISEARCH_ADMIN_KEY) {
  throw new Error('Missing Meilisearch environment variables');
}

export const adminClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_ADMIN_KEY
})

// Initialize indexes with settings
export async function initializeMeilisearch() {
  try {
    // Create movies index
    await adminClient.createIndex('movies', { primaryKey: 'id' })
    const moviesIndex = adminClient.index('movies')
    
    // Configure movies index settings
    await moviesIndex.updateSettings({
      searchableAttributes: [
        'title',
        'hebrew_title',
        'synopsis'
      ],
      filterableAttributes: [
        'release_date',
        'rating',
        'duration'
      ],
      sortableAttributes: [
        'release_date',
        'rating',
        'title'
      ],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness'
      ],
      displayedAttributes: [
        'id',
        'title',
        'hebrew_title',
        'slug',
        'synopsis',
        'release_date',
        'duration',
        'rating',
        'poster_url'
      ]
    })

    // Create actors index
    await adminClient.createIndex('actors', { primaryKey: 'id' })
    const actorsIndex = adminClient.index('actors')
    
    // Configure actors index settings
    await actorsIndex.updateSettings({
      searchableAttributes: [
        'name',
        'hebrew_name',
        'biography'
      ],
      filterableAttributes: [
        'birth_date',
        'birth_place'
      ],
      sortableAttributes: [
        'name',
        'birth_date'
      ],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness'
      ],
      displayedAttributes: [
        'id',
        'name',
        'hebrew_name',
        'slug',
        'biography',
        'birth_date',
        'birth_place',
        'photo_url'
      ]
    })

    console.log('✅ Meilisearch indexes initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing Meilisearch:', error)
    throw error
  }
}