'use client'

import { MoviesContent } from '@/app/movies/movies-content'

export default function LatestReleasesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Latest Releases</h1>
      <MoviesContent />
    </div>
  )
}
