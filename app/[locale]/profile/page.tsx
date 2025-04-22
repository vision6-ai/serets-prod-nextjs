'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { redirect, useParams } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileWatchlist } from '@/components/profile/ProfileWatchlist'
import { ProfileReviews } from '@/components/profile/ProfileReviews'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { fetchUserWatchlist, WatchlistMovie } from '@/lib/fetchUserWatchlist'
import { fetchUserReviews, UserReview } from '@/lib/fetchUserReviews'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([])
  const [watchlistLoading, setWatchlistLoading] = useState(true)
  const [watchlistError, setWatchlistError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const params = useParams();
  const locale = params && typeof params.locale === 'string' ? params.locale : 'en';

  useEffect(() => {
    let isMounted = true;
    console.log('ProfilePage: useEffect start');

    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('ProfilePage: supabase.auth.getUser result', { user, error })
        if (error) throw error
        if (isMounted) {
          setUser(user)
          setDisplayName(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('ProfilePage: onAuthStateChange', { session })
      if (isMounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      isMounted = false;
      subscription.unsubscribe()
      console.log('ProfilePage: cleanup')
    }
  }, [])

  // Fetch watchlist after user is loaded
  useEffect(() => {
    if (!user) return;
    
    const loadWatchlist = async () => {
      setWatchlistLoading(true);
      setWatchlistError(null);
      
      try {
        const movies = await fetchUserWatchlist(user.id, locale);
        setWatchlist(movies);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        setWatchlistError(error instanceof Error ? error.message : 'Failed to load watchlist');
        setWatchlist([]);
      } finally {
        setWatchlistLoading(false);
      }
    };
    
    loadWatchlist();
  }, [user, locale]);

  // Fetch reviews after user is loaded
  useEffect(() => {
    if (!user) return;
    
    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      
      try {
        const userReviews = await fetchUserReviews(user.id, locale);
        setReviews(userReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviewsError(error instanceof Error ? error.message : 'Failed to load reviews');
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    loadReviews();
  }, [user, locale]);

  console.log('ProfilePage: render', { loading, user })

  // Show loading state
  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Redirect if no user
  if (!user) {
    redirect('/auth')
    return null
  }

  // Handle profile update
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: displayName })
        .eq('id', user.id)
      if (error) throw error
      setSuccessMsg('Profile updated successfully!')
      setEditOpen(false)
      // Optionally, update user_metadata locally
      setUser({ ...user, user_metadata: { ...user.user_metadata, full_name: displayName } })
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-8">
      <ProfileHeader
        avatarUrl={undefined}
        displayName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
        username={user.user_metadata?.username || user.email?.split('@')[0] || 'user'}
        isOwner={true}
        onEdit={() => setEditOpen(true)}
      />
      <div className="max-w-2xl mx-auto">
        {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
        {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}
      </div>
      {/* Watchlist Section */}
      {watchlistLoading ? (
        <div className="py-12 text-center text-muted-foreground">טוען רשימת צפייה...</div>
      ) : watchlistError ? (
        <div className="py-12 text-center text-red-500">
          שגיאה בטעינת רשימת הצפייה: {watchlistError}
        </div>
      ) : (
        <ProfileWatchlist movies={watchlist} />
      )}
      
      {/* Reviews Section */}
      {reviewsLoading ? (
        <div className="py-12 text-center text-muted-foreground">טוען ביקורות...</div>
      ) : reviewsError ? (
        <div className="py-12 text-center text-red-500">
          שגיאה בטעינת הביקורות: {reviewsError}
        </div>
      ) : (
        <ProfileReviews reviews={reviews} />
      )}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
