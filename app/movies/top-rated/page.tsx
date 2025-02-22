'use client'

import { MoviesContent } from '../movies-content'
import { SEO } from '@/components/seo'

export default function TopRatedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Top Rated Movies" description="Browse our collection of top-rated movies." />
      <h1 className="text-4xl font-bold mb-8">Top Rated Movies</h1>
      <MoviesContent />
    </div>
  )
}
