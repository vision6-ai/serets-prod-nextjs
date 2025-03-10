'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { MovieActions } from './movie-actions'
import { MovieSlider } from './movie-slider'
import { TicketBooking } from './ticket-booking'
import type { Movie } from '@/types/movie'
import { Locale } from '@/config/i18n'

interface MovieContentProps {
  movie: Movie & {
    poster_url: string | null
    backdrop_url: string | null
    trailer_url: string | null
  }
  videos: {
    id: string
    title: string | null
    url: string
    type: 'trailer' | 'clip' | 'featurette'
  }[]
  cast: {
    id: string
    name: string
    hebrew_name: string | null
    slug: string
    photo_url: string | null
    role: string | null
  }[]
  genres: {
    id: string
    name: string
    hebrew_name: string | null
    slug: string
  }[]
  awards: {
    id: string
    name: string
    category: string
    year: number
    is_winner: boolean
  }[]
  similarMovies: Movie[]
  locale: string
}

export function MovieContent({
  movie,
  videos,
  cast,
  genres,
  awards,
  similarMovies,
  locale
}: MovieContentProps) {
  const { user } = useAuth()
  const trailer = videos.find(v => v.type === 'trailer')
  const isRtl = locale === 'he'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Movie Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
            <img
              src={movie.poster_url || '/placeholder-poster.jpg'}
              alt={movie.title}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Movie Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
          {movie.hebrew_title && (
            <h2 className="text-2xl text-muted-foreground mb-6">
              {movie.hebrew_title}
            </h2>
          )}

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
            {movie.release_date && (
              <span>{new Date(movie.release_date).getFullYear()}</span>
            )}
            {movie.duration && <span>{movie.duration} minutes</span>}
            {movie.rating && <span>Rating: {movie.rating.toFixed(1)}</span>}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                  >
                    {locale === 'he' ? genre.hebrew_name : genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          {movie.synopsis && (
            <p className="mb-6 text-muted-foreground">{movie.synopsis}</p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <TicketBooking 
              movieId={movie.id}
              movieTitle={movie.title}
              posterUrl={movie.poster_url}
              isRtl={isRtl}
            />
            
            <MovieActions
              movieId={movie.id}
              trailerUrl={trailer?.url || movie.trailer_url}
            />
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {cast.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cast.map(actor => (
              <div key={actor.id} className="text-center">
                <div className="aspect-square rounded-full overflow-hidden mb-2">
                  <img
                    src={actor.photo_url || '/placeholder-avatar.jpg'}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium">{actor.name}</h3>
                {actor.hebrew_name && (
                  <p className="text-sm text-muted-foreground">
                    {actor.hebrew_name}
                  </p>
                )}
                {actor.role && (
                  <p className="text-sm text-muted-foreground">{actor.role}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Awards Section */}
      {awards.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Awards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {awards.map(award => (
              <div
                key={`${award.id}-${award.year}`}
                className="p-4 rounded-lg bg-card"
              >
                <h3 className="font-medium">{award.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {award.category} ({award.year})
                </p>
                {award.is_winner && (
                  <span className="inline-block px-2 py-1 mt-2 text-xs bg-primary/10 rounded-full">
                    Winner
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Similar Movies</h2>
          <MovieSlider movies={similarMovies} locale={locale as Locale} />
        </section>
      )}
    </div>
  )
}