'use client';

import { useState, useEffect } from 'react';
import { createClient, fetchWithRetry } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { MovieReview } from '@/types/review';
import { MovieReviewForm } from './movie-review-form';

interface MovieReviewsProps {
  movieId: string;
}

export function MovieReviews({ movieId }: MovieReviewsProps) {
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const supabase = createClient();
  const t = useTranslations('reviews');
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('MovieReviews: Fetching reviews for movie:', movieId);
      
      const result = await fetchWithRetry(async () => {
        // First get the reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('movie_id', movieId)
          .order('created_at', { ascending: false });

        console.log('Supabase raw query result:', { reviews, reviewsError });
        console.log('SQL equivalent:', `SELECT * FROM reviews WHERE movie_id = '${movieId}' ORDER BY created_at DESC`);
        
        if (reviewsError) throw reviewsError;
        
        if (!reviews || reviews.length === 0) {
          return [];
        }

        console.log('Reviews data:', reviews);
        
        // Get unique user IDs from the reviews
        const userIds = [...new Set(reviews.map(review => review.user_id))];
        console.log('Unique user IDs:', userIds);
        
        // Create a map to store profiles by user ID
        const profilesMap: Record<string, any> = {};
        
        // Fetch profiles for these users if we have any
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);
          
          console.log('Profiles data:', profiles);
          console.log('Profiles error:', profilesError);
          
          if (!profilesError && profiles) {
            // Create a map of profiles by user ID
            profiles.forEach(profile => {
              profilesMap[profile.id] = profile;
            });
          } else {
            console.warn('Failed to fetch profile data:', profilesError);
          }
        }
        
        // If we don't have profiles, let's try to get user data directly
        if (Object.keys(profilesMap).length === 0) {
          console.log('No profiles found in the database. You need to create profiles table and populate it.');
          console.log('Showing fallback user information.');
        }
        
        // Combine review data with profile data
        const reviewsWithProfiles = reviews.map(review => {
          const profile = profilesMap[review.user_id];
          console.log(`Profile for user ${review.user_id.slice(0,8)}:`, profile);
          
          return {
            ...review,
            profiles: profile || null,
            user: {
              id: review.user_id,
              email: profile?.email,
              raw_user_meta_data: {
                full_name: profile?.full_name,
                avatar_url: profile?.avatar_url
              }
            }
          };
        });

        return reviewsWithProfiles;
      });

      console.log('MovieReviews: Fetched reviews:', result);
      console.log('MovieReviews: Setting reviews state with:', result?.length || 0, 'reviews');
      setReviews(result as MovieReview[] || []);
    } catch (error: any) {
      console.error('MovieReviews: Error in fetchReviews:', error);
      setError(error.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('MovieReviews: useEffect triggered with movieId:', movieId);
    if (movieId) {
      fetchReviews();
    }
  }, [movieId]);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  console.log('MovieReviews: RENDER - Total reviews:', reviews.length);
  console.log('MovieReviews: RENDER - Displayed reviews:', displayedReviews.length);
  console.log('MovieReviews: RENDER - Reviews data:', reviews);
  console.log('MovieReviews: RENDER - displayedReviews data:', displayedReviews);
  
  const getUserName = (review: MovieReview) => {
    // Try to get the full name from profiles
    const fullName = review.profiles?.full_name;
    if (fullName) return fullName;
    
    // Try metadata from user object
    const metadata = review.user?.raw_user_meta_data || {};
    if (metadata.full_name) return metadata.full_name;
    
    // Fall back to email
    const email = review.profiles?.email || review.user?.email;
    if (email) return email.split('@')[0];
    
    // Last resort - use part of the user ID
    if (review.user_id) {
      return `User ${review.user_id.substring(0, 8)}`;
    }
    
    return t('anonymousUser');
  };

  const getInitials = (review: MovieReview) => {
    const fullName = review.profiles?.full_name;
    if (fullName) {
      return fullName.split(' ').map(name => name[0]).join('').toUpperCase();
    }
    return review.profiles?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 md:mb-6">{t('userReviews')}</h2>
      
      <MovieReviewForm movieId={movieId} onReviewSubmitted={fetchReviews} />
      
      {loading ? (
        <div className="space-y-4 md:space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 md:space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 md:h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="border rounded-lg p-4 md:p-6 text-center text-destructive">
          <p>{error}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="border rounded-lg p-4 md:p-6 text-center">
          <p className="text-muted-foreground">{t('noReviews')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:space-y-6">
            {displayedReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.user?.raw_user_meta_data?.avatar_url} />
                    <AvatarFallback>{getInitials(review)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm md:text-base">{getUserName(review)}</h4>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-primary font-medium">{review.rating}</span>
                      <Star className="h-3 w-3 md:h-4 md:w-4 fill-primary text-primary" />
                      <span className="text-xs md:text-sm text-muted-foreground ml-1 md:ml-2">
                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                {review.content && (
                  <p className="text-sm md:text-base text-muted-foreground whitespace-pre-line">
                    {review.content}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {reviews.length > 3 && (
            <div className="mt-4 md:mt-6 text-center">
              <Button
                variant="outline"
                size="sm"
                className="w-full md:w-auto"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? t('showLess') : t('showMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
} 