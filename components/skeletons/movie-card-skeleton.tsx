import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface MovieCardSkeletonProps {
  className?: string
}

/**
 * Skeleton loader for movie cards that matches the exact layout of the actual movie card
 */
export function MovieCardSkeleton({ className }: MovieCardSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden group", className)}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Poster skeleton - 70% height on desktop, 60% on mobile */}
          <div className="w-full pt-[60%] md:pt-[70%] relative bg-muted animate-pulse rounded-t-lg" />
          
          {/* Rating badge skeleton */}
          <div className="absolute top-2 right-2 w-12 h-6 bg-muted/80 animate-pulse rounded-full" />
        </div>
        
        <div className="p-4 space-y-3">
          {/* Title skeleton */}
          <Skeleton className="h-5 w-3/4" />
          
          {/* Hebrew title skeleton (optional) */}
          <Skeleton className="h-4 w-1/2" />
          
          {/* Genre badges skeleton */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          
          {/* Movie details skeleton */}
          <Skeleton className="h-4 w-full" />
          
          {/* Showtimes skeleton */}
          <div className="pt-2">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          </div>
          
          {/* Book Now button skeleton */}
          <Skeleton className="h-11 w-full rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Grid of movie card skeletons for loading states
 */
export function MovieGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for movie sections on homepage
 */
export function MovieSectionSkeleton() {
  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  )
}