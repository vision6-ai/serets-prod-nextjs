'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Play, Calendar, Clock, Star, Award, Globe, Tags, Users, ThumbsUp } from 'lucide-react'
import { Link } from '@/app/i18n'
import { useLocale } from 'next-intl'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WishlistButton } from './wishlist-button'
import { MovieReviews } from './movie-reviews'
import { SEO } from '@/components/seo'

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  synopsis: string | null
  release_date: string | null
  duration: number | null
  rating: number | null
  poster_url: string | null
  slug: string
}

interface Video {
  id: string
  title: string
  url: string
  type: string
  language: string | null
}

interface Actor {
  id: string
  name: string
  hebrew_name: string | null
  role: string
  slug: string
  photo_url: string | null
}

interface Genre {
  id: string
  name: string
  hebrew_name: string | null
  slug: string
}

interface Award {
  id: string
  name: string
  category: string
  year: number
  is_winner: boolean
}

interface MovieContentProps {
  movie: Movie
  videos: Video[]
  cast: Actor[]
  genres: Genre[]
  awards: Award[]
  similarMovies: Movie[]
}

export function MovieContent({ movie, videos, cast, genres, awards, similarMovies }: MovieContentProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)
  const locale = useLocale() as 'en' | 'he'

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }
    getUser()
  }, [supabase.auth])

  // Ensure arrays are never null
  const safeVideos = videos || []
  const safeCast = cast || []
  const safeGenres = genres || []
  const safeAwards = awards || []
  const safeSimilarMovies = similarMovies || []

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="container relative mx-auto px-4 py-8 z-10">
      <SEO
        title={movie.title}
        description={movie.synopsis || `Watch ${movie.title}, a critically acclaimed Israeli film.`}
        ogImage={movie.poster_url || undefined}
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Poster and Quick Info */}
          <div className="w-full md:w-1/3">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full max-w-sm mx-auto rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-muted"
                loading="lazy"
              />
            ) : (
              <div className="aspect-[2/3] max-w-sm mx-auto bg-muted rounded-lg flex items-center justify-center text-muted-foreground p-4 text-center">
                {movie.title}
              </div>
            )}
            
            <div className="mt-6 space-y-4">
              {/* Quick Info Cards */}
              <WishlistButton
                movieId={movie.id}
                userId={userId}
                variant="outline"
                showText
                size="default"
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-4">
                {movie.rating && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="w-5 h-5 mx-auto mb-2" />
                      <div className="font-bold text-xl">{movie.rating}/10</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </CardContent>
                  </Card>
                )}
                {movie.duration && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="w-5 h-5 mx-auto mb-2" />
                      <div className="font-bold text-xl">{movie.duration}</div>
                      <div className="text-sm text-muted-foreground">Minutes</div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Release Date */}
              {movie.release_date && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Release Date</span>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(movie.release_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Genres */}
              {safeGenres.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tags className="w-4 h-4" />
                      <span className="font-semibold">Genres</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {safeGenres.map((genre) => (
                        <Link key={genre.id} href={`/genres/${genre.slug}`} locale={locale}>
                          <Badge variant="secondary">
                            {genre.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="w-full md:w-2/3">
            <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
            {movie.hebrew_title && (
              <h2 className="text-2xl text-muted-foreground mb-6">
                {movie.hebrew_title}
              </h2>
            )}
            
            {/* Overview Section */}
            <section id="overview" className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Overview</h2>
              {movie.synopsis && (
                <div className="mb-8">
                  <p className="text-lg leading-relaxed">{movie.synopsis}</p>
                </div>
              )}
            </section>

            {/* Videos Section */}
            {safeVideos.length > 0 && (
              <section id="videos" className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Videos & Trailers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {safeVideos.map((video) => (
                    <Card key={video.id} className="hover-card">
                      <Dialog
                        open={selectedVideo?.id === video.id}
                        onOpenChange={(open) => setSelectedVideo(open ? video : null)}
                      >
                        <DialogTrigger asChild>
                          <CardContent className="p-4 cursor-pointer">
                            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                {video.language && (
                                  <Badge variant="secondary" className="mb-2">
                                    {video.language}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <h4 className="font-medium mb-2">{video.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {video.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                          </CardContent>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[900px]">
                          <div className="aspect-video">
                            <iframe
                              src={video.url}
                              className="w-full h-full rounded-lg"
                              allowFullScreen
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Cast Section */}
            {safeCast.length > 0 && (
              <section id="cast" className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {safeCast.map((actor) => (
                    <Card key={actor.id} className="hover-card h-full">
                      <Link href={`/actors/${actor.slug}`} locale={locale}>
                        <CardContent className="p-4 flex flex-col items-center">
                          <div className="w-full aspect-square mb-4">
                            {actor.photo_url ? (
                              <img
                                src={actor.photo_url}
                                alt={actor.name}
                                className="w-full h-full object-cover rounded-full"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                                <span className="text-2xl">
                                  {actor.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <h4 className="font-medium text-center mb-1">
                            {actor.name}
                          </h4>
                          {actor.hebrew_name && (
                            <p className="text-sm text-muted-foreground text-center mb-1">
                              {actor.hebrew_name}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground text-center">
                            {actor.role}
                          </p>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Awards Section */}
            {safeAwards.length > 0 && (
              <section id="awards" className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Awards</h2>
                <div className="space-y-4">
                  {safeAwards.map((award) => (
                    <Card key={award.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Award className={`w-6 h-6 ${award.is_winner ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                          <div>
                            <h4 className="font-medium">{award.name}</h4>
                            <p className="text-sm text-muted-foreground">{award.category}</p>
                            <p className="text-sm text-muted-foreground">{award.year}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Similar Movies Section */}
            {safeSimilarMovies.length > 0 && (
              <section id="similar" className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Similar Movies</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {safeSimilarMovies.map((similarMovie) => (
                    <Link key={similarMovie.id} href={`/movies/${similarMovie.slug}`} locale={locale}>
                      <Card className="hover-card">
                        <CardContent className="p-4">
                          {similarMovie.poster_url ? (
                            <img
                              src={similarMovie.poster_url}
                              alt={similarMovie.title}
                              className="aspect-[2/3] object-cover rounded-md mb-4"
                              loading="lazy"
                            />
                          ) : (
                            <div className="aspect-[2/3] bg-muted rounded-md mb-4 flex items-center justify-center">
                              {similarMovie.title}
                            </div>
                          )}
                          <h4 className="font-medium mb-1">{similarMovie.title}</h4>
                          {similarMovie.hebrew_title && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {similarMovie.hebrew_title}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section id="reviews" className="mb-12">
          <MovieReviews movieId={movie.id} userId={userId} />
        </section>
      </div>
    </div>
  )
}
