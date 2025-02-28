import { supabase } from '@/lib/supabase'
import slugify from 'slugify'

const TMDB_API_KEY = 'cdce580bce909c06c26d682740c5ccee'
const TMDB_API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZGNlNTgwYmNlOTA5YzA2YzI2ZDY4Mjc0MGM1Y2NlZSIsIm5iZiI6MTczOTg2ODcyOC4yOTYsInN1YiI6IjY3YjQ0YTM4NWRjOTg4YjFiYjlmYzMxNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.DF8Wo9U1MM-gg71bw7mh41YYqY3rwnmeNmBvmnXcxu8'
const TMDB_IMAGE_BASE = 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2'

interface TMDBMovie {
  id: number
  title: string
  original_title: string
  overview: string
  release_date: string
  poster_path: string | null
  vote_average: number
}

interface TMDBCast {
  id: number
  name: string
  character: string
  profile_path: string | null
  biography?: string
  birthday?: string
  place_of_birth?: string
}

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${TMDB_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function getMovieDetails(movieId: number) {
  const details = await fetchFromTMDB(`/movie/${movieId}`, {
    append_to_response: 'credits,videos'
  })
  return details
}

async function getActorDetails(actorId: number) {
  return await fetchFromTMDB(`/person/${actorId}`)
}

async function syncMovies() {
  console.log('🎬 Fetching Israeli movies from TMDB...')
  
  // Verify database connection
  try {
    const { data, error } = await supabase.from('movies').select('count')
    if (error) throw error
    console.log('✅ Database connection verified')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }

  let totalProcessed = 0
  let successCount = 0
  let errorCount = 0

  // Get Israeli movies from TMDB (multiple pages to get 80+ movies)
  const movies: TMDBMovie[] = []
  for (let page = 1; page <= 4; page++) {
    console.log(`📄 Fetching page ${page}...`)
    const data = await fetchFromTMDB('/discover/movie', {
      with_original_language: 'he',
      sort_by: 'popularity.desc',
      page: page.toString(),
      include_adult: 'false'
    })
    movies.push(...data.results)
    console.log(`Found ${data.results.length} movies on page ${page}`)
  }

  console.log(`📝 Found ${movies.length} movies`)

  // Process each movie
  for (const movie of movies) {
    try {
      console.log(`\n🎥 Processing movie: ${movie.title} (${movie.original_title})`)
      totalProcessed++

      // Get detailed movie info including credits
      const details = await getMovieDetails(movie.id)
      
      // Get trailer URL if available
      let trailerUrl = null
      if (details.videos?.results) {
        const trailer = details.videos.results.find((v: any) => 
          v.type === 'Trailer' && v.site === 'YouTube'
        )
        if (trailer) {
          trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`
          console.log(`📺 Found trailer: ${trailerUrl}`)
        }
      }

      // Generate unique slug
      const baseSlug = slugify(movie.title, { lower: true, strict: true })
      const slug = `${baseSlug}-${movie.id}`

      console.log(`🎬 Inserting movie into database...`)
      // Insert movie into Supabase
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .upsert({
          title: movie.title,
          hebrew_title: movie.original_title,
          slug,
          synopsis: movie.overview,
          release_date: movie.release_date,
          poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
          rating: movie.vote_average,
          trailer_url: trailerUrl,
          duration: details.runtime || null
        })
        .select('id')
        .single()

      if (movieError) throw movieError
      console.log(`📝 Movie data inserted/updated successfully`)

      // Process cast members
      console.log(`👥 Processing cast members...`)
      const cast = details.credits.cast.slice(0, 10) // Get top 10 cast members
      for (const actor of cast) {
        console.log(`👤 Processing actor: ${actor.name}`)
        // Get detailed actor info
        const actorDetails = await getActorDetails(actor.id)
        
        // Generate unique actor slug
        const actorSlug = `${slugify(actor.name, { lower: true, strict: true })}-${actor.id}`

        // Insert actor into Supabase
        const { data: actorData, error: actorError } = await supabase
          .from('actors')
          .upsert({
            name: actor.name,
            slug: actorSlug,
            biography: actorDetails.biography,
            birth_date: actorDetails.birthday,
            birth_place: actorDetails.place_of_birth,
            photo_url: actor.profile_path ? `${TMDB_IMAGE_BASE}${actor.profile_path}` : null
          })
          .select('id')
          .single()

        if (actorError) throw actorError

        // Create movie-actor relationship
        const { error: relationError } = await supabase
          .from('movie_actors')
          .upsert({
            movie_id: movieData.id,
            actor_id: actorData.id,
            role: actor.character
          })

        if (relationError) throw relationError
        console.log(`✅ Added ${actor.name} as ${actor.character}`)
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log(`✅ Successfully processed: ${movie.title}`)
      successCount++
    } catch (error) {
      console.error(`❌ Error processing ${movie.title}:`, error)
      errorCount++
    }
  }

  console.log('\n📊 Sync Summary:')
  console.log(`Total movies found: ${movies.length}`)
  console.log(`Successfully processed: ${successCount}`)
  console.log(`Failed to process: ${errorCount}`)
  console.log(`Success rate: ${((successCount / totalProcessed) * 100).toFixed(1)}%`)
}

async function main() {
  try {
    console.log('🔄 Starting TMDB data sync...')
    await syncMovies()
    console.log('✨ Sync completed successfully')
  } catch (error) {
    console.error('❌ Error during sync:', error)
    process.exit(1)
  }
}

main()