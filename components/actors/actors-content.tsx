'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useInfiniteActors, ActorFilters } from '@/hooks/use-infinite-actors'

interface ActorsContentProps {
  locale?: string
}

export function ActorsContent({ locale = 'en' }: ActorsContentProps) {
  console.log('ActorsContent rendering with locale:', locale)
  
  const [loading, setLoading] = useState(true)
  
  // Use a simple default sort configuration - just sort by name ascending
  const filters: ActorFilters = {
    sortBy: 'name',
    sortOrder: 'asc'
  }

  console.log('Using filters:', filters)

  const {
    actors,
    totalActors,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef,
    error
  } = useInfiniteActors(locale, filters)

  console.log('Actors received from hook:', { 
    actorsCount: actors.length, 
    totalActors, 
    isLoading, 
    isFetchingNextPage, 
    hasNextPage,
    error: error ? error.message : null
  })

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading])

  return (
    <div className="space-y-6 sm:space-y-8 px-1 sm:px-0">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Error loading actors: {error.message}
        </div>
      )}

      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-muted rounded-full animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {actors.length === 0 && !loading && !error ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No actors found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {actors.map((actor) => (
                  <Link
                    key={actor.id}
                    href={`/${locale}/actors/${actor.slug}`}
                    className="group text-center"
                  >
                    <div className="overflow-hidden rounded-full aspect-square bg-muted mb-4">
                      {actor.photo_url ? (
                        <Image
                          src={actor.photo_url}
                          alt={actor.name}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          width={256}
                          height={256}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {actor.name}
                    </h3>
                    {actor.birth_date && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(actor.birth_date).getFullYear()}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Loading indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}
            
            {/* Intersection observer target */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="h-1" />
            )}
            
            {/* Actors count */}
            <div className="text-center text-sm text-muted-foreground">
              Showing {actors.length} of {totalActors} actors
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 