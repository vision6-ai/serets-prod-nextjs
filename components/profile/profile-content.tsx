'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createBrowserClient } from '@supabase/ssr'
import { Star, Clock, ThumbsUp } from 'lucide-react'

interface UserProfile {
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  website: string | null
  location: string | null
}

interface Movie {
  id: string
  title: string
  poster_url: string | null
  slug: string
  release_date: string | null
}

interface WishlistMovie {
  id: string
  movie: Movie
  notes: string | null
  created_at: string
}

interface UserReview {
  id: string
  movie: Movie
  rating: number
  content: string | null
  helpful_votes: number
  created_at: string
}

type DatabaseWishlistMovie = {
  id: string
  notes: string | null
  created_at: string
  movie: {
    id: string
    title: string
    poster_url: string | null
    slug: string
    release_date: string | null
  }
}

type DatabaseReview = {
  id: string
  rating: number
  content: string | null
  helpful_votes: number
  created_at: string
  movie: {
    id: string
    title: string
    poster_url: string | null
    slug: string
    release_date: string | null
  }
}

export function ProfileContent({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [wishlist, setWishlist] = useState<WishlistMovie[]>([])
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const [profileData, wishlistData, reviewsData] = await Promise.all([
          // Fetch user profile
          supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single(),

          // Fetch wishlist with movie details
          supabase
            .from('wishlists')
            .select(`
              id,
              notes,
              created_at,
              movie:movies!inner (
                id,
                title,
                poster_url,
                slug,
                release_date
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),

          // Fetch reviews with movie details
          supabase
            .from('reviews')
            .select(`
              id,
              rating,
              content,
              helpful_votes,
              created_at,
              movie:movies!inner (
                id,
                title,
                poster_url,
                slug,
                release_date
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        ])

        if (profileData.error) throw profileData.error
        if (wishlistData.error) throw wishlistData.error
        if (reviewsData.error) throw reviewsData.error

        setProfile(profileData.data || null)

        // Transform wishlist data
        const wishlistItems = (wishlistData.data || []) as unknown as DatabaseWishlistMovie[]
        setWishlist(wishlistItems.map(item => ({
          id: item.id,
          notes: item.notes,
          created_at: item.created_at,
          movie: {
            id: item.movie.id,
            title: item.movie.title,
            poster_url: item.movie.poster_url,
            slug: item.movie.slug,
            release_date: item.movie.release_date
          }
        })))

        // Transform review data
        const reviewItems = (reviewsData.data || []) as unknown as DatabaseReview[]
        setReviews(reviewItems.map(item => ({
          id: item.id,
          rating: item.rating,
          content: item.content,
          helpful_votes: item.helpful_votes,
          created_at: item.created_at,
          movie: {
            id: item.movie.id,
            title: item.movie.title,
            poster_url: item.movie.poster_url,
            slug: item.movie.slug,
            release_date: item.movie.release_date
          }
        })))
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [userId, supabase])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="mb-8 text-center">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name || profile.username}
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center text-4xl">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2">
          {profile?.display_name || profile?.username}
        </h1>
        {profile?.bio && (
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            {profile.bio}
          </p>
        )}
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          {profile?.location && <div>{profile.location}</div>}
          {profile?.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {profile.website}
            </a>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="wishlist" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist">
          <div className="space-y-4">
            {wishlist.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your wishlist is empty</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/movies">Browse Movies</Link>
                </Button>
              </div>
            ) : (
              wishlist.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {item.movie.poster_url ? (
                        <img
                          src={item.movie.poster_url}
                          alt={item.movie.title}
                          className="w-24 h-36 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-24 h-36 bg-muted rounded-md flex items-center justify-center">
                          No Image
                        </div>
                      )}
                      <div className="flex-grow">
                        <Link
                          href={`/movies/${item.movie.slug}`}
                          className="text-lg font-semibold hover:underline"
                        >
                          {item.movie.title}
                        </Link>
                        {item.movie.release_date && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Release Date:{' '}
                            {new Date(item.movie.release_date).toLocaleDateString()}
                          </div>
                        )}
                        {item.notes && (
                          <div className="mt-2 text-sm">{item.notes}</div>
                        )}
                        <div className="text-sm text-muted-foreground mt-2">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>You haven't written any reviews yet</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/movies">Browse Movies</Link>
                </Button>
              </div>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {review.movie.poster_url ? (
                        <img
                          src={review.movie.poster_url}
                          alt={review.movie.title}
                          className="w-24 h-36 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-24 h-36 bg-muted rounded-md flex items-center justify-center">
                          No Image
                        </div>
                      )}
                      <div className="flex-grow">
                        <Link
                          href={`/movies/${review.movie.slug}`}
                          className="text-lg font-semibold hover:underline"
                        >
                          {review.movie.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">{review.rating}/10</span>
                        </div>
                        {review.content && (
                          <p className="mt-2 text-sm">{review.content}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div>
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {review.helpful_votes} helpful
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
