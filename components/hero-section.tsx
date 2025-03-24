'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Search, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Link } from '../app/i18n'

export function HeroSection() {
  const t = useTranslations('home.hero')
  const router = useRouter()
  const locale = useLocale() as 'en' | 'he'
  const isRtl = locale === 'he'
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=${location}`)
    }
  }

  return (
    <section className="relative w-full overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background image - full size */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100%',
          width: '100%',
          maxWidth: '100vw'
        }}
        aria-hidden="true"
      />
      <div 
        className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"
        aria-hidden="true"
      />
      
      {/* Content container */}
      <div className="container relative mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 animate-fade-in">
            {t('title')}
          </h1>
          
          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-xl text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 animate-fade-in animation-delay-200">
            {t('subtitle')}
          </p>
          
          {/* Search form */}
          <form 
            onSubmit={handleSearch}
            className="mx-auto mt-6 max-w-2xl animate-fade-in animation-delay-300"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center rounded-2xl bg-card/90 backdrop-blur-sm p-2 shadow-lg border dark:border-gray-700">
              {/* Search input */}
              <div className={cn(
                "relative flex-grow rtl-icon-input",
                isRtl && "rtl-icon-input"
              )}>
                <Search className={cn(
                  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground icon-left",
                  isRtl && "left-auto right-3"
                )} />
                <Input
                  type="text"
                  placeholder="Search movies, actors, genres..."
                  className={cn(
                    "w-full border-0 bg-transparent pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full h-12",
                    isRtl && "pl-3 pr-10"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Location selector */}
              <div className={cn(
                "relative sm:border-l border-border px-3 flex-shrink-0",
                isRtl && "sm:border-l-0 sm:border-r"
              )}>
                <MapPin className={cn(
                  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hidden sm:block",
                  isRtl && "left-auto right-3"
                )} />
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger 
                    className={cn(
                      "border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 sm:pl-10 h-12 min-w-[140px]",
                      isRtl && "sm:pl-3 sm:pr-10"
                    )}
                    aria-label="Select location"
                  >
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent
                    align={isRtl ? "end" : "start"}
                    sideOffset={2}
                    side="bottom"
                    className="w-screen max-w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                  >
                    <SelectItem value="all">All locations</SelectItem>
                    <SelectItem value="tel-aviv">Tel Aviv</SelectItem>
                    <SelectItem value="jerusalem">Jerusalem</SelectItem>
                    <SelectItem value="haifa">Haifa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search button */}
              <Button 
                type="submit" 
                size="lg" 
                className={cn(
                  "rounded-full px-6 h-12 min-w-[120px]",
                  "transition-all duration-300 ease-in-out",
                  "hover:scale-105 active:scale-95"
                )}
              >
                <span className={isRtl ? "ml-2" : "mr-2"}>Search</span>
                <ArrowRight className={cn(
                  "h-4 w-4",
                  isRtl && "rtl-mirror"
                )} />
              </Button>
            </div>
          </form>
          
          {/* Action buttons */}
          <div className={cn(
            "mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-500",
            isRtl && "sm:flex-row-reverse"
          )}>
            <Button asChild size="lg" className="min-w-[180px]">
              <Link href="/movies">{t('browseMovies')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[180px]">
              <Link href="/actors">{t('meetActors')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
