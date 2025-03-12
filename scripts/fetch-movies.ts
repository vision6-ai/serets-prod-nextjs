import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkTables() {
  console.log('🔍 Checking database tables...')
  
  try {
    // Check movies table
    console.log('\n📋 Checking movies table...')
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select('*')
      .limit(5)
    
    if (moviesError) {
      console.error('❌ Error accessing movies table:', moviesError)
    } else {
      console.log(`✅ Found ${movies?.length || 0} movies`)
      if (movies && movies.length > 0) {
        console.log('Sample movie:')
        console.log(movies[0])
      }
    }
    
    // Check movie_translations table
    console.log('\n📋 Checking movie_translations table...')
    const { data: translations, error: translationsError } = await supabase
      .from('movie_translations')
      .select('*')
      .limit(5)
    
    if (translationsError) {
      console.error('❌ Error accessing movie_translations table:', translationsError)
    } else {
      console.log(`✅ Found ${translations?.length || 0} movie translations`)
      if (translations && translations.length > 0) {
        console.log('Sample translation:')
        console.log(translations[0])
      }
    }
    
    // Check genres table
    console.log('\n📋 Checking genres table...')
    const { data: genres, error: genresError } = await supabase
      .from('genres')
      .select('*')
      .limit(5)
    
    if (genresError) {
      console.error('❌ Error accessing genres table:', genresError)
    } else {
      console.log(`✅ Found ${genres?.length || 0} genres`)
      if (genres && genres.length > 0) {
        console.log('Sample genre:')
        console.log(genres[0])
      }
    }
    
    // Check movie_genres table
    console.log('\n📋 Checking movie_genres table...')
    const { data: movieGenres, error: movieGenresError } = await supabase
      .from('movie_genres')
      .select('*')
      .limit(5)
    
    if (movieGenresError) {
      console.error('❌ Error accessing movie_genres table:', movieGenresError)
    } else {
      console.log(`✅ Found ${movieGenres?.length || 0} movie-genre relationships`)
      if (movieGenres && movieGenres.length > 0) {
        console.log('Sample movie-genre relationship:')
        console.log(movieGenres[0])
      }
    }
    
    // Check actors table
    console.log('\n📋 Checking actors table...')
    const { data: actors, error: actorsError } = await supabase
      .from('actors')
      .select('*')
      .limit(5)
    
    if (actorsError) {
      console.error('❌ Error accessing actors table:', actorsError)
    } else {
      console.log(`✅ Found ${actors?.length || 0} actors`)
      if (actors && actors.length > 0) {
        console.log('Sample actor:')
        console.log(actors[0])
      }
    }
    
    // Check actor_translations table
    console.log('\n📋 Checking actor_translations table...')
    const { data: actorTranslations, error: actorTranslationsError } = await supabase
      .from('actor_translations')
      .select('*')
      .limit(5)
    
    if (actorTranslationsError) {
      console.error('❌ Error accessing actor_translations table:', actorTranslationsError)
    } else {
      console.log(`✅ Found ${actorTranslations?.length || 0} actor translations`)
      if (actorTranslations && actorTranslations.length > 0) {
        console.log('Sample actor translation:')
        console.log(actorTranslations[0])
      }
    }
    
    // List all tables in the database
    console.log('\n📋 Listing all tables in the database...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('list_tables')
    
    if (tablesError) {
      if (tablesError.code === '42883') {
        console.log('⚠️ Cannot list tables (list_tables function not available)')
        
        // Try to create the function
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE OR REPLACE FUNCTION list_tables()
            RETURNS TABLE (table_name text)
            LANGUAGE sql
            SECURITY DEFINER
            AS $$
              SELECT 
                tablename::text as table_name
              FROM 
                pg_catalog.pg_tables
              WHERE 
                schemaname = 'public'
              ORDER BY 
                tablename;
            $$;
          `
        })
        
        if (createError) {
          console.error('❌ Error creating list_tables function:', createError)
        } else {
          console.log('✅ Created list_tables function, please run this script again to use it')
        }
      } else {
        console.error('❌ Error listing tables:', tablesError)
      }
    } else {
      console.log('Tables in the database:')
      tables.forEach((table: any) => {
        console.log(`  - ${table.table_name}`)
      })
    }
  } catch (error) {
    console.error('❌ Unhandled error:', error)
  }
}

// Run the check
checkTables().catch(error => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
}) 