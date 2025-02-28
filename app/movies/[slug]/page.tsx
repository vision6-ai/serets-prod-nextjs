import { MovieContent } from '../../../components/movies/movie-content'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export const revalidate = 3600

async function getMovieData(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const movieResult = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!movieResult.data) {
    return null
  }

  const movie = movieResult.data

  const [videosRes, castRes, genresRes, awardsRes] = await Promise.all([
    supabase
      .from('movie_videos')
      .select('*')
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_actors')
      .select(`
        actor_id,
        role,
        actors (
          id,
          name,
          hebrew_name,
          slug,
          photo_url
        )
      `)
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_genres')
      .select(`
        genres (
          id,
          name,
          hebrew_name,
          slug
        )
      `)
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_awards')
      .select(`
        award_id,
        year,
        is_winner,
        awards (
          id,
          name,
          category
        )
      `)
      .eq('movie_id', movie.id)
  ])

  // Get genre IDs for similar movies query
  const genreIds = (genresRes.data || []).map((g: any) => g.genres.id)

  // Get similar movies using a direct join query
  const { data: similarMovies } = await supabase
    .from('movie_genres')
    .select(`
      movie_id,
      movies!inner (
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
    .in('genre_id', genreIds)
    .neq('movie_id', movie.id)
    .order('movie_id', { ascending: false })
    .limit(6)

  const uniqueSimilarMovies = Array.from(
    new Map(
      (similarMovies || []).map((item: any) => [item.movies.id, item.movies])
    ).values()
  ).slice(0, 6)

  return {
    movie,
    videos: videosRes.data || [],
    cast: castRes.data?.map((c: any) => ({
      id: c.actors.id,
      name: c.actors.name,
      hebrew_name: c.actors.hebrew_name,
      slug: c.actors.slug,
      photo_url: c.actors.photo_url,
      role: c.role
    })) || [],
    genres: genresRes.data?.map((g: any) => ({
      id: g.genres.id,
      name: g.genres.name,
      hebrew_name: g.genres.hebrew_name,
      slug: g.genres.slug
    })) || [],
    awards: awardsRes.data?.map((a: any) => ({
      id: a.awards.id,
      name: a.awards.name,
      category: a.awards.category,
      year: a.year,
      is_winner: a.is_winner
    })) || [],
    similarMovies: uniqueSimilarMovies
  }
}

export default async function MoviePage({ params }: { params: { slug: string } }) {
  const data = await getMovieData(params.slug)

  if (!data) {
    notFound()
  }

  return <MovieContent {...data} />
}
