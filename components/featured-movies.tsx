'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
}

export function FeaturedMovies() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  })

  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  useEffect(() => {
    async function fetchMovies() {
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('id, title, hebrew_title, release_date, poster_url, rating, slug')
          .order('release_date', { ascending: false })
        
        if (error) throw error
        console.log('Fetched featured movies:', data) // Debug log
        setMovies(data || [])
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Featured Movies</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="hidden md:flex"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous movies</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="hidden md:flex"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next movies</span>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/movies">View All</Link>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {loading ? (
            // Loading skeleton
            Array(4).fill(null).map((_, i) => (
              <div key={i} className="min-w-[280px] max-w-[280px] pl-4">
                <Card className="animate-pulse loading-shimmer">
                  <CardContent className="p-4">
                    <div className="aspect-[2/3] bg-muted rounded-md mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            // Actual movie cards
            movies.map((movie) => (
              <div key={movie.id} className="min-w-[280px] max-w-[280px] pl-4">
                <Card className="hover-card h-full">
                  <Link href={`/movies/${movie.slug}`}>
                    <CardContent className="p-4 hover:bg-accent/5 transition-colors h-full flex flex-col">
                      {movie.poster_url ? (
                        <img
                         src={movie.poster_url}
                          alt={movie.title}
                          className="aspect-[2/3] object-cover rounded-md mb-4 bg-muted w-full"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.src = `https://placehold.co/400x600/374151/FFFFFF?text=${encodeURIComponent(movie.title)}`;
                            img.onerror = null; // Prevent infinite loop
                          }}
                        />
                      ) : (
                        <div className="aspect-[2/3] bg-muted rounded-md mb-4 flex items-center justify-center text-muted-foreground w-full">
                          {movie.title}
                        </div>
                      )}
                      <div className="flex-grow">
                        <h3 className="font-semibold mb-1 line-clamp-2 h-12">
                          {movie.title}
                        </h3>
                      {movie.hebrew_title && (
                        <h4 className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {movie.hebrew_title}
                        </h4>
                      )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {movie.release_date
                          ? new Date(movie.release_date).getFullYear()
                          : 'TBA'}
                        {movie.rating && ` • ${movie.rating}/10`}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}