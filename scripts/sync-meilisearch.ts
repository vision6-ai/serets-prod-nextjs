import { supabaseAdmin } from '@/lib/supabase'
import { adminClient, initializeMeilisearch } from '@/lib/meilisearch-admin'

if (!supabaseAdmin) {
  throw new Error('Supabase admin client not available. Please check your SUPABASE_SERVICE_ROLE_KEY environment variable.');
}

async function syncMovies() {
  try {
    const { data: movies, error } = await supabaseAdmin
      .from('movies')
      .select(`
        id,
        title,
        hebrew_title,
        slug,
        synopsis,
        release_date,
        duration,
        rating,
        poster_url,
        created_at,
        updated_at
      `)

    if (error) {
      throw error
    }

    if (movies && movies.length > 0) {
      const moviesIndex = adminClient.index('movies')
      await moviesIndex.addDocuments(movies, { primaryKey: 'id' })
      console.log(`✅ Successfully synced ${movies.length} movies to Meilisearch`)
    } else {
      console.log('ℹ️ No movies found to sync')
    }
  } catch (error) {
    console.error('❌ Error syncing movies:', error)
    throw error
  }
}

async function syncActors() {
  try {
    const { data: actors, error } = await supabaseAdmin
      .from('actors')
      .select(`
        id,
        name,
        hebrew_name,
        slug,
        biography,
        birth_date,
        birth_place,
        photo_url,
        created_at,
        updated_at
      `)

    if (error) {
      throw error
    }

    if (actors && actors.length > 0) {
      const actorsIndex = adminClient.index('actors')
      await actorsIndex.addDocuments(actors, { primaryKey: 'id' })
      console.log(`✅ Successfully synced ${actors.length} actors to Meilisearch`)
    } else {
      console.log('ℹ️ No actors found to sync')
    }
  } catch (error) {
    console.error('❌ Error syncing actors:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('🔄 Starting Meilisearch sync...')
    
    // Initialize Meilisearch indexes and settings
    console.log('📦 Initializing Meilisearch indexes...')
    await initializeMeilisearch()

    // Sync data
    console.log('🎬 Syncing movies...')
    await syncMovies()
    
    console.log('🎭 Syncing actors...')
    await syncActors()

    console.log('✨ Initial sync completed successfully')
  } catch (error) {
    console.error('❌ Error during sync:', error)
    process.exit(1)
  }
}

main()