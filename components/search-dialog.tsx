'use client'

import { useState, useEffect } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/app/i18n'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title?: string
  name?: string
  poster_url?: string | null
  release_date?: string | null
  type: 'movie' | 'actor'
  photo_url?: string | null
  slug?: string
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const locale = useLocale() as string
  const t = useTranslations('navigation') as (key: string) => string
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  // Handle search when query changes
  useEffect(() => {
    const handleSearch = async () => {
      if (query.length < 2) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Get base movie and actor data
        const [moviesRes, actorsRes] = await Promise.all([
          supabase
            .from('movies')
            .select(`
              id, 
              slug,
              release_date,
              movie_translations!inner(
                title,
                poster_url,
                language_code
              )
            `)
            .eq('movie_translations.language_code', locale)
            .ilike('movie_translations.title', `%${query}%`)
            .limit(5),
          supabase
            .from('actors')
            .select(`
              id,
              slug,
              photo_url,
              actor_translations!inner(
                name,
                language_code
              )
            `)
            .eq('actor_translations.language_code', locale)
            .ilike('actor_translations.name', `%${query}%`)
            .limit(5)
        ])

        // Process movie results
        const movies: SearchResult[] = (moviesRes.data || []).map((movie) => {
          const translation = movie.movie_translations?.[0] || {}
          return {
            id: movie.id,
            title: translation.title || movie.slug,
            release_date: movie.release_date,
            poster_url: translation.poster_url,
            type: 'movie',
            slug: movie.slug
          }
        })

        // Process actor results
        const actors: SearchResult[] = (actorsRes.data || []).map((actor) => {
          const translation = actor.actor_translations?.[0] || {}
          return {
            id: actor.id,
            name: translation.name || actor.slug,
            photo_url: actor.photo_url,
            type: 'actor',
            slug: actor.slug
          }
        })

        // Combine and set results
        setResults([...movies, ...actors])
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    // Use debounce to avoid too many requests
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, locale, supabase])

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-4 pt-4 pb-2 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="sr-only">
            {t('search')}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              className="border-none focus-visible:ring-0 pl-0 h-10"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setQuery('')}
              className={cn("transition-opacity", !query && "opacity-0")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-12 h-16 rounded" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {results.length > 0 ? (
                <div className="py-1">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={`/${locale}/${result.type}s/${result.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors"
                    >
                      {/* Result image (poster or photo) */}
                      {result.type === 'movie' ? (
                        <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                          {result.poster_url ? (
                            <Image
                              src={result.poster_url}
                              alt={result.title || ''}
                              width={48}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs p-1 text-center">
                              {result.title?.substring(0, 20)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                          {result.photo_url ? (
                            <Image
                              src={result.photo_url}
                              alt={result.name || ''}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {result.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Result details */}
                      <div className="overflow-hidden">
                        <h4 className="font-medium truncate">
                          {result.type === 'movie' ? result.title : result.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {result.type === 'movie' ? (
                            <>
                              <span className="capitalize">{result.type}</span>
                              {result.release_date && (
                                <>
                                  <span> • </span>
                                  <span>{new Date(result.release_date).getFullYear()}</span>
                                </>
                              )}
                            </>
                          ) : (
                            <span className="capitalize">{result.type}</span>
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                query.length >= 2 && (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground mb-2">No results found</p>
                    <p className="text-sm text-muted-foreground">
                      Try searching for something else
                    </p>
                  </div>
                )
              )}

              {/* Initial search prompt when dialog is opened */}
              {query.length < 2 && (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Type at least 2 characters to search
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}