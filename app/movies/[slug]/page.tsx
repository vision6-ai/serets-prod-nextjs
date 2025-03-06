import { MovieContent } from '../../../components/movies/movie-content'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { getMovieTranslations, getActorTranslations, getGenreTranslations } from '@/lib/translations'
import { Database } from '@/types/supabase-types'

export const revalidate = 3600

async function getMovieData(slug: string, locale: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get the movie from the base table
  const movieResult = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!movieResult.data) {
    return null
  }

  const movie = movieResult.data

  // Get movie translations
  const movieTranslations = await getMovieTranslations(
    supabase,
    movie.id,
    locale as any
  )

  // Combine movie data with translations
  const movieWithTranslations = {
    ...movie,
    title: movieTranslations.title || movie.title,
    hebrew_title: locale === 'he' ? movieTranslations.title : movie.hebrew_title,
    synopsis: movieTranslations.synopsis || movie.synopsis
  }

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
        actors!inner (id, slug, birth_date, birth_place, photo_url)
      `)
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_genres')
      .select(`
        genres!inner (id, slug)
      `)
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_awards')
      .select(`
        award_id,
        year,
        is_winner,
        awards!inner (id, category, year)
      `)
      .eq('movie_id', movie.id)
  ])

  // Get translations for actors, genres, and awards
  const castWithTranslations = await Promise.all(
    (castRes.data || []).map(async (c: any) => {
      const translations = await getActorTranslations(
        supabase,
        c.actor_id,
        locale as any
      )
      
      return {
        id: c.actor_id,
        name: translations.name || '',
        hebrew_name: locale === 'en' ? translations.name : null,
        slug: c.actors.slug,
        photo_url: c.actors.photo_url,
        role: c.role
      }
    })
  )

  const genresWithTranslations = await Promise.all(
    (genresRes.data || []).map(async (g: any) => {
      const translations = await getGenreTranslations(
        supabase,
        g.genres.id,
        locale as any
      )
      
      return {
        id: g.genres.id,
        name: translations.name || '',
        hebrew_name: locale === 'en' ? translations.name : null,
        slug: g.genres.slug
      }
    })
  )

  // Get genre IDs for similar movies query
  const genreIds = (genresRes.data || []).map((g: any) => g.genres.id)

  // Get similar movies using direct table queries
  const { data: similarMoviesData } = await supabase
    .from('movie_genres')
    .select('movie_id')
    .in('genre_id', genreIds)
    .neq('movie_id', movie.id)
    .order('movie_id', { ascending: false })
    .limit(6)

  // Get the actual movie data for similar movies
  const similarMovieIds = (similarMoviesData || []).map(item => item.movie_id)
  
  const { data: similarMoviesRaw } = await supabase
    .from('movies')
    .select('*')
    .in('id', similarMovieIds)
  
  // Get translations for similar movies
  const similarMoviesWithTranslations = await Promise.all(
    (similarMoviesRaw || []).map(async (m) => {
      const translations = await getMovieTranslations(
        supabase,
        m.id,
        locale as any
      )
      
      return {
        ...m,
        title: translations.title || m.title,
        hebrew_title: locale === 'he' ? translations.title : m.hebrew_title,
        synopsis: translations.synopsis || m.synopsis
      }
    })
  )

  // Remove duplicates
  const uniqueSimilarMovies = Array.from(
    new Map(
      similarMoviesWithTranslations.map(item => [item.id, item])
    ).values()
  ).slice(0, 6)

  return {
    movie: movieWithTranslations,
    videos: videosRes.data || [],
    cast: castWithTranslations,
    genres: genresWithTranslations,
    awards: awardsRes.data?.map((a: any) => ({
      id: a.awards.id,
      name: a.awards.name || '',
      category: a.awards.category,
      year: a.year,
      is_winner: a.is_winner
    })) || [],
    similarMovies: uniqueSimilarMovies
  }
}

export default async function MoviePage({ params }: { params: { slug: string } }) {
  // Get the locale from the URL or use default
  const locale = 'en' // This should be extracted from the URL in a real implementation
  
  const data = await getMovieData(params.slug, locale)

  if (!data) {
    notFound()
  }

  return <MovieContent {...data} locale={locale} />
}
