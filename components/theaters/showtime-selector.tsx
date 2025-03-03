'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Showtime } from '@/types/theater'
import { cn } from '@/lib/utils'

interface ShowtimeSelectorProps {
  showtimes: Showtime[]
  movieId: string
  theaterId: string
}

export function ShowtimeSelector({ showtimes, movieId, theaterId }: ShowtimeSelectorProps) {
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const locale = useLocale() as 'en' | 'he'
  const t = useTranslations('theaters')
  const isRtl = locale === 'he'

  const handleShowtimeSelect = (showtime: Showtime) => {
    setSelectedShowtime(showtime)
    setIsDialogOpen(true)
  }

  const handleBooking = () => {
    if (selectedShowtime) {
      router.push(`/booking?theater=${theaterId}&movie=${movieId}&showtime=${selectedShowtime.id}`)
    }
    setIsDialogOpen(false)
  }

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
    <>
      <div className="flex flex-wrap gap-2">
        {showtimes.map((showtime) => {
          const variant = getButtonVariant(showtime)
          const availabilityStatus = getAvailabilityStatus(showtime)
          
          return (
            <Button
              key={showtime.id}
              variant={variant}
              size="sm"
              onClick={() => handleShowtimeSelect(showtime)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={isRtl ? "rtl-text" : ""}>
          <DialogHeader>
            <DialogTitle>{t('confirmBooking')}</DialogTitle>
            <DialogDescription>
              {t('bookingDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedShowtime && (
            <div className="py-4">
              <div className={cn(
                "grid grid-cols-2 gap-2 text-sm",
                isRtl && "text-right"
              )}>
                <div className="text-muted-foreground">{t('date')}:</div>
                <div>{new Date(selectedShowtime.date).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}</div>
                
                <div className="text-muted-foreground">{t('time')}:</div>
                <div>{selectedShowtime.time}</div>
                
                <div className="text-muted-foreground">{t('hall')}:</div>
                <div>{selectedShowtime.hall}</div>
                
                <div className="text-muted-foreground">{t('format')}:</div>
                <div>{selectedShowtime.format}</div>
                
                <div className="text-muted-foreground">{t('price')}:</div>
                <div>${selectedShowtime.price.toFixed(2)}</div>
                
                <div className="text-muted-foreground">{t('availableSeats')}:</div>
                <div>{selectedShowtime.available_seats} {t('of')} {selectedShowtime.total_seats}</div>
              </div>
            </div>
          )}
          
          <DialogFooter className={isRtl ? "flex-row-reverse" : ""}>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleBooking} className="min-h-11 touch-target">
              {t('continueToBooking')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}