import { Suspense } from 'react'
import { GenreContent } from './genre-content'

// Revalidate genre pages every hour
export const revalidate = 3600

export default function GenrePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-48 bg-muted rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[2/3] bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <GenreContent />
    </Suspense>
  )
}
