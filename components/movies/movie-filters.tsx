'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Genre {
  id: string
  name: string
  hebrew_name: string | null
}

interface MovieFiltersProps {
  onFilterChange: (filters: {
    genres: string[]
    year?: number | null
    rating?: number | null
    sortBy: 'release_date' | 'rating' | 'title'
    sortOrder: 'asc' | 'desc'
  }) => void
}

export function MovieFilters({ onFilterChange }: MovieFiltersProps) {
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'release_date' | 'rating' | 'title'>('release_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const supabase = createClientComponentClient()

  // Fetch genres on component mount
  useEffect(() => {
    async function fetchGenres() {
      const { data } = await supabase
        .from('genres')
        .select('*')
        .order('name')
      
      if (data) {
        setGenres(data)
      }
    }

    fetchGenres()
  }, [supabase])

  // Debounced filter change handler
  const debouncedFilterChange = useCallback(
    (filters: {
      genres: string[]
      year?: number | null
      rating?: number | null
      sortBy: 'release_date' | 'rating' | 'title'
      sortOrder: 'asc' | 'desc'
    }) => {
      onFilterChange(filters)
    },
    [onFilterChange]
  )

  // Update filters when any filter value changes
  useEffect(() => {
    const filters = {
      genres: selectedGenres,
      year: selectedYear,
      rating: selectedRating,
      sortBy,
      sortOrder
    }
    debouncedFilterChange(filters)
  }, [selectedGenres, selectedYear, selectedRating, sortBy, sortOrder, debouncedFilterChange])

  // Generate years from 1960 to current year
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - 1960 + 1 },
    (_, i) => currentYear - i
  )

  return (
    <div className="flex flex-wrap gap-2">
      {/* Genre Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Genres {selectedGenres.length > 0 && `(${selectedGenres.length})`}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Select Genres</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {genres.map((genre) => (
            <DropdownMenuCheckboxItem
              key={genre.id}
              checked={selectedGenres.includes(genre.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedGenres([...selectedGenres, genre.id])
                } else {
                  setSelectedGenres(selectedGenres.filter(id => id !== genre.id))
                }
              }}
            >
              {genre.name}
              {genre.hebrew_name && (
                <span className="ml-2 text-muted-foreground">
                  ({genre.hebrew_name})
                </span>
              )}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Year Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Year {selectedYear && `(${selectedYear})`}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
          <DropdownMenuLabel>Select Year</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={selectedYear === null}
            onCheckedChange={() => setSelectedYear(null)}
          >
            All Years
          </DropdownMenuCheckboxItem>
          {years.map((year) => (
            <DropdownMenuCheckboxItem
              key={year}
              checked={selectedYear === year}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedYear(year)
                } else {
                  setSelectedYear(null)
                }
              }}
            >
              {year}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rating Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Rating {selectedRating && `(${selectedRating}+)`}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Minimum Rating</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={selectedRating === null}
            onCheckedChange={() => setSelectedRating(null)}
          >
            Any Rating
          </DropdownMenuCheckboxItem>
          {[9, 8, 7, 6, 5].map((rating) => (
            <DropdownMenuCheckboxItem
              key={rating}
              checked={selectedRating === rating}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedRating(rating)
                } else {
                  setSelectedRating(null)
                }
              }}
            >
              {rating}+ Stars
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Sort By
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortBy === 'release_date' && sortOrder === 'desc'}
            onCheckedChange={() => {
              setSortBy('release_date')
              setSortOrder('desc')
            }}
          >
            Newest First
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'release_date' && sortOrder === 'asc'}
            onCheckedChange={() => {
              setSortBy('release_date')
              setSortOrder('asc')
            }}
          >
            Oldest First
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'rating' && sortOrder === 'desc'}
            onCheckedChange={() => {
              setSortBy('rating')
              setSortOrder('desc')
            }}
          >
            Highest Rated
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'title' && sortOrder === 'asc'}
            onCheckedChange={() => {
              setSortBy('title')
              setSortOrder('asc')
            }}
          >
            Title A-Z
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {(selectedGenres.length > 0 || selectedYear !== null || selectedRating !== null || 
        sortBy !== 'release_date' || sortOrder !== 'desc') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedGenres([])
            setSelectedYear(null)
            setSelectedRating(null)
            setSortBy('release_date')
            setSortOrder('desc')
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
