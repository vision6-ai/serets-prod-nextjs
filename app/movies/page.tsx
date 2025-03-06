import { Suspense } from 'react'
import MoviesClient from './movies-client'
import { SEO } from '@/components/seo'

export default function MoviesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="Movies" 
        description="Browse our collection of Israeli movies. Filter by genre, year, and rating."
        keywords={[
          'Israeli movies',
          'Israeli cinema',
          'movies',
          'films',
          'watch movies'
        ]}
      />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Movies</h1>
        <Suspense fallback={<MoviesLoading />}>
          <MoviesClient />
        </Suspense>
      </div>
    </div>
  )
}

function MoviesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-[2/3] bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
