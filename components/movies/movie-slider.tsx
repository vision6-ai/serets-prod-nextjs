'use client'

import { Link } from 'app/i18n'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import type { Movie } from '@/types/movie'
import { Locale } from '@/config/i18n'

interface MovieSliderProps {
  movies: Movie[]
  locale?: Locale // Use the Locale type from config
  title?: string
  loading?: boolean
  viewAllHref?: string
}

export function MovieSlider({ movies, locale, title, loading, viewAllHref }: MovieSliderProps) {
  return (
    <div className="space-y-4">
      {/* Title and View All link */}
      {title && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          {viewAllHref && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={viewAllHref} className="flex items-center">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
      
      {/* Carousel */}
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full overflow-x-hidden"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {movies.map((movie) => (
            <CarouselItem
              key={movie.id}
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
            >
              <Link 
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
