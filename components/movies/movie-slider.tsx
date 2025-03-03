'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { WishlistButton } from './wishlist-button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useState } from 'react'

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
}

interface MovieSliderProps {
  title: string
  movies: Movie[]
  loading?: boolean
  viewAllHref?: string
}

export function MovieSlider({ title, movies, loading, viewAllHref }: MovieSliderProps) {
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({})

  const handleImageLoad = (movieId: string) => {
    setLoadedImages(prev => ({ ...prev, [movieId]: true }))
  }

  if (loading) {
    return (
      <section className="py-8">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-32 loading-skeleton" />
            <div className="h-8 w-24 loading-skeleton" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[2/3] loading-skeleton" />
                <div className="h-4 w-3/4 loading-skeleton" />
                <div className="h-4 w-1/2 loading-skeleton" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!movies?.length) {
    return null
  }

  return (
    <section className="py-8">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View All
            </Link>
          )}
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {movies.map((movie) => (
              <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5">
                <Card className="group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Link href={`/movies/${movie.slug}`} className="block">
                        <div className="aspect-[2/3] relative overflow-hidden bg-muted">
                          {movie.poster_url ? (
                            <>
                              <div className={`absolute inset-0 bg-muted ${loadedImages[movie.id] ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
                              <Image
                                src={movie.poster_url}
                                alt={movie.title}
                                fill
                                className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                                  loadedImages[movie.id] ? 'opacity-100' : 'opacity-0'
                                }`}
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                priority={false}
                                onLoad={() => handleImageLoad(movie.id)}
                                onError={(e) => {
                                  const img = e.currentTarget;
                                  img.src = `https://placehold.co/400x600/374151/FFFFFF?text=${encodeURIComponent(movie.title)}`;
                                }}
                              />
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4 text-center">
                              {movie.title}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                      </Link>
                      <div className="absolute top-2 right-2 z-10">
                        <WishlistButton
                          movieId={movie.id}
                          variant="secondary"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <Link href={`/movies/${movie.slug}`} className="block group-hover:text-primary transition-colors">
                        <h3 className="font-semibold mb-1 line-clamp-1">{movie.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                          {movie.rating && ` • ${movie.rating}/10`}
                        </p>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  )
}
