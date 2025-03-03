'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Star, ThumbsUp } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import { AuthDialog } from '@/components/auth/auth-dialog'
import { createBrowserClient } from '@supabase/ssr'
import { useToast } from '@/hooks/use-toast'

interface Review {
  id: string
  user_id: string
  rating: number
  content: string | null
  helpful_votes: number
  created_at: string
  user: {
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface MovieReviewsProps {
  movieId: string
  userId?: string | null
}

export function MovieReviews({ movieId, userId }: MovieReviewsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          rating,
          content,
          helpful_votes,
          created_at,
          user:user_profiles!user_id(
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const typedData = data as unknown as Review[]
      setReviews(typedData || [])
      
      if (userId) {
        const userReview = typedData?.find(review => review.user_id === userId) || null
        setUserReview(userReview)
        if (userReview) {
          setReviewContent(userReview.content || '')
          setReviewRating(userReview.rating)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        title: 'Error',
        description: 'Failed to load reviews. Please try again later.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [movieId, userId, supabase, toast])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleReviewSubmit = async () => {
    if (!userId) {
      setShowAuthDialog(true)
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
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: reviewRating,
            content: reviewContent.trim() || null
          })
          .eq('id', userReview.id)

        if (error) throw error

        toast({
          title: 'Review updated',
          description: 'Your review has been updated successfully.'
        })
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: userId,
            movie_id: movieId,
            rating: reviewRating,
            content: reviewContent.trim() || null
          })

        if (error) throw error

        toast({
          title: 'Review submitted',
          description: 'Your review has been submitted successfully.'
        })
      }

      setIsDialogOpen(false)
      fetchReviews() // Refresh reviews
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
    return <div>Loading reviews...</div>
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'N/A'

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Reviews</h2>
          <div className="text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} • Average rating: {averageRating}
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Be the first to review this movie!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  {review.user?.avatar_url ? (
                    <img
                      src={review.user.avatar_url}
                      alt={review.user.display_name || review.user.username || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold">
                        {(review.user?.username || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Review Content */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {review.user?.display_name || review.user?.username || 'Anonymous'}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1">{review.rating}/10</span>
                      </div>
                    </div>
                    
                    {review.content && (
                      <p className="text-sm mb-2">{review.content}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      {review.helpful_votes > 0 && (
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.helpful_votes} helpful</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </div>
  )
}