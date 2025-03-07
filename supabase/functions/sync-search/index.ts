import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MeiliSearch } from 'https://esm.sh/meilisearch@0.35.0'

interface MovieTranslation {
  title: string
  synopsis: string | null
  poster_url: string | null
  trailer_url: string | null
  language_code: string
}

interface Movie {
  id: string
  slug: string
  release_date: string | null
  rating: number | null
  movie_translations: MovieTranslation[]
}

interface ActorTranslation {
  name: string
  biography: string | null
  language_code: string
}

interface Actor {
  id: string
  slug: string
  birth_date: string | null
  birth_place: string | null
  photo_url: string | null
  actor_translations: ActorTranslation[]
}

interface RequestPayload {
  type: 'movie' | 'actor'
  id: string
  action?: 'sync' | 'delete'
}

interface DenoEnv {
  get(key: string): string | undefined
}

declare const Deno: {
  env: DenoEnv
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MEILISEARCH_HOST = Deno.env.get('MEILISEARCH_HOST')!
const MEILISEARCH_ADMIN_KEY = Deno.env.get('MEILISEARCH_ADMIN_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const meilisearch = new MeiliSearch({
  host: `https://${MEILISEARCH_HOST}`,
  apiKey: MEILISEARCH_ADMIN_KEY,
})

async function syncMovie(movieId: string): Promise<void> {
  const { data: movie, error: movieError } = await supabase
    .from('movies')
    .select(`
      id,
      slug,
      release_date,
      rating,
      movie_translations (
        title,
        synopsis,
        poster_url,
        trailer_url,
        language_code
      )
    `)
    .eq('id', movieId)
    .single()

  if (movieError) {
    throw new Error(`Error fetching movie: ${movieError.message}`)
  }

  if (!movie || !movie.movie_translations) {
    throw new Error('No movie data found')
  }

  const searchDocuments = movie.movie_translations.map((translation: MovieTranslation) => ({
    id: `${movie.id}_${translation.language_code}`,
    movie_id: movie.id,
    slug: movie.slug,
    release_date: movie.release_date,
    rating: movie.rating,
    title: translation.title,
    synopsis: translation.synopsis,
    poster_url: translation.poster_url,
    trailer_url: translation.trailer_url,
    language_code: translation.language_code,
    type: 'movie',
  }))

  await meilisearch.index('movies').addDocuments(searchDocuments)
}

async function syncActor(actorId: string): Promise<void> {
  const { data: actor, error: actorError } = await supabase
    .from('actors')
    .select(`
      id,
      slug,
      birth_date,
      birth_place,
      photo_url,
      actor_translations (
        name,
        biography,
        language_code
      )
    `)
    .eq('id', actorId)
    .single()

  if (actorError) {
    throw new Error(`Error fetching actor: ${actorError.message}`)
  }

  if (!actor || !actor.actor_translations) {
    throw new Error('No actor data found')
  }

  const searchDocuments = actor.actor_translations.map((translation: ActorTranslation) => ({
    id: `${actor.id}_${translation.language_code}`,
    actor_id: actor.id,
    slug: actor.slug,
    birth_date: actor.birth_date,
    birth_place: actor.birth_place,
    photo_url: actor.photo_url,
    name: translation.name,
    biography: translation.biography,
    language_code: translation.language_code,
    type: 'actor',
  }))

  await meilisearch.index('actors').addDocuments(searchDocuments)
}

async function deleteMovie(movieId: string): Promise<void> {
  const { data: translations } = await supabase
    .from('movie_translations')
    .select('language_code')
    .eq('movie_id', movieId)

  if (translations) {
    const documentIds = translations.map((t: { language_code: string }) => `${movieId}_${t.language_code}`)
    await meilisearch.index('movies').deleteDocuments(documentIds)
  }
}

async function deleteActor(actorId: string): Promise<void> {
  const { data: translations } = await supabase
    .from('actor_translations')
    .select('language_code')
    .eq('actor_id', actorId)

  if (translations) {
    const documentIds = translations.map((t: { language_code: string }) => `${actorId}_${t.language_code}`)
    await meilisearch.index('actors').deleteDocuments(documentIds)
  }
}

serve(async (req: Request) => {
  try {
    const payload: RequestPayload = await req.json()
    const { type, id, action = 'sync' } = payload

    switch (action) {
      case 'sync':
        if (type === 'movie') {
          await syncMovie(id)
        } else if (type === 'actor') {
          await syncActor(id)
        }
        break
      
      case 'delete':
        if (type === 'movie') {
          await deleteMovie(id)
        } else if (type === 'actor') {
          await deleteActor(id)
        }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in sync-search function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
