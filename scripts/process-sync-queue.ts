import { createClient } from '@supabase/supabase-js'
import { MeiliSearch } from 'meilisearch'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST!
const MEILISEARCH_ADMIN_KEY = process.env.MEILISEARCH_ADMIN_KEY!

// Create Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Create Meilisearch client
const meilisearch = new MeiliSearch({
  host: `https://${MEILISEARCH_HOST}`,
  apiKey: MEILISEARCH_ADMIN_KEY
})

interface SyncQueueItem {
  id: string
  type: 'movie' | 'actor'
  entity_id: string
  action: 'sync' | 'delete'
  created_at: string
}

interface MovieTranslation {
  title: string
  synopsis: string | null
  poster_url: string | null
  trailer_url: string | null
  language_code: string
}

interface ActorTranslation {
  name: string
  biography: string | null
  language_code: string
}

async function syncMovie(movieId: string): Promise<void> {
  console.log(`🎬 Syncing movie ${movieId}...`)
  
  try {
    // First, get the basic movie data
    const { data: movie, error: movieError } = await supabase
      .from('movies')
      .select('id, slug, release_date, rating')
      .eq('id', movieId)
      .single()
    
    if (movieError) {
      throw new Error(`Error fetching movie: ${movieError.message}`)
    }
    
    if (!movie) {
      throw new Error('Movie not found')
    }
    
    // Then, get the translations separately
    const { data: translations, error: translationsError } = await supabase
      .from('movie_translations')
      .select('title, synopsis, poster_url, trailer_url, language_code')
      .eq('movie_id', movieId)
    
    if (translationsError) {
      throw new Error(`Error fetching movie translations: ${translationsError.message}`)
    }
    
    // Create search documents for each translation
    const searchDocuments = (translations || []).map((translation: MovieTranslation) => ({
      id: `${movie.id}_${translation.language_code}`,
      movie_id: movie.id,
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
    
    if (searchDocuments.length === 0) {
      console.log(`⚠️ No translations found for movie ${movieId}`)
      return
    }
    
    // Add to Meilisearch
    await meilisearch.index('movies').addDocuments(searchDocuments)
    console.log(`✅ Successfully synced movie ${movieId} with ${searchDocuments.length} translations`)
  } catch (error) {
    console.error(`❌ Error syncing movie ${movieId}:`, error)
    throw error
  }
}

async function syncActor(actorId: string): Promise<void> {
  console.log(`👤 Syncing actor ${actorId}...`)
  
  try {
    // First, get the basic actor data
    const { data: actor, error: actorError } = await supabase
      .from('actors')
      .select('id, slug, birth_date, birth_place, photo_url')
      .eq('id', actorId)
      .single()
    
    if (actorError) {
      throw new Error(`Error fetching actor: ${actorError.message}`)
    }
    
    if (!actor) {
      throw new Error('Actor not found')
    }
    
    // Then, get the translations separately
    const { data: translations, error: translationsError } = await supabase
      .from('actor_translations')
      .select('name, biography, language_code')
      .eq('actor_id', actorId)
    
    if (translationsError) {
      throw new Error(`Error fetching actor translations: ${translationsError.message}`)
    }
    
    // Create search documents for each translation
    const searchDocuments = (translations || []).map((translation: ActorTranslation) => ({
      id: `${actor.id}_${translation.language_code}`,
      actor_id: actor.id,
      slug: actor.slug,
      birth_date: actor.birth_date,
      birth_place: actor.birth_place,
      photo_url: actor.photo_url,
      name: translation.name,
      biography: translation.biography,
      language_code: translation.language_code,
      type: 'actor',
    }))
    
    if (searchDocuments.length === 0) {
      console.log(`⚠️ No translations found for actor ${actorId}`)
      return
    }
    
    // Add to Meilisearch
    await meilisearch.index('actors').addDocuments(searchDocuments)
    console.log(`✅ Successfully synced actor ${actorId} with ${searchDocuments.length} translations`)
  } catch (error) {
    console.error(`❌ Error syncing actor ${actorId}:`, error)
    throw error
  }
}

async function deleteMovie(movieId: string): Promise<void> {
  console.log(`🗑️ Deleting movie ${movieId} from search index...`)
  
  try {
    // Get all translations for this movie to know which documents to delete
    const { data: translations, error } = await supabase
      .from('movie_translations')
      .select('language_code')
      .eq('movie_id', movieId)
    
    if (error) {
      throw new Error(`Error fetching movie translations: ${error.message}`)
    }
    
    // Create document IDs to delete
    const documentIds = (translations || []).map(t => `${movieId}_${t.language_code}`)
    
    if (documentIds.length === 0) {
      console.log(`⚠️ No translations found for movie ${movieId}`)
      return
    }
    
    // Delete from Meilisearch
    await meilisearch.index('movies').deleteDocuments(documentIds)
    console.log(`✅ Successfully deleted movie ${movieId} from search index`)
  } catch (error) {
    console.error(`❌ Error deleting movie ${movieId}:`, error)
    throw error
  }
}

async function deleteActor(actorId: string): Promise<void> {
  console.log(`🗑️ Deleting actor ${actorId} from search index...`)
  
  try {
    // Get all translations for this actor to know which documents to delete
    const { data: translations, error } = await supabase
      .from('actor_translations')
      .select('language_code')
      .eq('actor_id', actorId)
    
    if (error) {
      throw new Error(`Error fetching actor translations: ${error.message}`)
    }
    
    // Create document IDs to delete
    const documentIds = (translations || []).map(t => `${actorId}_${t.language_code}`)
    
    if (documentIds.length === 0) {
      console.log(`⚠️ No translations found for actor ${actorId}`)
      return
    }
    
    // Delete from Meilisearch
    await meilisearch.index('actors').deleteDocuments(documentIds)
    console.log(`✅ Successfully deleted actor ${actorId} from search index`)
  } catch (error) {
    console.error(`❌ Error deleting actor ${actorId}:`, error)
    throw error
  }
}

async function processSyncQueue() {
  console.log('🔄 Processing sync queue...')
  
  // Get items from the queue, oldest first, limit to 50 at a time
  const { data: queueItems, error } = await supabase
    .from('sync_queue')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(50)
  
  if (error) {
    console.error('❌ Error fetching sync queue items:', error)
    return
  }
  
  if (!queueItems || queueItems.length === 0) {
    console.log('✅ No items in the sync queue')
    return
  }
  
  console.log(`🔄 Found ${queueItems.length} items to process`)
  
  // Process each item
  for (const item of queueItems as SyncQueueItem[]) {
    console.log(`🔄 Processing item ${item.id} (${item.type} ${item.entity_id})`)
    
    try {
      // Process based on type and action
      if (item.type === 'movie') {
        if (item.action === 'delete') {
          await deleteMovie(item.entity_id)
        } else {
          await syncMovie(item.entity_id)
        }
      } else if (item.type === 'actor') {
        if (item.action === 'delete') {
          await deleteActor(item.entity_id)
        } else {
          await syncActor(item.entity_id)
        }
      } else {
        console.warn(`⚠️ Unknown item type: ${item.type}`)
      }
      
      // Delete the processed item
      const { error: deleteError } = await supabase
        .from('sync_queue')
        .delete()
        .eq('id', item.id)
      
      if (deleteError) {
        console.error(`❌ Error deleting item ${item.id}:`, deleteError)
      } else {
        console.log(`✅ Successfully processed and deleted item ${item.id}`)
      }
    } catch (error) {
      console.error(`❌ Error processing item ${item.id}:`, error)
    }
  }
  
  console.log('✅ Finished processing sync queue')
}

// Run the process
processSyncQueue()
  .catch(error => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  }) 