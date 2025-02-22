'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SEO } from '@/components/seo'

interface Actor {
  id: string
  name: string
  hebrew_name: string | null
  biography: string | null
  birth_date: string | null
  birth_place: string | null
  photo_url: string | null
}

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  slug: string
  role: string
  release_date: string | null
}

interface MovieActorJoin {
  movie_id: string
  role: string
  movies: {
    id: string
    title: string
    hebrew_title: string | null
    release_date: string | null
    slug: string
  }
}

export default function ActorPage() {
  const { slug } = useParams()
  const [actor, setActor] = useState<Actor | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActor() {
      try {
        const { data: actorData, error: actorError } = await supabase
          .from('actors')
          .select('*')
          .eq('slug', slug)
          .single()

        if (actorError) throw actorError

        if (actorData) {
          setActor(actorData)
          
          const { data: moviesData, error: moviesError } = await supabase
            .from('movie_actors')
            .select(`
              movie_id,
              role,
              movies (
                id,
                title,
                hebrew_title,
                release_date,
                slug
              )
            `)
            .eq('actor_id', actorData.id)
            .order('movies(release_date)', { ascending: false })

          if (moviesError) throw moviesError

          if (moviesData) {
            setMovies(
              (moviesData as MovieActorJoin[]).map(item => ({
                id: item.movie_id,
                title: item.movies.title,
                hebrew_title: item.movies.hebrew_title,
                slug: item.movies.slug,
                role: item.role,
                release_date: item.movies.release_date
              }))
            )
          }
        }
      } catch (error) {
        console.error('Error fetching actor:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchActor()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-muted rounded w-3/4 mb-4" />
          <div className="h-6 bg-muted rounded w-1/2 mb-8" />
          <div className="aspect-square w-64 bg-muted rounded-full mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!actor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Actor Not Found</h1>
          <p className="text-muted-foreground">
            The actor you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title={actor.name}
        description={actor.biography || `Learn about ${actor.name}, Israeli actor and their filmography.`}
        ogImage={actor.photo_url || undefined}
        keywords={[
          'Israeli actors',
          'Israeli cinema',
          actor.name,
          actor.hebrew_name || '',
          'actor',
          'filmography'
        ]}
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          {actor.photo_url && (
            <img
              src={actor.photo_url}
              alt={actor.name}
              className="w-64 h-64 rounded-full mx-auto mb-6 object-cover"
            />
          )}
          <h1 className="text-4xl font-bold mb-2">{actor.name}</h1>
          {actor.hebrew_name && (
            <h2 className="text-2xl text-muted-foreground mb-4">
              {actor.hebrew_name}
            </h2>
          )}
          <div className="flex justify-center gap-x-6 text-sm text-muted-foreground">
            {actor.birth_date && (
              <div>Born: {new Date(actor.birth_date).toLocaleDateString()}</div>
            )}
            {actor.birth_place && <div>Place of Birth: {actor.birth_place}</div>}
          </div>
        </div>

        {actor.biography && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Biography</h3>
            <p className="text-lg leading-relaxed">{actor.biography}</p>
          </div>
        )}

        {movies.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Filmography</h3>
            <div className="space-y-4">
              {movies.map((movie) => (
                <div
                  key={`${movie.id}-${movie.role}`}
                  className="p-4 rounded-lg bg-card hover:bg-accent transition-colors"
                >
                  <Link href={`/movies/${movie.slug}`}>
                    <div className="font-medium">{movie.title}</div>
                    {movie.hebrew_title && (
                      <div className="text-sm text-muted-foreground">
                        {movie.hebrew_title}
                      </div>
                    )}
                    <div className="flex gap-x-4 text-sm text-muted-foreground mt-1">
                      <div>{movie.role}</div>
                      {movie.release_date && (
                        <div>
                          {new Date(movie.release_date).getFullYear()}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}