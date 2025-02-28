import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MovieSections } from '@/components/movies/movie-sections'
import { FeaturedActors } from '@/components/featured-actors'
import { MovieSkeleton, ActorSkeleton } from '@/components/skeletons'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Discover Israeli Cinema
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your gateway to the world of Israeli movies, actors, and stories.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/movies">Browse Movies</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/actors">Meet the Actors</Link>
          </Button>
        </div>
      </section>

      {/* Featured Movies Section */}
      <Suspense fallback={<MovieSkeleton />}>
        <MovieSections />
      </Suspense>

      {/* Featured Actors Section */}
      <Suspense fallback={<ActorSkeleton />}>
        <FeaturedActors />
      </Suspense>
    </div>
  )
}
