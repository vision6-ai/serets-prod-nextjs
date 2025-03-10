import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { ActorContent } from '@/components/actors/actor-content'
import { getMovieTranslations, getActorTranslations } from '@/lib/translations'
import { Database } from '@/types/supabase-types'
import { Locale } from '@/config/i18n'
import { unstable_setRequestLocale } from 'next-intl/server'

export const revalidate = 3600

// Define types for the data structure
interface Actor {
  id: string
  name: string
  hebrew_name: string | null
  bio: string | null
  photo_url: string | null
  slug: string
  birth_date?: string | null
  birth_place?: string | null
}

interface MovieData {
  id: string
  title: string
  hebrew_title: string | null
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
  synopsis?: string | null
}

interface MovieTranslation {
  title: string;
  synopsis: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  language_code: string;
}

interface MovieActorJoin {
  role: string
  movie_id: string
}

interface MovieWithRole extends MovieData {
  role: string
}

async function getActorData(slug: string, locale: Locale) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get actor with translations
  const { data: actorData, error: actorError } = await supabase
    .from('actors')
    .select(`
      id,
      slug,
      birth_date,
      birth_place,
      photo_url,
      translations:actor_translations!inner(
        name,
        biography,
        language_code
      )
    `)
    .eq('slug', slug)
    .eq('translations.language_code', locale)
    .single()

  if (actorError || !actorData) {
    console.error('Error fetching actor:', actorError)
    return null
  }

  // Extract translation data
  const translation = actorData.translations && actorData.translations.length > 0 
    ? actorData.translations[0]
    : null

  // Combine actor data with translations
  const actor = {
    id: actorData.id,
    slug: actorData.slug,
    name: translation?.name || actorData.slug,
    hebrew_name: translation?.name || actorData.slug, // Using same name as fallback
    bio: translation?.biography || null,
    photo_url: actorData.photo_url,
    birth_date: actorData.birth_date,
    birth_place: actorData.birth_place
  }

  // Get movies this actor has been in
  const { data: movieActors, error: movieActorsError } = await supabase
    .from('movie_actors')
    .select(`
      role,
      movie_id
    `)
    .eq('actor_id', actor.id)

  if (movieActorsError) {
    console.error('Error fetching movie actors:', movieActorsError)
    return { actor, movies: [] }
  }

  // Get the actual movies with translations
  const movieIds = movieActors?.map(ma => ma.movie_id) || []
  
  if (movieIds.length === 0) {
    return { actor, movies: [] }
  }

  const { data: moviesData, error: moviesError } = await supabase
    .from('movies')
    .select(`
      id,
      slug,
      release_date,
      rating,
      translations:movie_translations!inner(
        title,
        synopsis,
        poster_url,
        language_code
      )
    `)
    .in('id', movieIds)
    .eq('translations.language_code', locale)

  if (moviesError) {
    console.error('Error fetching movies:', moviesError)
    return { actor, movies: [] }
  }

  // Create a map of movie IDs to roles
  const movieRoles: Record<string, string> = {}
  movieActors?.forEach(ma => {
    movieRoles[ma.movie_id] = ma.role
  })

  // Transform the movies data and add roles
  const movies = moviesData?.map(movie => {
    // Get the translation for the current locale
    const translation = movie.translations && movie.translations.length > 0 
      ? movie.translations[0] as MovieTranslation
      : null
    
    return {
      id: movie.id,
      title: translation?.title || movie.slug,
      hebrew_title: translation?.title || movie.slug, // Using same title as fallback
      synopsis: translation?.synopsis || null,
      release_date: movie.release_date,
      rating: movie.rating,
      poster_url: translation?.poster_url || null,
      slug: movie.slug,
      role: movieRoles[movie.id] || 'Actor'
    }
  }) || []

  return { actor, movies }
}

export default async function ActorPage({ params }: { params: { slug: string; locale: Locale } }) {
  // This is critical for server components to work with next-intl
  unstable_setRequestLocale(params.locale)
  
  const data = await getActorData(params.slug, params.locale)

  if (!data) {
    notFound()
  }

  return <ActorContent actor={data.actor} movies={data.movies} locale={params.locale} />
}
