'use client'

import { Link } from '@/app/i18n'
import type { Movie } from '@/types/movie'
import { Locale } from '@/config/i18n'

interface MovieListProps {
  movies: Movie[]
  locale?: Locale
}

export function MovieList({ movies, locale = 'en' }: MovieListProps) {
  console.log('Movies in MovieList:', movies.map(m => ({
    id: m.id,
    title: m.title,
    poster_url: m.poster_url,
    slug: m.slug
  })));
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => {
        console.log(`Movie ${movie.id} poster_url:`, movie.poster_url);
        
        return (
          <Link 
            key={movie.id}
            href={`/movies/${movie.slug}`} 
            locale={locale}
            className="group block overflow-hidden rounded-lg transition-all hover:scale-105"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="object-cover w-full h-full transition-all"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground">{movie.title}</span>
                </div>
              )}
            </div>
            <div className="space-y-1 p-2">
              <h3 className="font-semibold leading-none">
                {movie.title}
              </h3>
              {movie.release_date && (
                <p className="text-sm text-muted-foreground">
                  {new Date(movie.release_date).getFullYear()}
                </p>
              )}
              {movie.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {movie.rating.toFixed(1)}
                  </span>
                  <svg
                    className="h-4 w-4 fill-current text-yellow-400"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
