'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

interface Genre {
  id: string
  name: string
}

interface BlogFilterProps {
  genres: Genre[]
  totalPosts: number
}

export function BlogFilter({ genres, totalPosts }: BlogFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('date')
  
  // Initialize filters from URL params
  useEffect(() => {
    if (searchParams) {
      const genreParam = searchParams.get('genre')
      const sortParam = searchParams.get('sort')
      
      if (genreParam) {
        setSelectedGenre(genreParam)
      }
      
      if (sortParam) {
        setSortBy(sortParam)
      }
    }
  }, [searchParams])
  
  // Update URL when filters change
  const updateFilters = (genre: string = selectedGenre, sort: string = sortBy) => {
    const params = new URLSearchParams()
    
    if (genre) {
      params.set('genre', genre)
    }
    
    if (sort && sort !== 'date') {
      params.set('sort', sort)
    }
    
    const queryString = params.toString()
    const url = queryString ? `?${queryString}` : ''
    
    router.push(url)
  }
  
  const handleGenreChange = (genreId: string) => {
    const newGenre = genreId === selectedGenre ? '' : genreId
    setSelectedGenre(newGenre)
    updateFilters(newGenre, sortBy)
  }
  
  const handleSortChange = (value: string) => {
    setSortBy(value)
    updateFilters(selectedGenre, value)
  }
  
  const clearFilters = () => {
    setSelectedGenre('')
    setSortBy('date')
    router.push('')
  }
  
  const hasActiveFilters = selectedGenre !== '' || sortBy !== 'date'
  
  return (
    <motion.div 
      className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-3xl font-bold mb-1">Blog</h1>
        <p className="text-muted-foreground">
          {totalPosts} movie review{totalPosts !== 1 ? 's' : ''}
          {selectedGenre && genres.find(g => g.id === selectedGenre) && 
            ` in ${genres.find(g => g.id === selectedGenre)?.name}`
          }
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Genre Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              {selectedGenre 
                ? `Genre: ${genres.find(g => g.id === selectedGenre)?.name}` 
                : 'All Genres'
              }
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Genre</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedGenre === ''}
              onCheckedChange={() => handleGenreChange('')}
            >
              All Genres
            </DropdownMenuCheckboxItem>
            {genres.map(genre => (
              <DropdownMenuCheckboxItem
                key={genre.id}
                checked={selectedGenre === genre.id}
                onCheckedChange={() => handleGenreChange(genre.id)}
              >
                {genre.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Sort Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              {sortBy === 'date' ? 'Newest First' :
                sortBy === 'rating' ? 'Highest Rated' :
                sortBy === 'title' ? 'A-Z' : 'Sort By'
              }
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={sortBy === 'date'}
              onCheckedChange={() => handleSortChange('date')}
            >
              Newest First
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortBy === 'rating'}
              onCheckedChange={() => handleSortChange('rating')}
            >
              Highest Rated
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortBy === 'title'}
              onCheckedChange={() => handleSortChange('title')}
            >
              Title A-Z
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            size="sm"
            className="ml-1"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </motion.div>
  )
} 