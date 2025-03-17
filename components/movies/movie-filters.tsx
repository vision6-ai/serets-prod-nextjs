'use client'

import { useTranslations } from 'next-intl'
import { Filters } from 'hooks/use-infinite-movies'
import { useCallback, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { ChevronDown, Check, FilterX } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Locale } from '@/config/i18n'
import { cn } from '@/lib/utils'
import { TheaterFilterSelect } from '@/components/ui/theater-filter-select'

interface Genre {
  id: string
  name: string
}

interface Theater {
  id: string
  name: string
  location: string
}

interface MovieFiltersProps {
  onFilterChange: (filters: Filters) => void
  locale: Locale
}

export function MovieFilters({ onFilterChange, locale }: MovieFiltersProps) {
  const t = useTranslations('movies')
  const [genres, setGenres] = useState<Genre[]>([])
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [selectedTheater, setSelectedTheater] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'release_date' | 'rating' | 'title'>('release_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Check if any filters are active
  const hasActiveFilters = selectedGenres.length > 0 || selectedYear !== null || 
                          selectedRating !== null || selectedTheater !== null

  // Clear all filters
  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedYear(null)
    setSelectedRating(null)
    setSelectedTheater(null)
    setSortBy('release_date')
    setSortOrder('desc')
  }

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      const supabase = createClientComponentClient()
      const { data } = await supabase
        .from('genre_translations')
        .select(`
          genre_id,
          name
        `)
        .eq('language_code', locale)
      
      if (data) {
        setGenres(data.map(genre => ({
          id: genre.genre_id,
          name: genre.name
        })))
      }
    }

    fetchGenres()
  }, [locale])

  // Fetch theaters
  useEffect(() => {
    const fetchTheaters = async () => {
      const supabase = createClientComponentClient()
      const { data } = await supabase
        .from('theaters')
        .select('id, name, location')
        .order('name')
      
      if (data) {
        setTheaters(data)
      }
    }

    fetchTheaters()
  }, [])

  // Update filters when any selection changes
  useEffect(() => {
    onFilterChange({
      genres: selectedGenres,
      year: selectedYear,
      rating: selectedRating,
      theaterId: selectedTheater,
      sortBy,
      sortOrder,
    })
  }, [selectedGenres, selectedYear, selectedRating, selectedTheater, sortBy, sortOrder, onFilterChange])

  // Generate year options (from current year + 1 to 10 years back)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + 1 - i)

  return (
    <div className="mb-6">
      {/* Filter buttons - responsive grid layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-background hover:bg-accent text-sm sm:text-base px-3 sm:px-4 h-10 sm:h-11"
            >
              <span className="truncate">{t('filters.genres')}</span>
              <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] sm:w-80">
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => (
                <Button
                  key={genre.id}
                  variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                  className="justify-start text-sm"
                  onClick={() => {
                    setSelectedGenres((prev) =>
                      prev.includes(genre.id)
                        ? prev.filter((id) => id !== genre.id)
                        : [...prev, genre.id]
                    )
                  }}
                >
                  <span className="truncate">{genre.name}</span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Theater Filter */}
        <TheaterFilterSelect
          theaters={theaters}
          selectedTheaterId={selectedTheater}
          onTheaterChange={setSelectedTheater}
          placeholder={t('filters.theaters')}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-background hover:bg-accent text-sm sm:text-base px-3 sm:px-4 h-10 sm:h-11"
            >
              <span className="truncate">{t('filters.year')}</span>
              <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] sm:w-80">
            <div className="grid grid-cols-2 gap-2">
              {years.map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  className="justify-start text-sm"
                  onClick={() => {
                    setSelectedYear(selectedYear === year ? null : year)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedYear === year ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{year}</span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-background hover:bg-accent text-sm sm:text-base px-3 sm:px-4 h-10 sm:h-11"
            >
              <span className="truncate">{t('filters.rating')}</span>
              <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] sm:w-80">
            <div className="grid grid-cols-2 gap-2">
              {[9, 8, 7, 6, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={selectedRating === rating ? "default" : "outline"}
                  className="justify-start text-sm"
                  onClick={() => {
                    setSelectedRating(selectedRating === rating ? null : rating)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedRating === rating ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{rating}+</span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-background hover:bg-accent text-sm sm:text-base px-3 sm:px-4 h-10 sm:h-11"
            >
              <span className="truncate">{t('filters.sortBy')}</span>
              <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] sm:w-80">
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={sortBy === 'release_date' ? "default" : "outline"}
                  className="justify-start text-sm"
                  onClick={() => {
                    if (sortBy === 'release_date') {
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                    } else {
                      setSortBy('release_date')
                      setSortOrder('desc')
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      sortBy === 'release_date' ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{t('filters.sortByDate')}</span>
                  {sortBy === 'release_date' && (
                    <span className="ml-auto text-xs opacity-60">
                      {sortOrder === 'desc' ? t('filters.newest') : t('filters.oldest')}
                    </span>
                  )}
                </Button>

                <Button
                  variant={sortBy === 'rating' ? "default" : "outline"}
                  className="justify-start text-sm"
                  onClick={() => {
                    if (sortBy === 'rating') {
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                    } else {
                      setSortBy('rating')
                      setSortOrder('desc')
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      sortBy === 'rating' ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{t('filters.sortByRating')}</span>
                  {sortBy === 'rating' && (
                    <span className="ml-auto text-xs opacity-60">
                      {sortOrder === 'desc' ? t('filters.highest') : t('filters.lowest')}
                    </span>
                  )}
                </Button>

                <Button
                  variant={sortBy === 'title' ? "default" : "outline"}
                  className="justify-start text-sm"
                  onClick={() => {
                    if (sortBy === 'title') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortBy('title')
                      setSortOrder('asc')
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      sortBy === 'title' ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{t('filters.sortByTitle')}</span>
                  {sortBy === 'title' && (
                    <span className="ml-auto text-xs opacity-60">
                      {sortOrder === 'asc' ? t('filters.aToZ') : t('filters.zToA')}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="lg"
            onClick={clearFilters}
            className="w-full bg-background hover:bg-accent text-sm sm:text-base px-3 sm:px-4 h-10 sm:h-11 flex items-center"
          >
            <FilterX className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{t('filters.clear')}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
