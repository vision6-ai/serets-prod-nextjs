'use client'

import { MoviesContent } from './movies-content'
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
        <MoviesContent />
      </div>
    </div>
  )
}
