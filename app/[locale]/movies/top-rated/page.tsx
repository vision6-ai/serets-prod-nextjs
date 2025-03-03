'use client'

import { MoviesContent } from '@/app/movies/movies-content'

export default function TopRatedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Top Rated Movies</h1>
      <MoviesContent />
    </div>
  )
}
