'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Search as SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InstantSearch, Hits, Configure, Index } from 'react-instantsearch-dom'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import { cn } from '@/lib/utils'

// Initialize Meilisearch client
const searchClient = instantMeiliSearch(
  `https://${process.env.NEXT_PUBLIC_MEILISEARCH_HOST!}`,
  process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY!
)

interface SearchResult {
  id: string
  movie_id?: string
  actor_id?: string
  title?: string
  name?: string
  poster_url?: string | null
  photo_url?: string | null
  release_date?: string | null
  slug: string
  language_code: string
  type: 'movie' | 'actor'
}

export function Search() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const locale = useLocale()

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false)
    router.push(`/${locale}/${result.type}s/${result.slug}`)
  }

  // Custom Hit component
  const Hit = ({ hit }: { hit: SearchResult }) => (
    <div
      className="p-2 hover:bg-accent/50 rounded-md cursor-pointer flex items-center gap-3 transition-colors"
      onClick={() => handleSelect(hit)}
    >
      {hit.type === 'movie' ? (
        hit.poster_url ? (
          <img
            src={hit.poster_url}
            alt={hit.title}
            className="w-16 h-24 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-24 bg-muted rounded flex items-center justify-center text-xs text-center p-1">
            No Image
          </div>
        )
      ) : (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {hit.photo_url ? (
            <img
              src={hit.photo_url}
              alt={hit.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg">{(hit.name || '').charAt(0)}</span>
          )}
        </div>
      )}
      <div className="flex-grow min-w-0">
        <div className="font-medium truncate">
          {hit.type === 'movie' ? hit.title : hit.name}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {hit.type === 'movie' ? (
            <>
              <span className="capitalize">{hit.type}</span>
              {hit.release_date && (
                <>
                  <span>•</span>
                  <span>{new Date(hit.release_date).getFullYear()}</span>
                </>
              )}
            </>
          ) : (
            <span className="capitalize">{hit.type}</span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="hidden md:flex">
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Search Movies & Actors</DialogTitle>
          <DialogDescription>
            Search across our database of Israeli movies and actors
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 flex-grow overflow-hidden">
          <InstantSearch
            searchClient={searchClient}
            indexName="movies"
          >
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search movies, actors..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-grow pr-2 space-y-6">
              <div>
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">Movies</h3>
                <Index indexName="movies">
                  <Configure
                    filters={`language_code = ${locale}`}
                    hitsPerPage={5}
                    query={query}
                  />
                  <Hits hitComponent={Hit} />
                </Index>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">Actors</h3>
                <Index indexName="actors">
                  <Configure
                    filters={`language_code = ${locale}`}
                    hitsPerPage={5}
                    query={query}
                  />
                  <Hits hitComponent={Hit} />
                </Index>
              </div>
            </div>
          </InstantSearch>
        </div>
      </DialogContent>
    </Dialog>
  )
}
