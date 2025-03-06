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

async function getGenreData(slug: string): Promise<{ genre: Genre; movies: Movie[] } | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log('Fetching genre:', slug)

  // First get the genre
  const { data: genre, error: genreError } = await supabase
    .from('genres')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  console.log('Genre result:', { genre, error: genreError })

  if (genreError || !genre) {
    return null
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

  // Then get the movies
  const { data: moviesData, error: moviesError } = await supabase
    .from('movies')
    .select(`
      id,
      title,
      hebrew_title,
      synopsis,
      release_date,
      duration,
      rating,
      poster_url,
      slug
    `)
    .in('id', movieIds)

  console.log('Movies result:', { moviesData, error: moviesError })

  if (moviesError) {
    console.error('Error fetching movies:', moviesError)
    return null
  }

  // Transform the movies data
  const movies = (moviesData || []).map(movie => ({
    id: movie.id,
    title: movie.title,
    hebrew_title: movie.hebrew_title,
    synopsis: movie.synopsis,
    release_date: movie.release_date,
    duration: movie.duration,
    rating: movie.rating,
    poster_url: movie.poster_url || null,
    slug: movie.slug,
  }))

  console.log('Processed movies:', movies)

  return {
    genre: {
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
    },
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
  const data = await getGenreData(params.slug)

  if (!data) {
    notFound()
  }

  return <GenreContent initialData={data} params={params} />
}
