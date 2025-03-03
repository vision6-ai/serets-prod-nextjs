'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Theater, Movie, Showtime } from '@/types/theater'
import { cn } from '@/lib/utils'

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const locale = useLocale() as 'en' | 'he'
  const t = useTranslations('theaters')
  const isRtl = locale === 'he'
  
  const theaterId = searchParams.get('theater')
  const movieId = searchParams.get('movie')
  const showtimeId = searchParams.get('showtime')
  
  const [theater, setTheater] = useState<Theater | null>(null)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [showtime, setShowtime] = useState<Showtime | null>(null)
  const [loading, setLoading] = useState(true)
  const [ticketCount, setTicketCount] = useState(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState('')

  useEffect(() => {
    async function fetchBookingData() {
      if (!theaterId || !movieId || !showtimeId) {
        router.push('/theaters')
        return
      }

      try {
        // Fetch theater data
        const { data: theaterData } = await supabase
          .from('theaters')
          .select('*')
          .eq('id', theaterId)
          .single()
        
        // Fetch movie data
        const { data: movieData } = await supabase
          .from('movies')
          .select('*')
          .eq('id', movieId)
          .single()
        
        // Fetch theater movie data to get showtimes
        const { data: theaterMovieData } = await supabase
          .from('theater_movies')
          .select('*')
          .eq('theater_id', theaterId)
          .eq('movie_id', movieId)
          .single()
        
        if (theaterData && movieData && theaterMovieData) {
          setTheater(theaterData)
          setMovie(movieData)
          
          // Find the specific showtime
          const selectedShowtime = theaterMovieData.showtimes.find(
            (st: Showtime) => st.id === showtimeId
          )
          
          if (selectedShowtime) {
            setShowtime(selectedShowtime)
          } else {
            router.push('/theaters')
          }
        } else {
          router.push('/theaters')
        }
      } catch (error) {
        console.error('Error fetching booking data:', error)
        router.push('/theaters')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingData()
  }, [theaterId, movieId, showtimeId, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!theater || !movie || !showtime) return
    
    setIsSubmitting(true)
    
    try {
      // In a real app, this would create a booking in the database
      // For this demo, we'll simulate a successful booking
      
      // Generate a random booking reference
      const reference = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setBookingReference(reference)
      setBookingComplete(true)
    } catch (error) {
      console.error('Error creating booking:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto">
          <div className="h-8 bg-muted rounded w-1/2 mb-8 animate-pulse" />
          <Card>
            <CardContent className="p-6 space-y-6 animate-pulse">
              <div className={cn(
                "flex flex-col md:flex-row gap-6",
                isRtl && "md:flex-row-reverse"
              )}>
                <div className="w-full md:w-1/3 aspect-[2/3] bg-muted rounded" />
                <div className="w-full md:w-2/3 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-1/4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (bookingComplete) {
    return (
      <div className="container mx-auto px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-500 dark:border-green-700">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2">{t('bookingConfirmed')}</h1>
                <p className="text-muted-foreground">{t('ticketsReserved')}</p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="text-center mb-2">
                  <span className="text-sm text-muted-foreground">{t('bookingReference')}</span>
                  <p className="text-xl font-mono font-bold">{bookingReference}</p>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {t('saveReference')}
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className={cn(
                  "flex justify-between",
                  isRtl && "flex-row-reverse"
                )}>
                  <span className="text-muted-foreground">{t('movie')}:</span>
                  <span className="font-medium">{movie?.title}</span>
                </div>
                <div className={cn(
                  "flex justify-between",
                  isRtl && "flex-row-reverse"
                )}>
                  <span className="text-muted-foreground">{t('theater')}:</span>
                  <span className="font-medium">{theater?.name}</span>
                </div>
                <div className={cn(
                  "flex justify-between",
                  isRtl && "flex-row-reverse"
                )}>
                  <span className="text-muted-foreground">{t('date')}:</span>
                  <span className="font-medium">{showtime && new Date(showtime.date).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}</span>
                </div>
                <div className={cn(
                  "flex justify-between",
                  isRtl && "flex-row-reverse"
                )}>
                  <span className="text-muted-foreground">{t('time')}:</span>
                  <span className="font-medium">{showtime?.time}</span>
                </div>
                <div className={cn(
                  "flex justify-between",
                  isRtl && "flex-row-reverse"
                )}>
                  <span className="text-muted-foreground">{t('tickets')}:</span>
                  <span className="font-medium">{ticketCount}</span>
                </div>
                <div className={cn(
                  "flex justify-between",
                  isRtl && "flex-row-reverse"
                )}>
                  <span className="text-muted-foreground">{t('total')}:</span>
                  <span className="font-bold">${showtime && (showtime.price * ticketCount).toFixed(2)}</span>
                </div>
              </div>
              
              <div className={cn(
                "flex flex-col sm:flex-row gap-3 justify-center",
                isRtl && "sm:flex-row-reverse"
              )}>
                <Button onClick={() => router.push('/')}>
                  {t('returnHome')}
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  {t('printConfirmation')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!theater || !movie || !showtime) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <h1 className="text-2xl font-bold mb-4">{t('bookingNotFound')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('bookingNotFoundDesc')}
        </p>
        <Button onClick={() => router.push('/theaters')}>
          {t('browseTheaters')}
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('completeBooking')}</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className={cn(
              "flex flex-col md:flex-row gap-6",
              isRtl && "md:flex-row-reverse"
            )}>
              <div className="w-full md:w-1/3">
                {movie.poster_url ? (
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">{movie.title}</span>
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-2/3">
                <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
                {movie.hebrew_title && (
                  <p className="text-muted-foreground mb-2">{movie.hebrew_title}</p>
                )}
                
                <div className={cn(
                  "grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4",
                  isRtl && "text-right"
                )}>
                  <div className="text-muted-foreground">{t('theater')}:</div>
                  <div>{theater.name}</div>
                  
                  <div className="text-muted-foreground">{t('date')}:</div>
                  <div>{new Date(showtime.date).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}</div>
                  
                  <div className="text-muted-foreground">{t('time')}:</div>
                  <div>{showtime.time}</div>
                  
                  <div className="text-muted-foreground">{t('hall')}:</div>
                  <div>{showtime.hall}</div>
                  
                  <div className="text-muted-foreground">{t('format')}:</div>
                  <div>{showtime.format}</div>
                  
                  <div className="text-muted-foreground">{t('pricePerTicket')}:</div>
                  <div>${showtime.price.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('ticketInformation')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketCount">{t('numberOfTickets')}</Label>
                    <Select
                      value={ticketCount.toString()}
                      onValueChange={(value) => setTicketCount(parseInt(value))}
                    >
                      <SelectTrigger id="ticketCount">
                        <SelectValue placeholder={t('selectTickets')} />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(10)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('totalPrice')}</Label>
                    <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center">
                      <span className="font-medium">${(showtime.price * ticketCount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('contactInformation')}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('fullName')}</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={isRtl ? "text-right" : ""}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('phoneNumber')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className={isRtl ? "text-right" : ""}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('emailAddress')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={isRtl ? "text-right" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('emailConfirmation')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className={cn(
            "flex justify-between items-center",
            isRtl && "flex-row-reverse"
          )}>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t('back')}
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('processing') : t('completeBooking')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}