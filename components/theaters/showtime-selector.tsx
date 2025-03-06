'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Showtime } from '@/types/theater'
import { cn } from '@/lib/utils'

interface ShowtimeSelectorProps {
  showtimes: Showtime[]
  movieId: string
  theaterId: string
}

export function ShowtimeSelector({ showtimes }: ShowtimeSelectorProps) {
  const locale = useLocale() as 'en' | 'he'
  const t = useTranslations('theaters')
  const isRtl = locale === 'he'

  // Function to determine button variant based on availability
  const getButtonVariant = (showtime: Showtime) => {
    const availability = showtime.available_seats / showtime.total_seats
    
    if (availability <= 0.1) {
      return 'destructive'
    } else if (availability <= 0.3) {
      return 'secondary'
    }
    
    return 'outline'
  }

  // Function to get availability status text for accessibility
  const getAvailabilityStatus = (showtime: Showtime) => {
    const availability = showtime.available_seats / showtime.total_seats
    
    if (availability <= 0.1) {
      return 'Almost sold out'
    } else if (availability <= 0.3) {
      return 'Limited availability'
    }
    
    return 'Available'
  }

  return (
    <div className="flex flex-wrap gap-2">
      {showtimes.map((showtime) => {
        const variant = getButtonVariant(showtime)
        const availabilityStatus = getAvailabilityStatus(showtime)
        
        return (
          <Button
            key={showtime.id}
            variant={variant}
            size="sm"
            className={cn(
              "min-w-[70px] showtime-button focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 touch-target",
              variant === 'destructive' && "showtime-button-soldout",
              variant === 'secondary' && "showtime-button-limited",
              variant === 'outline' && "showtime-button-available"
            )}
            aria-label={`${showtime.time} - ${availabilityStatus} - ${showtime.format}`}
          >
            {showtime.time}
          </Button>
        )
      })}
    </div>
  )
}
