'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchUserWatchlist, WatchlistMovie } from '@/lib/fetchUserWatchlist';
import { fetchUserReviews, UserReview } from '@/lib/fetchUserReviews';
import { PublicProfileHeader } from './PublicProfileHeader';
import { ProfileWatchlist } from './ProfileWatchlist';
import { ProfileReviews } from './ProfileReviews';
import { ProfileStats } from './ProfileStats';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Facebook, Twitter, Pencil, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QRCode from 'qrcode.react';

interface ProfileProps {
  id: string;
  full_name: string | null;
  username: string;
  avatar_url: string | null;
  is_watchlist_public: boolean;
  is_reviews_public: boolean;
}

interface StatsProps {
  watchlistCount: number;
  reviewsCount: number;
}

interface ProfileContainerProps {
  profile: ProfileProps;
  stats: StatsProps;
  isOwner: boolean;
  locale: string;
}

export function ProfileContainer({ profile, stats, isOwner, locale }: ProfileContainerProps) {
  const [activeTab, setActiveTab] = useState('watchlist');
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  // Default to true for null/undefined values
  const [watchlistPublic, setWatchlistPublic] = useState<boolean>(profile.is_watchlist_public ?? true);
  const [reviewsPublic, setReviewsPublic] = useState<boolean>(profile.is_reviews_public ?? true);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  
  // Ensure state is updated when profile props change
  useEffect(() => {
    setWatchlistPublic(profile.is_watchlist_public ?? true);
    setReviewsPublic(profile.is_reviews_public ?? true);
  }, [profile]);

  // Load watchlist
  useEffect(() => {
    const loadWatchlist = async () => {
      setWatchlistLoading(true);
      try {
        // Only fetch if the user is the owner or if the watchlist is public
        if (isOwner || watchlistPublic) {
          const movies = await fetchUserWatchlist(profile.id, locale);
          setWatchlist(movies);
        }
      } catch (error) {
        console.error('Error loading watchlist:', error);
      } finally {
        setWatchlistLoading(false);
      }
    };
    
    loadWatchlist();
  }, [profile.id, watchlistPublic, isOwner, locale]);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        // Only fetch if the user is the owner or if the reviews are public
        if (isOwner || reviewsPublic) {
          const userReviews = await fetchUserReviews(profile.id, locale);
          setReviews(userReviews);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    loadReviews();
  }, [profile.id, reviewsPublic, isOwner, locale]);

  // Handle privacy toggle for watchlist
  const handleWatchlistPrivacyToggle = async () => {
    if (!isOwner) return;
    
    try {
      const newValue = !watchlistPublic;
      
      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ is_watchlist_public: newValue })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // Update local state
      setWatchlistPublic(newValue);
      
      toast({
        title: newValue ? 'Watchlist is now public' : 'Watchlist is now private',
        description: `People ${newValue ? 'can' : 'cannot'} see your watchlist`,
      });
    } catch (error) {
      console.error('Error updating watchlist privacy:', error);
      
      // Reset to profile value on error
      setWatchlistPublic(profile.is_watchlist_public ?? true);
      
      toast({
        title: 'Failed to update settings',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  // Handle privacy toggle for reviews
  const handleReviewsPrivacyToggle = async () => {
    if (!isOwner) return;
    
    try {
      const newValue = !reviewsPublic;
      
      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ is_reviews_public: newValue })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // Update local state
      setReviewsPublic(newValue);
      
      toast({
        title: newValue ? 'Reviews are now public' : 'Reviews are now private',
        description: `People ${newValue ? 'can' : 'cannot'} see your reviews`,
      });
    } catch (error) {
      console.error('Error updating reviews privacy:', error);
      
      // Reset to profile value on error
      setReviewsPublic(profile.is_reviews_public ?? true);
      
      toast({
        title: 'Failed to update settings',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container py-8">
      <PublicProfileHeader
        avatarUrl={profile.avatar_url}
        displayName={profile.full_name || profile.username}
        username={profile.username}
        isOwner={isOwner}
        locale={locale}
      />
      
      <ProfileStats 
        watchlistCount={stats.watchlistCount} 
        reviewsCount={stats.reviewsCount} 
      />
      
      {/* Only show privacy settings to the profile owner */}
      {isOwner && (
        <div className="my-6 p-4 bg-muted rounded-xl">
          <h3 className="font-semibold mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="watchlist-public">Watchlist Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  {watchlistPublic ? 'Your watchlist is visible to everyone' : 'Your watchlist is private'}
                </p>
              </div>
              <Switch
                id="watchlist-public"
                checked={watchlistPublic}
                onCheckedChange={handleWatchlistPrivacyToggle}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reviews-public">Reviews Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  {reviewsPublic ? 'Your reviews are visible to everyone' : 'Your reviews are private'}
                </p>
              </div>
              <Switch
                id="reviews-public"
                checked={reviewsPublic}
                onCheckedChange={handleReviewsPrivacyToggle}
              />
            </div>
          </div>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="watchlist">
            רשימת הצפייה
          </TabsTrigger>
          <TabsTrigger value="reviews">
            ביקורות
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="watchlist" className="mt-6">
          {!isOwner && !watchlistPublic ? (
            <div className="py-10 text-center text-muted-foreground">
              רשימת הצפייה של המשתמש היא פרטית
            </div>
          ) : watchlistLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              טוען רשימת צפייה...
            </div>
          ) : watchlist.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              אין סרטים ברשימת הצפייה
            </div>
          ) : (
            <ProfileWatchlist movies={watchlist} />
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          {!isOwner && !reviewsPublic ? (
            <div className="py-10 text-center text-muted-foreground">
              הביקורות של המשתמש הן פרטיות
            </div>
          ) : reviewsLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              טוען ביקורות...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              אין ביקורות
            </div>
          ) : (
            <ProfileReviews reviews={reviews} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 