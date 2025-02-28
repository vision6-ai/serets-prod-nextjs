import { createClient } from '@supabase/supabase-js'

async function testPages() {
  console.log('🧪 Starting page tests...')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Test 1: Check if movies data is loading
  console.log('\n📽️ Testing movies data...')
  const { data: movies, error: moviesError } = await supabase
    .from('movies')
    .select('*')
    .limit(1)
  
  if (moviesError) {
    console.error('❌ Error loading movies:', moviesError.message)
  } else if (!movies || movies.length === 0) {
    console.error('❌ No movies found in the database')
  } else {
    console.log('✅ Movies data loading successfully')
    console.log(`Found ${movies.length} movies`)
  }

  // Test 2: Check if actors data is loading
  console.log('\n🎭 Testing actors data...')
  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('*')
    .limit(1)
  
  if (actorsError) {
    console.error('❌ Error loading actors:', actorsError.message)
  } else if (!actors || actors.length === 0) {
    console.error('❌ No actors found in the database')
  } else {
    console.log('✅ Actors data loading successfully')
    console.log(`Found ${actors.length} actors`)
  }
}

testPages().catch(console.error)
