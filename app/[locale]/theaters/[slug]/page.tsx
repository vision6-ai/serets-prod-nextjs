import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { TheaterContent } from '@/components/theaters/theater-content'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Theater, TheaterMovie, Movie } from '@/types/theater'
import { Database } from '@/types/supabase'
import { getLocalizedField, formatTmdbImageUrl } from '@/utils/localization'

export const revalidate = 3600

interface MovieWithGenres extends Movie {
  genres?: { name: string; slug: string }[]
}

async function getTheaterData(slug: string, locale: string = 'en') {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get theater details - theaters table uses 'name' not 'slug'
  const { data: theater } = await supabase
    .from('theaters')
    .select('*')
    .eq('name', slug) // Using name instead of slug
    .single()

  if (!theater) {
    return null
  }

  // Get current showtimes for this theater
  const { data: showtimes } = await supabase
    .from('showtimes')
    .select('*')
    .eq('cinema', theater.name)
    .gte('day', new Date().toISOString().split('T')[0])
    .order('day', { ascending: true })

  // Get unique movie PIDs from showtimes
  const moviePids = [...new Set(showtimes?.map(s => s.moviepid) || [])]
  
  // Get movie data for these PIDs
  const { data: movies } = await supabase
    .from('movies')
    .select(`
      id, slug, title_en, title_he, overview_en, overview_he,
      poster_path_en, poster_path_he, backdrop_path,
      release_date, israeli_release_date, runtime, vote_average,
      countit_pid
    `)
    .in('countit_pid', moviePids)

  // Get movie genres using the actual schema
  const movieIds = movies?.map(m => m.id) || []
  const { data: movieGenres } = await supabase
    .from('movie_genres')
    .select(`
      movie_id,
      genres:genres!inner (
        id,
        name_en,
        name_he
      )
    `)
    .in('movie_id', movieIds)

  // Create a map of movie IDs to their genres
  const genresByMovie: Record<string, { name: string; slug: string }[]> = {}
  movieGenres?.forEach((mg: any) => {
    if (!genresByMovie[mg.movie_id]) {
      genresByMovie[mg.movie_id] = []
    }
    if (mg.genres) {
      genresByMovie[mg.movie_id].push({
        name: getLocalizedField(mg.genres.name_en, mg.genres.name_he, locale) || `Genre ${mg.genres.id}`,
        slug: mg.genres.id.toString()
      })
    }
  })

  // Create theater movies with genres and showtimes
  const theaterMovies = movies?.map(movie => {
    const movieShowtimes = showtimes?.filter(s => s.moviepid === movie.countit_pid) || []
    return {
      id: movie.id,
      theater_id: theater.id,
      movie_id: movie.id,
      active_status: true,
      showtimes: movieShowtimes,
      start_date: movieShowtimes[0]?.day || null,
      end_date: movieShowtimes[movieShowtimes.length - 1]?.day || null,
      format: 'standard', // Default format
      language: locale,
      subtitles: null,
      movies: {
        id: movie.id,
        title: getLocalizedField(movie.title_en, movie.title_he, locale) || movie.slug,
        hebrew_title: movie.title_he || movie.title_en,
        synopsis: getLocalizedField(movie.overview_en, movie.overview_he, locale),
        release_date: movie.release_date || movie.israeli_release_date,
        duration: movie.runtime,
        rating: movie.vote_average,
        poster_url: formatTmdbImageUrl(getLocalizedField(movie.poster_path_en, movie.poster_path_he, locale)),
        slug: movie.slug,
        genres: genresByMovie[movie.id] || []
      }
    }
  }) || []

  // Get past screenings (movies from older showtimes)
  const { data: pastShowtimes } = await supabase
    .from('showtimes')
    .select('moviepid')
    .eq('cinema', theater.name)
    .lt('day', new Date().toISOString().split('T')[0])
    .order('day', { ascending: false })
    .limit(20)

  const pastMoviePids = [...new Set(pastShowtimes?.map(s => s.moviepid) || [])]
  
  const { data: pastMoviesData } = await supabase
    .from('movies')
    .select(`
      id, slug, title_en, title_he,
      poster_path_en, poster_path_he,
      countit_pid
    `)
    .in('countit_pid', pastMoviePids)
    .limit(8)

  const pastMovies = pastMoviesData?.map(movie => ({
    id: movie.id,
    theater_id: theater.id,
    movie_id: movie.id,
    active_status: false,
    end_date: null,
    movies: {
      id: movie.id,
      title: getLocalizedField(movie.title_en, movie.title_he, locale) || movie.slug,
      poster_url: formatTmdbImageUrl(getLocalizedField(movie.poster_path_en, movie.poster_path_he, locale)),
      slug: movie.slug
    }
  })) || []

  return {
    theater: {
      id: theater.id,
      name: theater.name,
      name_he: theater.name_he,
      city: theater.city,
      location: theater.location,
      chain: theater.chain,
      slug: theater.name // Using name as slug
    } as Theater,
    currentMovies: theaterMovies as unknown as (TheaterMovie & { movies: MovieWithGenres })[] || [],
    pastMovies: pastMovies as unknown as (TheaterMovie & { movies: Movie })[] || []
  }
}

export default async function TheaterPage({ params }: { params: { slug: string; locale: string } }) {
  // This is critical for server components to work with next-intl
  unstable_setRequestLocale(params.locale)
  
  const data = await getTheaterData(params.slug, params.locale)

  if (!data) {
    notFound()
  }

  return <TheaterContent {...data} />
}