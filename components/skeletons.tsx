export function MovieSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4 mb-4" />
        <div className="h-6 bg-muted rounded w-1/2 mb-8" />
      </div>
      
      {/* Movie filters skeleton */}
      <div className="flex flex-wrap gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded-md w-32 animate-pulse" />
        ))}
      </div>
      
      {/* Movie grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg">
            <div className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
            <div className="p-2 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ActorSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-64 h-64 rounded-full bg-muted mx-auto mb-6 loading-shimmer" />
          <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-4 loading-shimmer" />
          <div className="h-6 bg-muted rounded w-1/3 mx-auto loading-shimmer" />
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-full loading-shimmer" />
          <div className="h-4 bg-muted rounded w-5/6 loading-shimmer" />
          <div className="h-4 bg-muted rounded w-4/6 loading-shimmer" />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="h-10 w-40 bg-primary/10 rounded-md animate-pulse"></div>
        <div className="h-10 w-32 bg-primary/10 rounded-md animate-pulse"></div>
      </div>
      
      <div className="h-12 w-full bg-primary/10 rounded-md animate-pulse"></div>
      
      <div className="space-y-6">
        <div className="h-64 w-full bg-primary/10 rounded-md animate-pulse"></div>
        <div className="h-64 w-full bg-primary/10 rounded-md animate-pulse"></div>
      </div>
    </div>
  )
}

export function TheaterSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded w-1/4 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <div className="h-48 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}