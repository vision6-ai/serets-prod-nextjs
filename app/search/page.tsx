'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MovieList } from '@/components/movies/movie-list'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mark this page as dynamic to prevent pre-rendering issues
export const dynamic = "force-dynamic";

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialLocation = searchParams.get('location') || 'all'
  
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function searchMovies() {
      setLoading(true)
      
      try {
        let supabaseQuery = supabase
          .from('movies')
          .select('*')
          
        // Apply search filter if query exists
        if (query) {
          supabaseQuery = supabaseQuery.or(
            `title.ilike.%${query}%,hebrew_title.ilike.%${query}%`
          )
        }
        
        // We would add location filtering here if we had location data in our database
        // This is just a placeholder for the UI demonstration
        
        const { data, error } = await supabaseQuery
        
        if (error) throw error
        setMovies(data || [])
      } catch (error) {
        console.error('Error searching movies:', error)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }
    
    searchMovies()
  }, [query, location, supabase])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Update URL with search parameters without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('q', query)
    url.searchParams.set('location', location)
    window.history.pushState({}, '', url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col md:flex-row gap-3 md:items-center bg-card p-4 rounded-lg shadow-sm border">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies, actors, genres..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <div className="relative md:w-[200px]">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                <SelectItem value="tel-aviv">Tel Aviv</SelectItem>
                <SelectItem value="jerusalem">Jerusalem</SelectItem>
                <SelectItem value="haifa">Haifa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="md:w-auto">
            Search
          </Button>
        </div>
      </form>
      
      {/* Search results */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[2/3] bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {movies.length > 0 ? (
              <>
                <p className="mb-4 text-muted-foreground">
                  Found {movies.length} {movies.length === 1 ? 'result' : 'results'} 
                  {query ? ` for "${query}"` : ''}
                </p>
                <MovieList movies={movies} />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No results found{query ? ` for "${query}"` : ''}.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search terms or browse our categories.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Wrap the component that uses useSearchParams in a Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search Results</h1>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading search results...</p>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}