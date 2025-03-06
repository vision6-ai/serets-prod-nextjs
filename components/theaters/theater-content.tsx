'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/app/i18n'
import { MapPin, Phone, Globe, Calendar, Clock, Film, Info, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { TheaterSelector } from './theater-selector'
import { PromotionalBanner } from './promotional-banner'
import { FilterBar } from './filter-bar'
import { MovieCard } from './movie-card'
import { Theater, TheaterMovie, Movie } from '@/types/theater'
import { cn } from '@/lib/utils'

interface TheaterContentProps {
  theater: Theater
  currentMovies: (TheaterMovie & { movies: Movie })[]
  pastMovies: (TheaterMovie & { movies: Movie })[]
}

export function TheaterContent({ theater, currentMovies, pastMovies }: TheaterContentProps) {
  const locale = useLocale() as 'en' | 'he'
  const t = useTranslations('theaters')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [filteredMovies, setFilteredMovies] = useState(currentMovies)
  const isRtl = locale === 'he'

  // Apply filters
  useEffect(() => {
    let filtered = currentMovies

    // Filter by format
    if (selectedFormat !== 'all') {
      filtered = filtered.filter(movie => 
        movie.format.includes(selectedFormat)
      )
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(movie => 
        movie.movies.genres?.some(genre => genre.slug === selectedGenre)
      )
    }

    setFilteredMovies(filtered)
  }, [currentMovies, selectedFormat, selectedGenre])

  // Get unique formats and genres for filters
  const formats = Array.from(new Set(currentMovies.flatMap(movie => movie.format)))
  const genres = Array.from(
    new Set(
      currentMovies.flatMap(movie => 
        movie.movies.genres?.map(genre => ({ name: genre.name, slug: genre.slug })) || []
      )
    )
  )

  return (
    <div className="container mx-auto px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Theater Header */}
      <div className={cn(
        "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4",
        isRtl && "rtl-flex"
      )}>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{theater.name}</h1>
          <div className={cn(
            "flex items-center text-muted-foreground mt-2",
            isRtl && "flex-row-reverse"
          )}>
            <MapPin className={cn("h-4 w-4", isRtl ? "ml-1" : "mr-1")} />
            <span>{theater.location}</span>
          </div>
        </div>
        <TheaterSelector currentTheaterId={theater.id} />
      </div>

      {/* Promotional Banner */}
      <div className="mb-8">
        <PromotionalBanner theaterId={theater.id} />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="movies" className="space-y-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="movies" className="flex-1 md:flex-none">{t('nowShowing')}</TabsTrigger>
          <TabsTrigger value="info" className="flex-1 md:flex-none">{t('theaterInfo')}</TabsTrigger>
          <TabsTrigger value="past" className="flex-1 md:flex-none">{t('pastScreenings')}</TabsTrigger>
        </TabsList>

        {/* Now Showing Tab */}
        <TabsContent value="movies" className="space-y-6">
          {/* Filters */}
          <FilterBar
            formats={formats}
            genres={genres}
            selectedFormat={selectedFormat}
            selectedGenre={selectedGenre}
            onFormatChange={setSelectedFormat}
            onGenreChange={setSelectedGenre}
            onDateChange={setSelectedDate}
          />

          {/* Movies Grid */}
          {filteredMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t('noMoviesFilters')}
              </p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSelectedFormat('all')
                  setSelectedGenre('all')
                }}
              >
                {t('clearFilters')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMovies.map((theaterMovie) => (
                <MovieCard 
                  key={theaterMovie.id} 
                  theaterMovie={theaterMovie} 
                  selectedDate={selectedDate}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Theater Info Tab */}
        <TabsContent value="info">
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-3 gap-8",
            isRtl && "rtl-grid"
          )}>
            <div className="md:col-span-1">
              <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden mb-4">
                {theater.image_url ? (
                  <Image
                    src={theater.image_url}
                    alt={theater.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">{t('noImageAvailable')}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className={cn(
                  "flex items-center",
                  isRtl && "flex-row-reverse"
                )}>
                  <MapPin className={cn("h-5 w-5 text-muted-foreground", isRtl ? "ml-2" : "mr-2")} />
                  <p>{theater.address}</p>
                </div>
                <div className={cn(
                  "flex items-center",
                  isRtl && "flex-row-reverse"
                )}>
                  <Phone className={cn("h-5 w-5 text-muted-foreground", isRtl ? "ml-2" : "mr-2")} />
                  <p>{theater.phone}</p>
                </div>
                {theater.website && (
                  <div className={cn(
                    "flex items-center",
                    isRtl && "flex-row-reverse"
                  )}>
                    <Globe className={cn("h-5 w-5 text-muted-foreground", isRtl ? "ml-2" : "mr-2")} />
                    <a 
                      href={theater.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {theater.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">{t('about')} {theater.name}</h2>
              <p className="text-muted-foreground mb-6">{theater.description}</p>
              
              <h3 className="text-xl font-semibold mb-3">{t('amenities')}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {theater.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline">{amenity}</Badge>
                ))}
              </div>
              
              <Button asChild>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(theater.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('viewOnMap')}
                </a>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Past Screenings Tab */}
        <TabsContent value="past">
          {pastMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t('noPastScreenings')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pastMovies.map((theaterMovie) => (
                <Link
                  key={theaterMovie.id}
                  href={`/movies/${theaterMovie.movies.slug}`}
                  locale={locale}
                  className="block group"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                    {theaterMovie.movies.poster_url ? (
                      <Image
                        src={theaterMovie.movies.poster_url}
                        alt={theaterMovie.movies.title || theaterMovie.movies.slug}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center p-2 text-center">
                        <span className="text-muted-foreground text-sm">
                          {theaterMovie.movies.title || theaterMovie.movies.slug}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {theaterMovie.movies.title || theaterMovie.movies.slug}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}