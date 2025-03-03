'use client'

import { MoviesContent } from '../movies-content'
import { SEO } from '@/components/seo'

export default function LatestReleasesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Latest Releases" description="Browse our collection of the latest movie releases." />
      <h1 className="text-4xl font-bold mb-8">Latest Releases</h1>
      <MoviesContent />
    </div>
  )
}
