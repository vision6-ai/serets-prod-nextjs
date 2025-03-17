'use client'

import { useTranslations } from 'next-intl'
import { Filters } from 'hooks/use-infinite-movies'
import { useCallback, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { ChevronDown, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Locale } from '@/config/i18n'

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

  // Generate year options (from current year + 1 to 10 years back)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + 1 - i)

  return (
    <div className="flex gap-4 mb-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="bg-background hover:bg-accent"
          >
            Genres
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid grid-cols-2 gap-2">
            {genres.map((genre) => (
              <Button
                key={genre.id}
                variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                className="justify-start"
                onClick={() => {
                  setSelectedGenres((prev) =>
                    prev.includes(genre.id)
                      ? prev.filter((id) => id !== genre.id)
                      : [...prev, genre.id]
                  )
                }}
              >
                {genre.name}
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
            className="bg-background hover:bg-accent"
          >
            {selectedYear ? `Year (${selectedYear})` : 'Year'}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <div className="flex flex-col">
            <div className="px-4 py-3 font-medium">Select Year</div>
            <Button
              variant="ghost"
              className="justify-between rounded-none h-11 px-4 font-normal"
              onClick={() => setSelectedYear(null)}
            >
              All Years
              {!selectedYear && <Check className="h-4 w-4 ml-2" />}
            </Button>
            {years.map((year) => (
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
            className="bg-background hover:bg-accent"
          >
            Rating
            <ChevronDown className="h-4 w-4 ml-2" />
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
            className="bg-background hover:bg-accent"
          >
            Sort By
            <ChevronDown className="h-4 w-4 ml-2" />
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
          className="bg-background hover:bg-accent"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
