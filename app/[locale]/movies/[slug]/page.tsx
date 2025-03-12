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
  movie_id: string;
}

interface GenreTranslation {
  name: string;
  language_code: string;
  genre_id: string;
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
  
  // Fetch the movie data
  const { data: movie, error: movieError } = await supabase
    .from('movies')
    .select('id, slug, release_date, duration, rating, bigger_movie_id')
    .eq('slug', slug)
    .single()

  if (movieError || !movie) {
    console.error('Error fetching movie:', movieError)
    return null
  }

  // Store the bigger_movie_id
  const biggerMovieId = movie.bigger_movie_id
  console.log('Fetched bigger_movie_id:', biggerMovieId)

  // Continue with fetching translations and other data
  const { data: translations, error: translationError } = await supabase
    .from('movie_translations')
    .select('title, synopsis, poster_url, trailer_url, language_code')
    .eq('movie_id', movie.id)
    .eq('language_code', locale)

  if (translationError || !translations) {
    console.error('Error fetching translations:', translationError)
    return null
  }

  // Extract translation data
  const translation = translations && translations.length > 0 
    ? translations[0] as MovieTranslation
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

  // Fetch additional data in parallel
  const [videosRes, castRes, movieGenresRes, awardsRes] = await Promise.all([
    supabase
      .from('movie_videos')
      .select('*')
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_actors')
      .select('movie_id, actor_id, role')
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_genres')
      .select('id, genre_id')
      .eq('movie_id', movie.id),
    
    supabase
      .from('movie_awards')
      .select('id, year, award_id, category, is_winner')
      .eq('movie_id', movie.id)
      .order('year', { ascending: false })
  ])

  // Fetch actors data
  const actorIds = (castRes.data || []).map(item => item.actor_id)
  const { data: actorsData } = await supabase
    .from('actors')
    .select('id, slug, birth_date, birth_place, photo_url')
    .in('id', actorIds)

  // Create a map of actors
  const actorsMap = new Map()
  actorsData?.forEach(actor => {
    actorsMap.set(actor.id, actor)
  })

  // Fetch actor translations
  const { data: actorTranslations } = await supabase
    .from('actor_translations')
    .select('actor_id, name, language_code')
    .in('actor_id', actorIds)
    .eq('language_code', locale)

  // Create a map of actor translations
  const actorTranslationsMap = new Map()
  actorTranslations?.forEach(translation => {
    actorTranslationsMap.set(translation.actor_id, translation)
  })

  // Process cast data
  const cast = (castRes.data || []).map(castMember => {
    const actorData = actorsMap.get(castMember.actor_id)
    const actorTranslation = actorTranslationsMap.get(castMember.actor_id)

    if (!actorData) return null

    return {
      id: castMember.actor_id,
      role: castMember.role,
      character_name: null, // This field doesn't exist in movie_actors
      actor: {
        id: actorData.id,
        name: actorTranslation?.name || actorData.slug,
        slug: actorData.slug,
        birth_date: actorData.birth_date,
        birth_place: actorData.birth_place,
        photo_url: actorData.photo_url
      }
    }
  }).filter(Boolean)

  // Fetch genres data
  const genreIds = (movieGenresRes.data || []).map(item => item.genre_id)
  const { data: genresData } = await supabase
    .from('genres')
    .select('id, slug')
    .in('id', genreIds)

  // Create a map of genres
  const genresMap = new Map()
  genresData?.forEach(genre => {
    genresMap.set(genre.id, genre)
  })

  // Fetch genre translations
  const { data: genreTranslations } = await supabase
    .from('genre_translations')
    .select('genre_id, name, language_code')
    .in('genre_id', genreIds)
    .eq('language_code', locale)

  // Create a map of genre translations
  const genreTranslationsMap = new Map()
  genreTranslations?.forEach(translation => {
    genreTranslationsMap.set(translation.genre_id, translation)
  })

  // Process genres data
  const genres = (movieGenresRes.data || []).map(genreData => {
    const genre = genresMap.get(genreData.genre_id)
    const genreTranslation = genreTranslationsMap.get(genreData.genre_id)

    if (!genre) return null

    return {
      id: genreData.id,
      genre: {
        id: genre.id,
        name: genreTranslation?.name || genre.slug,
        slug: genre.slug
      }
    }
  }).filter(Boolean)

  // Fetch awards data
  const awardIds = (awardsRes.data || []).map(item => item.award_id)
  const { data: awardsData } = await supabase
    .from('awards')
    .select('id, name, hebrew_name')
    .in('id', awardIds)

  // Create a map of awards
  const awardsMap = new Map()
  awardsData?.forEach(award => {
    awardsMap.set(award.id, award)
  })

  // Process awards data
  const awards = (awardsRes.data || []).map(award => {
    const awardInfo = awardsMap.get(award.award_id)

    if (!awardInfo) return null

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
    biggerMovieId={data.bigger_movie_id}
  />
}
