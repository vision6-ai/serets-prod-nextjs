'use client'

import { Link } from 'app/i18n'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from 'components/ui/carousel'
import { Card, CardContent } from 'components/ui/card'
import type { Movie } from '@/types/movie'

interface MovieSliderProps {
  movies: Movie[]
  locale: string
  title?: string
  loading?: boolean
  viewAllHref?: string
}

export function MovieSlider({ movies, locale, title, loading, viewAllHref }: MovieSliderProps) {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {movies.map((movie) => (
          <CarouselItem
            key={movie.id}
            className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
          >
            <Card className="group overflow-hidden">
              {/* Don't prepend locale here since Link component handles localization */}
              <Link href={`/movies/${movie.slug}`}>
                <CardContent className="p-0 relative aspect-[2/3]">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="text-center p-4">
                      <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                      {movie.hebrew_title && (
                        <p className="text-sm text-gray-300">{movie.hebrew_title}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
