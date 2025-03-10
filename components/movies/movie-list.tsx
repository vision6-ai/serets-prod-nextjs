'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Movie } from '@/types/movie'

interface MovieListProps {
  movies: Movie[]
  locale?: string
}

export function MovieList({ movies, locale = '' }: MovieListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <Card key={movie.id} className="group overflow-hidden">
          <Link href={`/${locale}/movies/${movie.slug}`}>
            <CardContent className="p-0 relative aspect-[2/3]">
              <img
                src={movie.poster_url || '/placeholder-poster.jpg'}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-lg font-semibold mb-2 text-white">{movie.title}</h3>
                  {movie.hebrew_title && (
                    <p className="text-sm text-gray-300">{movie.hebrew_title}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}
