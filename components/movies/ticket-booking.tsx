'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Ticket } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Theater {
  id: string
  name: string
  location: string
  bigger_id: string
}

interface ShowTime {
  id: string
  time: string
  available_seats: number
}

interface TicketBookingProps {
  movieId: string
  movieTitle: string
  posterUrl: string | null
  isRtl?: boolean
  biggerMovieId: string
}

export function TicketBooking({ movieId, movieTitle, posterUrl, isRtl = false, biggerMovieId }: TicketBookingProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'theater' | 'date' | 'time' | 'seats'>('theater')
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<ShowTime | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [theaters, setTheaters] = useState<Theater[]>([])
  
  // Type assertion for the translation function
  const t = useTranslations('booking') as (key: string) => string

  useEffect(() => {
    // Fetch theaters data from Supabase
    const fetchTheaters = async () => {
      const { data, error } = await supabase
        .from('theaters')
        .select('id, name, location, bigger_id')

      if (error) {
        console.error('Error fetching theaters:', error)
      } else {
        setTheaters(data || [])
      }
    }

    fetchTheaters()
  }, [])

  // Mock data - replace with real data from API
  const showTimes: ShowTime[] = [
    { id: '1', time: '10:00', available_seats: 45 },
    { id: '2', time: '13:30', available_seats: 32 },
    { id: '3', time: '16:45', available_seats: 28 },
    { id: '4', time: '20:00', available_seats: 50 },
    { id: '5', time: '22:30', available_seats: 15 },
  ]

  // Generate next 7 days for date selection
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEEE, MMMM d')
    }
  })

  const handleBooking = () => {
    // Handle booking logic here
    console.log('Booking:', {
      movieId,
      theater: selectedTheater,
      date: selectedDate,
      time: selectedTime
    })
  }

  // Use biggerMovieId as needed
  console.log('Bigger Movie ID:', biggerMovieId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className={cn(
            "w-full md:w-auto text-lg gap-2 h-12",
            "transition-all duration-200 hover:scale-105",
            "shadow-lg hover:shadow-xl"
          )}
        >
          <Ticket className="w-5 h-5" />
          {t('orderTickets')}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </DialogClose>
            <DialogTitle className="text-xl">{movieTitle}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-[150px,1fr] gap-6 pt-4">
          {/* Movie Poster */}
          <div className="hidden md:block">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-muted">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={movieTitle}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-muted-foreground">
                  <span>{movieTitle}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            {/* Theater Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">
                {t('selectTheater')}
              </label>
              <Select value={selectedTheater?.id} onValueChange={(value) => setSelectedTheater(theaters.find(t => t.id === value) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('chooseTheater')} />
                </SelectTrigger>
                <SelectContent>
                  {theaters.map(theater => (
                    <SelectItem key={theater.id} value={theater.id}>
                      <div>
                        <div className="font-medium">{theater.name}</div>
                        <div className="text-sm text-muted-foreground">{theater.location}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">
                {t('selectDate')}
              </label>
              <Select value={selectedDate?.toISOString().split('T')[0]} onValueChange={(value) => setSelectedDate(new Date(value))} disabled={!selectedTheater}>
                <SelectTrigger>
                  <SelectValue placeholder={t('chooseDate')} />
                </SelectTrigger>
                <SelectContent>
                  {dates.map(date => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">
                {t('selectTime')}
              </label>
              <Select value={selectedTime?.id} onValueChange={(value) => setSelectedTime(showTimes.find(t => t.id === value) || null)} disabled={!selectedTheater || !selectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder={t('chooseTime')} />
                </SelectTrigger>
                <SelectContent>
                  {showTimes.map(time => (
                    <SelectItem key={time.id} value={time.id}>
                      <div className="flex justify-between items-center gap-4">
                        <span>{time.time}</span>
                        <div className="text-xs text-muted-foreground">
                          {time.available_seats} {t('seatsAvailable')}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Book Button */}
            <Button 
              className="w-full h-12 text-lg mt-8"
              disabled={!selectedTheater || !selectedDate || !selectedTime}
              onClick={handleBooking}
            >
              {t('bookNow')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}