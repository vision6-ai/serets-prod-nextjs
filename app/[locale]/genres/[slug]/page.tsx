import { createClient } from '@supabase/supabase-js'
import { GenreContent } from './genre-content'
import { notFound } from 'next/navigation'
import type { Movie } from '@/types/movie'
import { Database } from '@/types/supabase'
import { getLocalizedField, formatTmdbImageUrl } from '@/utils/localization'

export const revalidate = 3600

interface Genre {
  id: number
  name: string
  slug: string
}

async function getGenreData(slug: string, locale: string = 'en'): Promise<{ genre: Genre; movies: Movie[] } | null> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log('Fetching genre:', slug)

  // Get the genre by ID (slug is actually the ID)
  const genreId = parseInt(slug)
  if (isNaN(genreId)) {
    return null
  }

  const { data: genreData, error: genreError } = await supabase
    .from('genres')
    .select('id, name_en, name_he')
    .eq('id', genreId)
    .single()

  console.log('Genre result:', { genreData, error: genreError })

  if (genreError || !genreData) {
    return null
  }

  const genre = {
    id: genreData.id,
    name: getLocalizedField(genreData.name_en, genreData.name_he, locale) || `Genre ${genreData.id}`,
    slug: genreData.id.toString()
  }

  // Get all movie IDs for this genre
  const { data: movieGenres, error: movieGenresError } = await supabase
    .from('movie_genres')
    .select('movie_id')
    .eq('genre_id', genre.id)

  if (movieGenresError) {
    console.error('Error fetching movie genres:', movieGenresError)
    return null
  }

  const movieIds = movieGenres.map(mg => mg.movie_id)

  if (movieIds.length === 0) {
    // No movies for this genre
    return {
      genre,
      movies: []
    }
  }

  // Get movies with bilingual data
  const { data: moviesData, error: moviesError } = await supabase
    .from('movies')
    .select(`
      id, slug, release_date, runtime, vote_average,
      title_en, title_he, overview_en, overview_he,
      poster_path_en, poster_path_he
    `)
    .in('id', movieIds)

  console.log('Movies result:', { moviesData, error: moviesError })

  if (moviesError) {
    console.error('Error fetching movies:', moviesError)
    return null
  }

  // Transform the movies data to match the expected format
  const movies = (moviesData || []).map(movie => {
    return {
      id: movie.id,
      title: getLocalizedField(movie.title_en, movie.title_he, locale) || movie.slug,
      hebrew_title: movie.title_he || movie.title_en || movie.slug,
      synopsis: getLocalizedField(movie.overview_en, movie.overview_he, locale),
      release_date: movie.release_date,
      duration: movie.runtime,
      rating: movie.vote_average,
      poster_url: formatTmdbImageUrl(getLocalizedField(movie.poster_path_en, movie.poster_path_he, locale)),
      trailer_url: null, // Will be populated from movie_videos if needed
      slug: movie.slug,
    }
  })

  console.log('Processed movies:', movies)

  return {
    genre,
    movies
  }
}

export default async function GenrePage({ 
  params 
}: { 
  params: { 
    slug: string
    locale: string 
  } 
}) {
  const data = await getGenreData(params.slug, params.locale)

  if (!data) {
    notFound()
  }

  return <GenreContent initialData={data} params={params} />
}
