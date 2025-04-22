import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

export interface UserReview {
  id: string;
  movieSlug: string;
  movieTitle: string;
  moviePoster: string;
  rating: number;
  review: string;
  date: string;
}

/**
 * Fetches a user's reviews with movie details
 * @param userId The user's ID
 * @param locale The current locale (e.g., 'he', 'en')
 * @param customSupabase Optional custom Supabase client
 * @returns Array of user reviews
 */
export async function fetchUserReviews(
  userId: string,
  locale: string,
  customSupabase?: SupabaseClient
): Promise<UserReview[]> {
  // Use provided Supabase client or create a new one
  const supabase = customSupabase || createClientComponentClient();
  
  console.log(`Fetching reviews for user ${userId} with locale ${locale}`);
  
  // Step 1: Fetch all reviews for this user
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, movie_id, rating, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  console.log('User reviews query result:', { reviewsData, reviewsError });
  
  if (reviewsError) {
    console.error('Reviews fetch error:', reviewsError);
    throw new Error(`Reviews fetch error: ${reviewsError.message}`);
  }
  
  if (!reviewsData || reviewsData.length === 0) {
    return [];
  }
  
  // Step 2: Get all movie IDs from the reviews
  const movieIds = reviewsData.map(review => review.movie_id);
  
  // Step 3: Fetch base movie data (including slug)
  const { data: moviesData, error: moviesError } = await supabase
    .from('movies')
    .select('id, slug')
    .in('id', movieIds);
    
  console.log('Movies base data query result:', { moviesData, moviesError });
  
  if (moviesError) {
    console.error('Movies fetch error:', moviesError);
    throw new Error(`Movies fetch error: ${moviesError.message}`);
  }
  
  // Step 4: Fetch movie translations for the current locale
  const { data: translationsData, error: translationsError } = await supabase
    .from('movie_translations')
    .select('movie_id, title, poster_url')
    .in('movie_id', movieIds)
    .eq('language_code', locale);
    
  console.log('Movie translations query result:', { translationsData, translationsError });
  
  if (translationsError) {
    console.error('Movie translations fetch error:', translationsError);
    throw new Error(`Movie translations fetch error: ${translationsError.message}`);
  }
  
  // Step 5: Create maps for easier lookup
  const moviesMap = moviesData.reduce((acc, movie) => {
    acc[movie.id] = movie;
    return acc;
  }, {} as Record<string, any>);
  
  const translationsMap = translationsData.reduce((acc, translation) => {
    acc[translation.movie_id] = translation;
    return acc;
  }, {} as Record<string, any>);
  
  // Step 6: Combine all data
  return reviewsData.map(review => {
    const movieId = review.movie_id;
    const movie = moviesMap[movieId] || {};
    const translation = translationsMap[movieId] || {};
    
    // Format the date based on locale
    const dateStr = review.created_at ? 
      format(new Date(review.created_at), locale === 'he' ? 'dd/MM/yyyy' : 'MMM d, yyyy') : 
      '';
    
    return {
      id: review.id,
      movieSlug: movie.slug || 'unknown',
      movieTitle: translation.title || 'Unknown Movie',
      moviePoster: translation.poster_url || '',
      rating: review.rating,
      review: review.content || '',
      date: dateStr
    };
  });
} 