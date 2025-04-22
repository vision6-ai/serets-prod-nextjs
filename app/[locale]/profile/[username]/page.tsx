import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProfileContainer } from '@/components/profile/ProfileContainer';
import type { Metadata, ResolvingMetadata } from 'next';

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: { username: string, locale: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const username = params.username;
  
  // Create Supabase client
  const supabase = createServerComponentClient({ cookies });
  
  try {
    // Fetch user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('username', username)
      .single();
    
    if (!profile) {
      return {
        title: 'Profile Not Found',
      };
    }
    
    const displayName = profile.full_name || username;
    
    return {
      title: `${displayName}'s Profile | Serets`,
      description: `View ${displayName}'s movie watchlist and reviews on Serets.`,
      openGraph: {
        title: `${displayName}'s Profile | Serets`,
        description: `View ${displayName}'s movie watchlist and reviews on Serets.`,
        type: 'profile',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'User Profile | Serets',
      description: 'View user profile on Serets.',
    };
  }
}

export default async function PublicProfilePage({ 
  params 
}: { 
  params: { username: string, locale: string }
}) {
  const { username, locale } = params;
  
  try {
    // Create Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, is_watchlist_public, is_reviews_public')
      .eq('username', username)
      .single();
    
    if (profileError || !profile) {
      notFound();
    }
    
    // Check if the current user is the profile owner
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user?.id === profile.id;
    
    // Set default values for null fields
    const safeProfile = {
      ...profile,
      is_watchlist_public: profile.is_watchlist_public ?? true,
      is_reviews_public: profile.is_reviews_public ?? true
    };
    
    // Get profile stats
    const [watchlistCountResult, reviewsCountResult] = await Promise.all([
      // Count watchlist items
      supabase
        .from('watchlists')
        .select('movie_id', { count: 'exact', head: true })
        .eq('user_id', profile.id),
        
      // Count reviews
      supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id),
    ]);
    
    const stats = {
      watchlistCount: watchlistCountResult.count || 0,
      reviewsCount: reviewsCountResult.count || 0
    };
    
    return (
      <ProfileContainer 
        profile={safeProfile}
        stats={stats}
        isOwner={isOwner}
        locale={locale}
      />
    );
  } catch (error) {
    console.error('Error loading profile page:', error);
    notFound();
  }
} 