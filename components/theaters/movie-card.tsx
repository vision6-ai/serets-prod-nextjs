'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/app/i18n'
import { Clock, Film, Star, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ShowtimeSelector } from './showtime-selector'
import { TheaterMovie, Movie } from '@/types/theater'
import { cn } from '@/lib/utils'

interface MovieCardProps {
  theaterMovie: TheaterMovie & { movies: Movie }
  selectedDate: string
  locale: 'en' | 'he'
}

export function MovieCard({ theaterMovie, selectedDate, locale }: MovieCardProps) {
  const movie = theaterMovie.movies
  const t = useTranslations('theaters')
  const isRtl = locale === 'he'
  const [loadedImage, setLoadedImage] = useState(false)
  
  // Filter showtimes for selected date
  const todayShowtimes = theaterMovie.showtimes.filter(
    showtime => showtime.date === selectedDate
  )

  return (
    <Card className="group overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <Link href={`/movies/${movie.slug}`} locale={locale} className="block">
            <div className="aspect-[2/3] relative overflow-hidden bg-muted">
              {movie.poster_url ? (
                <>
                  <div className={cn(
                    "absolute inset-0 bg-muted flex items-center justify-center transition-opacity duration-300",
                    loadedImage ? "opacity-0" : "opacity-100"
                  )}>
                    <span className="text-muted-foreground">{movie.title}</span>
                  </div>
                  <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    fill
                    className={cn(
                      "object-cover transition-all duration-300 group-hover:scale-105",
                      loadedImage ? "opacity-100" : "opacity-0"
                    )}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    priority={false}
                    onLoad={() => setLoadedImage(true)}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.src = `https://placehold.co/400x600/374151/FFFFFF?text=${encodeURIComponent(movie.title)}`;
                      setLoadedImage(true);
                    }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4 text-center">
                  {movie.title}
                </div>
              )}
            </div>
          </Link>

          {/* Rating badge */}
          {movie.rating && (
            <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm rounded-full px-2 py-1 text-white text-sm font-medium flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
          
          {/* Format badge */}
          <div className="absolute top-2 left-2 flex gap-1">
            {theaterMovie.format.map((format) => (
              <Badge 
                key={format}
                variant="secondary"
                className="bg-black/75 backdrop-blur-sm text-white"
              >
                {format}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="p-4">
          <Link 
            href={`/movies/${movie.slug}`} 
            locale={locale}
            className="block group-hover:text-primary transition-colors"
          >
            <h3 className="font-semibold mb-1 line-clamp-1">{movie.title}</h3>
            {movie.hebrew_title && (
              <h4 className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {movie.hebrew_title}
              </h4>
            )}
            <div className={cn(
              "flex items-center gap-4 text-sm text-muted-foreground",
              isRtl && "flex-row-reverse"
            )}>
              {movie.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{movie.duration} {t('minutes')}</span>
                </div>
              )}
              {movie.release_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              )}
            </div>
          </Link>

          {/* Showtimes */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">
              {t('showtimesFor')} {new Date(selectedDate).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}
            </h4>
            
            {todayShowtimes.length > 0 ? (
              <ShowtimeSelector 
                showtimes={todayShowtimes} 
                movieId={movie.id} 
                theaterId={theaterMovie.theater_id} 
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t('noShowtimesDate')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}