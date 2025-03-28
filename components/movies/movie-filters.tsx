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

interface Genre {
  id: string
  name: string
}

interface MovieFiltersProps {
  onFilterChange: (filters: Filters) => void
  locale: Locale
}

export function MovieFilters({ onFilterChange, locale }: MovieFiltersProps) {
  const t = useTranslations('movies')
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'release_date' | 'rating' | 'title'>('release_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Check if any filters are active
  const hasActiveFilters = selectedGenres.length > 0 || selectedYear !== null || selectedRating !== null

  // Clear all filters
  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedYear(null)
    setSelectedRating(null)
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

  // Fetch available years from movies in the database
  useEffect(() => {
    const fetchYears = async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from('movies')
        .select('release_date')
        .not('release_date', 'is', null)
      
      if (data && !error) {
        // Extract years from release dates and create a unique set of years
        const years = data
          .map(movie => new Date(movie.release_date!).getFullYear())
          .filter(year => !isNaN(year)); // Filter out any invalid dates
        
        // Create a unique sorted array of years (newest first)
        const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
        setAvailableYears(uniqueYears);
      }
    }

    fetchYears();
  }, []);

  // Update filters when any selection changes
  useEffect(() => {
    onFilterChange({
      genres: selectedGenres,
      year: selectedYear,
      rating: selectedRating,
      sortBy,
      sortOrder,
    })
  }, [selectedGenres, selectedYear, selectedRating, sortBy, sortOrder, onFilterChange])

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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-background hover:bg-accent text-sm sm:text-base px-3 sm:px-4 h-10 sm:h-11"
            >
              <span className="truncate">
                {selectedYear ? `${selectedYear}` : t('filters.all_years')}
              </span>
              <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0 max-h-[320px] overflow-y-auto">
            <div className="flex flex-col">
              <div className="px-4 py-3 font-medium">{t('filters.select_year')}</div>
              <Button
                variant="ghost"
                className="justify-between rounded-none h-11 px-4 font-normal"
                onClick={() => setSelectedYear(null)}
              >
                {t('filters.all_years')}
                {!selectedYear && <Check className="h-4 w-4 ml-2" />}
              </Button>
              {availableYears.map((year) => (
                <Button
                  key={year}
                  variant="ghost"
                  className="justify-between rounded-none h-11 px-4 font-normal"
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                  {selectedYear === year && <Check className="h-4 w-4 ml-2" />}
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
              <span className="truncate">
                {selectedRating ? `${selectedRating}+` : t('filters.rating')}
              </span>
              <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="flex flex-col gap-1">
              <Button
                variant={!selectedRating ? "default" : "outline"}
                className="justify-start"
                onClick={() => setSelectedRating(null)}
              >
                {t('filters.any_rating')}
              </Button>
              {[9, 8, 7, 6, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={selectedRating === rating ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setSelectedRating(rating)}
                >
                  {rating.toFixed(1)}+ ⭐️
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
              <span className="truncate">{t('filters.sort_by')}</span>
              <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="flex flex-col gap-1">
              {[
                { value: 'release_date', label: t('filters.release_date') },
                { value: 'rating', label: t('filters.rating') },
                { value: 'title', label: t('filters.title') }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => {
                    setSortBy(option.value as typeof sortBy)
                  }}
                >
                  {option.label}
                </Button>
              ))}
              <div className="border-t my-2" />
              <Button
                variant={sortOrder === 'desc' ? "default" : "outline"}
                className="justify-start"
                onClick={() => setSortOrder('desc')}
              >
                {t('filters.descending')}
              </Button>
              <Button
                variant={sortOrder === 'asc' ? "default" : "outline"}
                className="justify-start"
                onClick={() => setSortOrder('asc')}
              >
                {t('filters.ascending')}
              </Button>
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
