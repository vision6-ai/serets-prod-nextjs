'use client'

import { useState } from 'react'
import { Link } from '@/app/i18n'
import { useLocale, useTranslations } from 'next-intl'
import { MapPin, Star, Film, ParkingMeter as Parking, Armchair as Wheelchair, CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TheaterImage } from '@/components/optimized-image'
import { cn } from '@/lib/utils'

interface TheaterCardProps {
  theater: {
    id: string
    name: string
    slug: string
    location: string
    address: string
    amenities: string[]
    image_url: string | null
    rating?: number
    distance?: number
  }
}

const amenityIcons: Record<string, any> = {
  'IMAX': Film,
  'Parking': Parking,
  'Accessible': Wheelchair,
  'Credit Cards': CreditCard
}

export function TheaterCard({ theater }: TheaterCardProps) {
  const locale = useLocale() as 'en' | 'he'
  const t = useTranslations('theaters')
  const isRtl = locale === 'he'
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card 
      className={cn(
        "group overflow-hidden h-full transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/theaters/${theater.slug}`} locale={locale}>
        {/* Theater Image - Fixed 16:9 aspect ratio */}
        <div className="relative aspect-video overflow-hidden">
          <TheaterImage
            src={theater.image_url}
            alt={theater.name}
            aspectRatio="16/9"
            className={cn(
              "w-full h-full transition-transform duration-300",
              isHovered && "scale-105"
            )}
          />
          
          {/* Rating badge */}
          {theater.rating && (
            <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm rounded-full px-2 py-1 text-white text-sm font-medium flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{theater.rating.toFixed(1)}</span>
            </div>
          )}
          
          {/* Distance badge */}
          {theater.distance && (
            <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm rounded-full px-2 py-1 text-white text-sm font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{theater.distance.toFixed(1)} km</span>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Theater Name & Location */}
          <div>
            <h2 className="text-xl font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {theater.name}
            </h2>
            <div className={cn(
              "flex items-center text-muted-foreground",
              isRtl && "flex-row-reverse"
            )}>
              <MapPin className={cn("h-4 w-4 flex-shrink-0", isRtl ? "ml-1" : "mr-1")} />
              <span className="line-clamp-1">{theater.location}</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
            {theater.amenities.slice(0, 4).map((amenity) => {
              const IconComponent = amenityIcons[amenity] || Film
              return (
                <Badge 
                  key={amenity} 
                  variant="secondary"
                  className="flex items-center gap-1 py-1"
                >
                  <IconComponent className="w-3 h-3" />
                  <span className="text-xs">{amenity}</span>
                </Badge>
              )
            })}
          </div>

          {/* View Theater Button */}
          <Button 
            className={cn(
              "w-full mt-2 h-11",
              "touch-target",
              isRtl && "flex-row-reverse"
            )}
          >
            {t('viewTheater')}
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
}