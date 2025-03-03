import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

interface Actor {
  id: string
  name: string
  hebrew_name: string | null
  bio: string | null
  photo_url: string | null
  slug: string
}

interface MovieData {
  id: string
  title: string
  hebrew_title: string | null
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
}

interface MovieActorJoin {
  role: string
  movies: MovieData
}

interface MovieWithRole extends MovieData {
  role: string
}

export const revalidate = 3600

async function getActorData(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: actor } = await supabase
    .from('actors')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!actor) {
    return null
  }

  const { data: movieActors } = await supabase
    .from('movie_actors')
    .select(`
      role,
      movies (
        id,
        title,
        hebrew_title,
        release_date,
        poster_url,
        rating,
        slug
      )
    `)
    .eq('actor_id', actor.id)

  const typedMovieActors = (movieActors || []) as unknown as { 
    role: string; 
    movies: MovieData;
  }[]

  const movies: MovieWithRole[] = typedMovieActors.map(m => ({
    ...m.movies,
    role: m.role
  }))

  return {
    actor: actor as Actor,
    movies
  }
}

export default async function ActorPage({ params }: { params: { slug: string } }) {
  const data = await getActorData(params.slug)

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Actor Not Found</h1>
        <p className="text-muted-foreground">
          The actor you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
      </div>
    )
  }

  const { actor, movies } = data

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {actor.photo_url && (
          <Image
            src={actor.photo_url}
            alt={actor.name}
            className="w-64 h-64 rounded-full mx-auto mb-6 object-cover"
            width={256}
            height={256}
          />
        )}
        <h1 className="text-4xl font-bold text-center mb-2">{actor.name}</h1>
        {actor.hebrew_name && (
          <h2 className="text-2xl text-muted-foreground text-center mb-8">
            {actor.hebrew_name}
          </h2>
        )}
        
        {actor.bio && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-4">Biography</h3>
            <p className="text-lg leading-relaxed">{actor.bio}</p>
          </div>
        )}

        {movies.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Filmography</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {movies.map((movie) => (
                <div key={movie.id} className="group">
                  <a href={`/movies/${movie.slug}`} className="block">
                    {movie.poster_url ? (
                      <Image
                        src={movie.poster_url}
                        alt={movie.title}
                        width={300}
                        height={450}
                        className="rounded-lg shadow-md transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                        {movie.title}
                      </div>
                    )}
                    <h4 className="mt-2 font-medium group-hover:text-primary transition-colors">
                      {movie.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {movie.role}
                      {movie.release_date && ` • ${new Date(movie.release_date).getFullYear()}`}
                    </p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
