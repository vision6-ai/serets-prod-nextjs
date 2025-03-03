'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Plus, Minus, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface MovieActionsProps {
  movieId: string
  userId?: string | null
}

export function MovieActions({ movieId, userId }: MovieActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [userReview, setUserReview] = useState<{
    id: string
    rating: number
    content: string
  } | null>(null)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUserInteractions() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const [wishlistRes, reviewRes] = await Promise.all([
          // Check if movie is in user's wishlist
          supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', userId)
            .eq('movie_id', movieId)
            .single(),

          // Get user's review if it exists
          supabase
            .from('reviews')
            .select('id, rating, content')
            .eq('user_id', userId)
            .eq('movie_id', movieId)
            .single()
        ])

        setIsInWishlist(!!wishlistRes.data)
        setUserReview(reviewRes.data)
      } catch (error) {
        console.error('Error checking user interactions:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUserInteractions()
  }, [movieId, userId])

  const handleWishlistToggle = async () => {
    if (!userId) {
      router.push('/auth')
      return
    }

    try {
      if (isInWishlist) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', userId)
          .eq('movie_id', movieId)

        toast({
          title: 'Removed from wishlist',
          description: 'The movie has been removed from your wishlist.'
        })
      } else {
        await supabase
          .from('wishlists')
          .insert({
            user_id: userId,
            movie_id: movieId
          })

        toast({
          title: 'Added to wishlist',
          description: 'The movie has been added to your wishlist.'
        })
      }

      setIsInWishlist(!isInWishlist)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast({
        title: 'Error',
        description: 'There was an error updating your wishlist.',
        variant: 'destructive'
      })
    }
  }

  const handleReviewSubmit = async () => {
    if (!userId) {
      router.push('/auth')
      return
    }

    if (reviewRating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting your review.',
        variant: 'destructive'
      })
      return
    }

    try {
      if (userReview) {
        // Update existing review
        await supabase
          .from('reviews')
          .update({
            rating: reviewRating,
            content: reviewContent.trim() || null
          })
          .eq('id', userReview.id)

        toast({
          title: 'Review updated',
          description: 'Your review has been updated successfully.'
        })
      } else {
        // Create new review
        await supabase
          .from('reviews')
          .insert({
            user_id: userId,
            movie_id: movieId,
            rating: reviewRating,
            content: reviewContent.trim() || null
          })

        toast({
          title: 'Review submitted',
          description: 'Your review has been submitted successfully.'
        })
      }

      setUserReview({
        id: userReview?.id || '',
        rating: reviewRating,
        content: reviewContent
      })
      setIsReviewDialogOpen(false)
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: 'Error',
        description: 'There was an error submitting your review.',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Wishlist Button */}
      <Button
        variant={isInWishlist ? 'destructive' : 'default'}
        onClick={handleWishlistToggle}
      >
        {isInWishlist ? (
          <>
            <Minus className="mr-2 h-4 w-4" />
            Remove from Wishlist
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add to Wishlist
          </>
        )}
      </Button>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Star className="mr-2 h-4 w-4" />
            {userReview ? 'Edit Review' : 'Write Review'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userReview ? 'Edit Your Review' : 'Write a Review'}
            </DialogTitle>
            <DialogDescription>
              Share your thoughts about this movie with other users.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Rating Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <Button
                    key={rating}
                    variant={reviewRating === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReviewRating(rating)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>

            {/* Review Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Review (Optional)</label>
              <Textarea
                placeholder="Write your review here..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={5}
              />
            </div>

            {/* Submit Button */}
            <Button onClick={handleReviewSubmit} className="w-full">
              {userReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}