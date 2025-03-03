import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { TheaterContent } from '@/components/theaters/theater-content'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Theater, TheaterMovie, Movie } from '@/types/theater'

export const revalidate = 3600

interface MovieGenre {
  genres: {
    id: string
    name: string
    slug: string
  }
}

interface MovieWithGenres extends Movie {
  genres?: { name: string; slug: string }[]
}

async function getTheaterData(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get theater details
  const { data: theater } = await supabase
    .from('theaters')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!theater) {
    return null
  }

  // Get active movies for this theater
  const { data: theaterMovies } = await supabase
    .from('theater_movies')
    .select(`
      id,
      theater_id,
      movie_id,
      active_status,
      showtimes,
      start_date,
      end_date,
      format,
      language,
      subtitles,
      movies (
        id,
        title,
        hebrew_title,
        synopsis,
        release_date,
        duration,
        rating,
        poster_url,
        slug
      )
    `)
    .eq('theater_id', theater.id)
    .eq('active_status', true)
    .gte('end_date', new Date().toISOString())
    .order('start_date', { ascending: false })

  // Get movie genres
  const movieIds = theaterMovies?.map(tm => tm.movie_id) || []
  const { data: movieGenres } = await supabase
    .from('movie_genres')
    .select(`
      movie_id,
      genres (
        id,
        name,
        slug
      )
    `)
    .in('movie_id', movieIds)

  // Create a map of movie IDs to their genres
  const genresByMovie: Record<string, { name: string; slug: string }[]> = {}
  movieGenres?.forEach((mg: any) => {
    if (!genresByMovie[mg.movie_id]) {
      genresByMovie[mg.movie_id] = []
    }
    // Ensure genres is properly typed and accessed
    if (mg.genres && typeof mg.genres === 'object') {
      genresByMovie[mg.movie_id].push({
        name: mg.genres.name,
        slug: mg.genres.slug
      })
    }
  })

  // Add genres to movies
  const moviesWithGenres = theaterMovies?.map(tm => ({
    ...tm,
    movies: {
      ...tm.movies,
      genres: genresByMovie[tm.movie_id] || []
    }
  }))

  // Get past screenings (movies that are no longer active)
  const { data: pastMovies } = await supabase
    .from('theater_movies')
    .select(`
      id,
      theater_id,
      movie_id,
      active_status,
      end_date,
      movies (
        id,
        title,
        poster_url,
        slug
      )
    `)
    .eq('theater_id', theater.id)
    .eq('active_status', false)
    .lt('end_date', new Date().toISOString())
    .order('end_date', { ascending: false })
    .limit(8)

  return {
    theater: theater as Theater,
    currentMovies: moviesWithGenres as unknown as (TheaterMovie & { movies: MovieWithGenres })[] || [],
    pastMovies: pastMovies as unknown as (TheaterMovie & { movies: Movie })[] || []
  }
}

export default async function TheaterPage({ params }: { params: { slug: string; locale: string } }) {
  // This is critical for server components to work with next-intl
  unstable_setRequestLocale(params.locale)
  
  const data = await getTheaterData(params.slug)

  if (!data) {
    notFound()
  }

  return <TheaterContent {...data} />
}