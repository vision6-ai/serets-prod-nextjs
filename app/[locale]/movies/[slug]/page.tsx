import { MovieContent } from '@/components/movies/movie-content'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { getActorTranslations, getGenreTranslations } from '@/lib/translations'
import { Database } from '@/types/supabase-types'
import { Locale } from '@/config/i18n'
import { unstable_setRequestLocale } from 'next-intl/server'
import type { Movie } from '@/types/movie'

export const revalidate = 3600

// Define types for the data structure
interface MovieTranslation {
  title: string;
  synopsis: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  language_code: string;
}

interface GenreTranslation {
  name: string;
  language_code: string;
}

interface Actor {
  id: string;
  slug: string;
  birth_date: string | null;
  birth_place: string | null;
  photo_url: string | null;
}

interface Genre {
  id: string;
  slug: string;
  translations: GenreTranslation[];
}

interface Award {
  id: string;
  name: string;
  hebrew_name: string | null;
}

async function getMovieData(slug: string, locale: Locale) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get the movie with its translations
  const { data: movie, error: movieError } = await supabase
    .from('movies')
    .select(`
      id,
      slug,
      release_date,
      duration,
      rating,
      translations:movie_translations!inner(
        title,
        synopsis,
        poster_url,
        trailer_url,
        language_code
      )
    `)
    .eq('slug', slug)
    .eq('translations.language_code', locale)
    .single()

  if (movieError || !movie) {
    console.error('Error fetching movie:', movieError)
    return null
  }

  // Extract translation data
  const translation = movie.translations && movie.translations.length > 0 
    ? movie.translations[0] as MovieTranslation
    : null

  // Combine movie data with translations
  const movieWithTranslations = {
    id: movie.id,
    slug: movie.slug,
    release_date: movie.release_date,
    duration: movie.duration,
    rating: movie.rating,
    title: translation?.title || movie.slug,
    hebrew_title: translation?.title || movie.slug, // Using same title as fallback
    synopsis: translation?.synopsis || null,
    poster_url: translation?.poster_url || null,
    backdrop_url: null, // Required by MovieContent but not in our data
    trailer_url: translation?.trailer_url || null
  } as Movie & {
    poster_url: string | null;
    backdrop_url: string | null;
    trailer_url: string | null;
  };

  const [videosRes, castRes, genresRes, awardsRes] = await Promise.all([
    supabase
      .from('movie_videos')
      .select('*')
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_actors')
      .select(`
        movie_id,
        actor_id,
        role,
        actors (
          id,
          slug,
          birth_date,
          birth_place,
          photo_url
        )
      `)
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_genres')
      .select(`
        id,
        genre_id,
        genres (
          id,
          slug,
          translations:genre_translations(
            name,
            language_code
          )
        )
      `)
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_awards')
      .select(`
        id,
        year,
        award_id,
        category,
        is_winner,
        awards (
          id,
          name,
          hebrew_name
        )
      `)
      .eq('movie_id', movie.id)
      .order('year', { ascending: false })
  ])

  // Process cast data
  const cast = await Promise.all((castRes.data || []).map(async (castMember) => {
    if (!castMember.actors) return null

    const actorData = Array.isArray(castMember.actors) 
      ? castMember.actors[0] as unknown as Actor 
      : castMember.actors as Actor

    const actorTranslations = await getActorTranslations(
      supabase,
      castMember.actor_id,
      locale
    )

    return {
      id: castMember.actor_id, // Use actor_id as the id
      role: castMember.role,
      character_name: null, // This field doesn't exist in movie_actors
      actor: {
        id: actorData.id,
        name: actorTranslations.name || '',
        slug: actorData.slug,
        birth_date: actorData.birth_date,
        birth_place: actorData.birth_place,
        photo_url: actorData.photo_url
      }
    }
  }))

  // Process genres data
  const genres = (genresRes.data || []).map((genreData) => {
    if (!genreData.genres) return null

    const genreInfo = Array.isArray(genreData.genres)
      ? genreData.genres[0] as unknown as Genre
      : genreData.genres as Genre

    // Extract genre translation for current locale
    const genreTranslation = genreInfo.translations && 
                            genreInfo.translations.length > 0 ? 
                            genreInfo.translations.find((t: GenreTranslation) => t.language_code === locale) : 
                            null

    return {
      id: genreData.id,
      genre: {
        id: genreInfo.id,
        name: genreTranslation?.name || genreInfo.slug,
        slug: genreInfo.slug
      }
    }
  }).filter(Boolean)

  // Process awards data
  const awards = (awardsRes.data || []).map((award) => {
    if (!award.awards) return null

    const awardInfo = Array.isArray(award.awards)
      ? award.awards[0] as unknown as Award
      : award.awards as Award

    return {
      id: award.id,
      year: award.year,
      category: award.category,
      is_winner: award.is_winner,
      award: {
        id: awardInfo.id,
        name: locale === 'he' && awardInfo.hebrew_name ? awardInfo.hebrew_name : awardInfo.name
      }
    }
  }).filter(Boolean)

  // For now, we don't have similar movies
  const similarMovies: Movie[] = [];

  return {
    movie: movieWithTranslations,
    videos: videosRes.data || [],
    cast: cast.filter(Boolean).map(item => ({
      id: item!.id,
      name: item!.actor.name,
      hebrew_name: null, // We don't have this field yet
      slug: item!.actor.slug,
      photo_url: item!.actor.photo_url,
      role: item!.role
    })),
    genres: genres.filter(Boolean).map(item => ({
      id: item!.id,
      name: item!.genre.name,
      hebrew_name: null, // We don't have this field yet
      slug: item!.genre.slug
    })),
    awards: awards.filter(Boolean).map(item => ({
      id: item!.id,
      name: item!.award.name,
      category: item!.category,
      year: Number(item!.year),
      is_winner: Boolean(item!.is_winner)
    })),
    similarMovies
  }
}

export default async function MoviePage({ params }: { params: { slug: string, locale: Locale } }) {
  // This is critical for server components to work with next-intl
  unstable_setRequestLocale(params.locale)
  
  const data = await getMovieData(params.slug, params.locale)

  if (!data) {
    notFound()
  }

  // Pass all props directly to MovieContent
  return <MovieContent 
    movie={data.movie} 
    videos={data.videos} 
    cast={data.cast} 
    genres={data.genres} 
    awards={data.awards}
    similarMovies={data.similarMovies}
    locale={params.locale} 
  />
}
