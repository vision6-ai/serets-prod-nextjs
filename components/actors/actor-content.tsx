'use client'

import Image from 'next/image'
import { Link } from '@/app/i18n'
import { Locale } from '@/config/i18n'

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

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
  synopsis?: string | null
  role: string
}

interface ActorContentProps {
  actor: Actor
  movies: Movie[]
  locale: Locale
}

export function ActorContent({ actor, movies, locale }: ActorContentProps) {
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
        {actor.hebrew_name && actor.hebrew_name !== actor.name && (
          <h2 className="text-2xl text-muted-foreground text-center mb-8">
            {actor.hebrew_name}
          </h2>
        )}
        
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-1">
            {actor.bio && (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Biography</h3>
                <p className="text-lg leading-relaxed">{actor.bio}</p>
              </div>
            )}
          </div>
          
          <div className="md:w-1/3">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Personal Info</h3>
              
              {actor.birth_date && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Born</h4>
                  <p>{new Date(actor.birth_date).toLocaleDateString()}</p>
                </div>
              )}
              
              {actor.birth_place && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Place of Birth</h4>
                  <p>{actor.birth_place}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground">Known For</h4>
                <p>Acting</p>
              </div>
            </div>
          </div>
        </div>

        {movies.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Filmography</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <div key={movie.id} className="group">
                  <Link href={`/movies/${movie.slug}`} locale={locale} className="block">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                      {movie.poster_url ? (
                        <Image
                          src={movie.poster_url}
                          alt={movie.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-muted flex items-center justify-center p-2 text-center">
                          <span className="text-muted-foreground text-sm">
                            {movie.title}
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      {movie.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {movie.role}
                      {movie.release_date && ` • ${new Date(movie.release_date).getFullYear()}`}
                    </p>
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