'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthDialog } from '@/components/auth/auth-dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase'

interface MovieContentProps {
  movie: {
    id: string
    title: string
    hebrew_title: string
    synopsis: string
    release_date: string
    duration: number
    rating: number
    poster_url: string
    slug: string
  }
  videos: any[]
  cast: Array<{
    id: string
    name: string
    hebrew_name: string | null
    slug: string
    photo_url: string | null
    role: string
  }>
  genres: Array<{
    id: string
    name: string
    hebrew_name: string | null
    slug: string
  }>
  awards: Array<{
    id: string
    name: string
    category: string
    year: number
    is_winner: boolean
  }>
  similarMovies: Array<{
    id: string
    title: string
    hebrew_title: string
    synopsis: string
    release_date: string
    duration: number
    rating: number
    poster_url: string
    slug: string
  }>
}

export function MovieContent({
  movie,
  videos,
  cast,
  genres,
  awards,
  similarMovies
}: MovieContentProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const handleWishlistClick = async () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movie.id)

        if (error) throw error

        setIsInWishlist(false)
        toast({
          title: 'Success',
          description: 'Movie removed from wishlist.'
        })
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            movie_id: movie.id
          })

        if (error) throw error

        setIsInWishlist(true)
        toast({
          title: 'Success',
          description: 'Movie added to wishlist.'
        })
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update wishlist.',
        variant: 'destructive'
      })
    }
  }

  // Check if movie is in user's wishlist on component mount
  useEffect(() => {
    if (user) {
      supabase
        .from('wishlists')
        .select()
        .eq('user_id', user.id)
        .eq('movie_id', movie.id)
        .single()
        .then(({ data }) => {
          setIsInWishlist(!!data)
        })
    }
  }, [user, movie.id, supabase])

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Movie poster */}
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full max-w-[400px] rounded-lg"
        />

        {/* Add to Wishlist button */}
        <button
          onClick={handleWishlistClick}
          className="flex items-center justify-center gap-2 w-full max-w-[400px] px-4 py-2 rounded-md border border-border hover:bg-accent"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isInWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Add to Wishlist
        </button>

        {/* Rating and Duration */}
        <div className="flex gap-4 w-full max-w-[400px]">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div className="font-bold">{movie.rating}/10</div>
            <div className="text-sm text-muted-foreground">Rating</div>
          </div>

          <div className="flex-1 text-center">
            <div className="flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="font-bold">{movie.duration}</div>
            <div className="text-sm text-muted-foreground">Minutes</div>
          </div>
        </div>

        {/* Release Date */}
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2 px-4 py-3 rounded-md border border-border">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Release Date
          </div>
        </div>

        {/* Title and Overview */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          {movie.hebrew_title && (
            <h2 className="text-2xl text-muted-foreground">{movie.hebrew_title}</h2>
          )}

          <div>
            <h3 className="text-2xl font-semibold mb-2">Overview</h3>
            <p>{movie.synopsis}</p>
          </div>
        </div>

        {/* Cast section */}
        {cast.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Cast</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {cast.map((actor) => (
                <div key={actor.id} className="text-center">
                  <img
                    src={actor.photo_url || ''}
                    alt={actor.name}
                    className="w-full aspect-square rounded-full object-cover mb-2"
                  />
                  <div className="font-medium">{actor.name}</div>
                  <div className="text-sm text-muted-foreground">{actor.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        redirectTo={window?.location?.href}
      />
    </>
  )
}
