import { createClient } from '@supabase/supabase-js'
import { GenreContent } from './genre-content'
import { notFound } from 'next/navigation'
import type { Movie } from '@/types/movie'

export const revalidate = 3600

interface Genre {
  id: string
  name: string
  slug: string
}

// Define types for the data structure
interface MovieTranslation {
  title: string;
  synopsis: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  language_code: string;
  movie_id: string;
}

async function getGenreData(slug: string, locale: string = 'en'): Promise<{ genre: Genre; movies: Movie[] } | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log('Fetching genre:', slug)

  // First get the genre with translations
  const { data: genreData, error: genreError } = await supabase
    .from('genres')
    .select(`
      id, 
      slug,
      translations:genre_translations(name)
    `)
    .eq('slug', slug)
    .eq('translations.language_code', locale)
    .single()

  console.log('Genre result:', { genreData, error: genreError })

  if (genreError || !genreData) {
    return null
  }

  // Extract the name from translations
  const genreName = genreData.translations && 
                    genreData.translations.length > 0 ? 
                    genreData.translations[0].name : 
                    genreData.slug // Fallback to slug if no translation

  const genre = {
    id: genreData.id,
    name: genreName,
    slug: genreData.slug
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

  // Get movies basic data first
  const { data: moviesData, error: moviesError } = await supabase
    .from('movies')
    .select(`
      id,
      slug,
      release_date,
      duration,
      rating
    `)
    .in('id', movieIds)

  console.log('Movies result:', { moviesData, error: moviesError })

  if (moviesError) {
    console.error('Error fetching movies:', moviesError)
    return null
  }

  // Then fetch translations separately
  const { data: translationsData, error: translationsError } = await supabase
    .from('movie_translations')
    .select(`
      title,
      synopsis,
      poster_url,
      trailer_url,
      language_code,
      movie_id
    `)
    .in('movie_id', movieIds)
    .eq('language_code', locale)

  if (translationsError) {
    console.error('Error fetching movie translations:', translationsError)
    // Continue without translations
  }

  // Create a map of translations by movie_id for easier lookup
  const translationsMap = new Map()
  if (translationsData) {
    translationsData.forEach(translation => {
      translationsMap.set(translation.movie_id, translation)
    })
  }

  // Transform the movies data to match the expected format
  const movies = (moviesData || []).map(movie => {
    // Get the translation for the current locale
    const translation = translationsMap.get(movie.id);
    
    return {
      id: movie.id,
      title: translation?.title || movie.slug,
      hebrew_title: translation?.title || movie.slug, // Using same title as fallback
      synopsis: translation?.synopsis || null,
      release_date: movie.release_date,
      duration: movie.duration,
      rating: movie.rating,
      poster_url: translation?.poster_url || null,
      trailer_url: translation?.trailer_url || null,
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
