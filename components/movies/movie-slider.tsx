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
              <Link href={viewAllHref} locale={locale} className="flex items-center">
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
              <Card className="group overflow-hidden">
                <Link href={`/movies/${movie.slug}`} locale={locale}>
                  <CardContent className="p-0 relative aspect-[2/3]">
                    <img
                      src={movie.poster_url || '/placeholder-poster.jpg'}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="text-center p-4">
                        <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                        {movie.hebrew_title && movie.hebrew_title !== movie.title && (
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
    </div>
  )
}
