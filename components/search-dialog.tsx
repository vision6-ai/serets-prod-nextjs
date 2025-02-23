'use client'

import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

interface SearchResult {
  id: string
  title?: string
  name?: string
  poster_url?: string | null
  release_date?: string | null
  type: 'movie' | 'actor'
  photo_url?: string | null
}

export function SearchDialog() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (value: string) => {
    setQuery(value)
    if (value.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const [moviesRes, actorsRes] = await Promise.all([
        supabase
          .from('movies')
          .select('id, title, poster_url, release_date')
          .ilike('title', `%${value}%`)
          .limit(5),
        supabase
          .from('actors')
          .select('id, name, photo_url')
          .ilike('name', `%${value}%`)
          .limit(5)
      ])

      const movies = (moviesRes.data || []).map(m => ({ ...m, type: 'movie' as const }))
      const actors = (actorsRes.data || []).map(a => ({ ...a, type: 'actor' as const }))
      
      setResults([...movies, ...actors])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden relative">
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Search Movies & Actors</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 flex-grow overflow-hidden">
          <Input
            placeholder="Search movies, actors..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="sticky top-0 bg-background"
          />
          <div className="overflow-y-auto flex-grow pr-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-12 h-16 bg-muted animate-pulse rounded" />
                  <div className="flex-grow space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {results.length > 0 ? (
                <div className="space-y-1">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-2 hover:bg-accent/50 rounded-md cursor-pointer flex items-center gap-3 transition-colors"
                    onClick={async () => {
                      const { data } = await supabase
                        .from(result.type === 'movie' ? 'movies' : 'actors')
                        .select('slug')
                        .eq('id', result.id)
                        .single()
                      
                      if (data?.slug) {
                        router.push(`/${result.type}s/${data.slug}`)
                      }
                    }}
                  >
                    {/* Image */}
                    {result.type === 'movie' ? (
                      result.poster_url ? (
                        <img
                          src={result.poster_url}
                          alt={result.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-muted rounded flex items-center justify-center text-xs text-center p-1">
                          No Image
                        </div>
                      )
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {result.photo_url ? (
                          <img src={result.photo_url} alt={result.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-lg">{(result.name || '').charAt(0)}</span>
                        )}
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <div className="font-medium truncate">
                        {result.type === 'movie' ? result.title : result.name}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {result.type === 'movie' ? (
                          <>
                            <span className="capitalize">{result.type}</span>
                            {result.release_date && (
                              <>
                                <span>•</span>
                                <span>{new Date(result.release_date).getFullYear()}</span>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="capitalize">{result.type}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              ) : query.length > 0 && !loading && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-2">Try searching for something else</p>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
