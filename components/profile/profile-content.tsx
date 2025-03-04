'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase'
import { User as LucideUser, LogOut, Star, Clock, ThumbsUp, Save } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  username: string | null
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

type DatabaseWishlistItem = {
  id: string
  notes: string | null
  created_at: string
  movie: Movie
}

type DatabaseReview = {
  id: string
  rating: number
  content: string | null
  helpful_votes: number
  created_at: string
  movie: Movie
}

export function ProfileContent({ userId }: { userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('Profile')
  const supabase = createClient()
  
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [wishlist, setWishlist] = useState<WishlistMovie[]>([])
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Fetch profile data
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (profileData) {
            setProfile(profileData)
            setDisplayName(profileData.display_name || '')
            setUsername(profileData.username || '')
            setBio(profileData.bio || '')
            setWebsite(profileData.website || '')
            setLocation(profileData.location || '')
          } else {
            // Create profile if it doesn't exist
            const newProfile = {
              id: user.id,
              username: null,
              display_name: user.user_metadata?.full_name || null,
              bio: null,
              avatar_url: user.user_metadata?.avatar_url || null,
              website: null,
              location: null,
            }
            
            await supabase.from('user_profiles').insert(newProfile)
            setProfile(newProfile)
            setDisplayName(newProfile.display_name || '')
          }
          
          // Fetch wishlist
          const { data: wishlistData } = await supabase
            .from('wishlists')
            .select(`
              id,
              notes,
              created_at,
              movie:movies (
                id,
                title,
                poster_url,
                slug,
                release_date
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            
          if (wishlistData) {
            // Transform the data to match the WishlistMovie type
            // Supabase returns movie as an array when using nested select
            const transformedWishlist = wishlistData.map(item => ({
              ...item,
              movie: Array.isArray(item.movie) && item.movie.length > 0 ? item.movie[0] : item.movie
            }));
            setWishlist(transformedWishlist as unknown as WishlistMovie[]);
          }
          
          // Fetch reviews
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select(`
              id,
              rating,
              content,
              helpful_votes,
              created_at,
              movie:movies (
                id,
                title,
                poster_url,
                slug,
                release_date
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            
          if (reviewsData) {
            // Transform the data to match the UserReview type
            // Supabase returns movie as an array when using nested select
            const transformedReviews = reviewsData.map(item => ({
              ...item,
              movie: Array.isArray(item.movie) && item.movie.length > 0 ? item.movie[0] : item.movie
            }));
            setReviews(transformedReviews as unknown as UserReview[]);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [supabase, userId])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: displayName,
          username: username,
          bio: bio,
          website: website,
          location: location,
        })
        .eq('id', user.id)
        
      if (error) throw error
      
      toast({
        title: t('profileUpdated'),
        description: t('profileUpdateSuccess'),
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: t('updateError'),
        description: t('profileUpdateFailed'),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-primary/20 rounded-md w-1/3"></div>
        <div className="h-64 bg-primary/10 rounded-md"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">{t('myProfile')}</h1>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {t('signOut')}
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="profile">
            <LucideUser className="mr-2 h-4 w-4" />
            {t('profile')}
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Star className="mr-2 h-4 w-4" />
            {t('wishlist')}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <ThumbsUp className="mr-2 h-4 w-4" />
            {t('reviews')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profileInformation')}</CardTitle>
              <CardDescription>{t('manageProfileInfo')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                    <AvatarFallback className="text-2xl">
                      {displayName ? displayName[0].toUpperCase() : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                
                <div className="grid gap-4 flex-1">
                  <div className="grid gap-2">
                    <Label htmlFor="display-name">{t('displayName')}</Label>
                    <Input 
                      id="display-name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={t('displayNamePlaceholder')}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="username">{t('username')}</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('usernamePlaceholder')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bio">{t('bio')}</Label>
                  <Textarea 
                    id="bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t('bioPlaceholder')}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="website">{t('website')}</Label>
                    <Input 
                      id="website" 
                      value={website} 
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder={t('websitePlaceholder')}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="location">{t('location')}</Label>
                    <Input 
                      id="location" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={t('locationPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    {t('saving')}
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('saveChanges')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="wishlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('myWishlist')}</CardTitle>
              <CardDescription>{t('wishlistDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {wishlist.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('noWishlistItems')}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t('wishlistEmpty')}
                  </p>
                  <Button className="mt-4" onClick={() => router.push('/movies')}>
                    {t('browseMovies')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-[2/3] relative">
                        {item.movie.poster_url ? (
                          <img 
                            src={item.movie.poster_url} 
                            alt={item.movie.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">{t('noPoster')}</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium line-clamp-1 mb-1">
                          {item.movie.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {item.movie.release_date 
                              ? new Date(item.movie.release_date).getFullYear() 
                              : t('unknown')}
                          </span>
                        </div>
                        <Button 
                          variant="link" 
                          className="px-0 h-auto mt-2"
                          onClick={() => router.push(`/movies/${item.movie.slug}`)}
                        >
                          {t('viewDetails')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('myReviews')}</CardTitle>
              <CardDescription>{t('reviewsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <ThumbsUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('noReviews')}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t('reviewsEmpty')}
                  </p>
                  <Button className="mt-4" onClick={() => router.push('/movies')}>
                    {t('browseMovies')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <Card key={review.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 aspect-[2/3] md:max-w-[120px]">
                          {review.movie.poster_url ? (
                            <img 
                              src={review.movie.poster_url} 
                              alt={review.movie.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">{t('noPoster')}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">
                              {review.movie.title}
                            </h3>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                              <span className="font-medium">{review.rating}/5</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm mb-3">
                            {review.content || t('noReviewContent')}
                          </p>
                          <div className="flex justify-between items-center">
                            <Button 
                              variant="link" 
                              className="px-0 h-auto"
                              onClick={() => router.push(`/movies/${review.movie.slug}`)}
                            >
                              {t('viewMovie')}
                            </Button>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              <span>{review.helpful_votes} {t('helpfulVotes')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 