'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/components/auth/auth-dialog'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface WishlistButtonProps {
  movieId: string
  userId?: string | null
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  className?: string
}

export function WishlistButton({ 
  movieId, 
  userId, 
  variant = 'ghost',
  size = 'icon',
  showText = false,
  className = ''
}: WishlistButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkWishlist() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', userId)
          .eq('movie_id', movieId)
          .single()

        setIsInWishlist(!!data)
      } catch (error) {
        console.error('Error checking wishlist:', error)
      } finally {
        setLoading(false)
      }
    }

    checkWishlist()
  }, [movieId, userId])

  const handleClick = async () => {
    if (!userId) {
      setShowAuthDialog(true)
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

  if (loading) {
    return null
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`${isInWishlist ? 'text-red-500 hover:text-red-600' : ''} ${className}`}
      >
        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        {showText && (
          <span className="ml-2">
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </span>
        )}
      </Button>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </>
  )
}