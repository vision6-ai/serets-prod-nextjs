'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Link } from '@/app/i18n'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { WishlistButton } from './wishlist-button'
import { useState, useEffect } from 'react'

interface Movie {
  id: string
  title: string
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
}

interface MovieListProps {
  movies: Movie[]
}

export function MovieList({ movies }: MovieListProps) {
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({})
  const locale = useLocale() as 'en' | 'he'

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }
    getUser()
  }, [supabase.auth])

  const handleImageLoad = (movieId: string) => {
    setLoadedImages(prev => ({ ...prev, [movieId]: true }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <Card key={movie.id} className="group overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <Link href={`/movies/${movie.slug}`} locale={locale} className="block">
                <div className="aspect-[2/3] relative overflow-hidden bg-muted">
                  {movie.poster_url ? (
                    <>
                      <div className={`absolute inset-0 bg-muted ${loadedImages[movie.id] ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
                      <Image
                        src={movie.poster_url}
                        alt={movie.title}
                        fill
                        className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                          loadedImages[movie.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        priority={false}
                        onLoad={() => handleImageLoad(movie.id)}
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.src = `https://placehold.co/400x600/374151/FFFFFF?text=${encodeURIComponent(movie.title)}`;
                        }}
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4 text-center">
                      {movie.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </Link>
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton
                  movieId={movie.id}
                  userId={userId}
                  variant="secondary"
                />
              </div>
            </div>
            <div className="p-4">
              <Link href={`/movies/${movie.slug}`} locale={locale} className="block group-hover:text-primary transition-colors">
                <h3 className="font-semibold mb-1 line-clamp-1">{movie.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                  {movie.rating && ` • ${movie.rating}/10`}
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
