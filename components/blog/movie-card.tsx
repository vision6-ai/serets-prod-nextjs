'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { StarIcon, Clock, CalendarIcon, ExternalLinkIcon } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Locale } from '@/config/i18n'

interface MovieCardProps {
  locale: Locale
  movieId: string
  slug: string
  title: string
  posterUrl: string | null
  rating: number | null
  releaseDate: string | null
  genres: string[]
}

export function MovieCard({ 
  locale, 
  movieId,
  slug,
  title, 
  posterUrl, 
  rating, 
  releaseDate, 
  genres 
}: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Format release date
  const formattedDate = releaseDate 
    ? new Date(releaseDate).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="p-4">
          <h3 className="text-xl font-bold mb-2">About the Movie</h3>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            {posterUrl && (
              <div className="w-full md:w-1/3 flex-shrink-0">
                <div className="relative aspect-[2/3] overflow-hidden rounded-md">
                  <Image
                    src={posterUrl}
                    alt={title}
                    fill
                    className={`object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoadingComplete={() => setImageLoaded(true)}
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>
              </div>
            )}
            
            {/* Details */}
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-2">{title}</h4>
              
              <div className="space-y-2">
                {rating !== null && (
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-medium">{rating}/10</span>
                  </div>
                )}
                
                {formattedDate && (
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground mr-2" />
                    <span>{formattedDate}</span>
                  </div>
                )}
                
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {genres.map((genre, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <Button asChild className="w-full md:w-auto gap-2">
                    <Link href={`/${locale}/movies/${slug}`}>
                      View Movie Details
                      <ExternalLinkIcon className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 