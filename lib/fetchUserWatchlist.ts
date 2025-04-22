import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';

export interface WatchlistMovie {
  id: string;
  slug: string;
  title: string;
  year: number;
  posterUrl: string;
}

/**
 * Fetches a user's watchlist with movie details
 * @param userId The user's ID
 * @param locale The current locale (e.g., 'he', 'en')
 * @param customSupabase Optional custom Supabase client
 * @returns Array of watchlist movies
 */
export async function fetchUserWatchlist(
  userId: string,
  locale: string,
  customSupabase?: SupabaseClient
): Promise<WatchlistMovie[]> {
  // Use provided Supabase client or create a new one
  const supabase = customSupabase || createClientComponentClient();
  
  console.log(`Fetching watchlist for user ${userId} with locale ${locale}`);
  
  // Fetch all movie_ids in user's watchlist
  const { data: watchlistRows, error: watchlistError } = await supabase
    .from('watchlists')
    .select('movie_id')
    .eq('user_id', userId);
  
  console.log('Watchlist query result:', { watchlistRows, watchlistError });
  
  if (watchlistError) {
    console.error('Watchlist fetch error:', watchlistError);
    throw new Error(`Watchlist fetch error: ${watchlistError.message}`);
  }
  
  const movieIds = watchlistRows?.map(row => row.movie_id) || [];
  console.log('Movie IDs from watchlist:', movieIds);
  
  if (movieIds.length === 0) {
    return [];
  }
  
  // First, get the base movie data including slug from the movies table
  const { data: moviesData, error: moviesError } = await supabase
    .from('movies')
    .select('id, slug, release_date')
    .in('id', movieIds);
    
  console.log('Movies base data query result:', { moviesData, moviesError });
  
  if (moviesError) {
    console.error('Movies base data fetch error:', moviesError);
    throw new Error(`Movies fetch error: ${moviesError.message}`);
  }
  
  // Then, get the translations for these movies in the specified locale
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
  
  // Now merge the data
  return moviesData.map(movie => {
    // Find corresponding translation
    const translation = translationsData.find(t => t.movie_id === movie.id) || {
      title: 'Unknown Title',
      poster_url: ''
    };
    
    return {
      id: movie.id,
      slug: movie.slug,
      title: translation.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
      posterUrl: translation.poster_url || ''
    };
  });
} 