import { createClient } from '@supabase/supabase-js';
import { Locale } from '@/config/i18n';
import type { Movie } from '@/types/movie';
import { Database } from '@/types/supabase-types';

/**
 * Get recommended movies based on the current movie
 * Uses a smart algorithm that considers:
 * 1. Shared genres (primary factor)
 * 2. Similar release years (secondary factor)
 * 3. Similar ratings (tertiary factor)
 * 4. Excludes the current movie from results
 * 
 * @param movieId The ID of the current movie
 * @param locale The current locale for translations
 * @param limit Maximum number of recommendations to return
 * @returns Array of recommended movies
 */
export async function getRecommendedMovies(
  movieId: string,
  locale: Locale,
  limit: number = 10
): Promise<Movie[]> {
  console.log('🔍 getRecommendedMovies called for movieId:', movieId, 'locale:', locale);
  
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Get the current movie's data
    const { data: currentMovie, error: currentMovieError } = await supabase
      .from('movies')
      .select('id, release_date, rating')
      .eq('id', movieId)
      .single();

    if (currentMovieError || !currentMovie) {
      console.error('❌ Error fetching current movie:', currentMovieError);
      return await getFallbackRecommendations(supabase, locale, movieId, limit);
    }
    
    console.log('✅ Current movie data:', currentMovie);

    // 2. Get the genres of the current movie
    const { data: currentGenres, error: genresError } = await supabase
      .from('movie_genres')
      .select('genre_id')
      .eq('movie_id', movieId);

    if (genresError || !currentGenres || currentGenres.length === 0) {
      console.error('❌ Error fetching current movie genres:', genresError);
      return await getFallbackRecommendations(supabase, locale, movieId, limit);
    }
    
    console.log('✅ Current movie genres:', currentGenres);

    const genreIds = currentGenres.map(g => g.genre_id);
    console.log('📊 Genre IDs for recommendations:', genreIds);

    // 3. Find movies that share at least one genre with the current movie
    const { data: candidateMovieIds, error: candidatesError } = await supabase
      .from('movie_genres')
      .select('movie_id')
      .in('genre_id', genreIds)
      .neq('movie_id', movieId) // Exclude the current movie
      .order('movie_id'); // This will help with grouping

    if (candidatesError || !candidateMovieIds || candidateMovieIds.length === 0) {
      console.error('Error fetching candidate movies:', candidatesError);
      return await getFallbackRecommendations(supabase, locale, movieId, limit);
    }

    // Count genre overlaps for each movie (movies with more matching genres will be preferred)
    const genreMatches: Record<string, number> = {};
    candidateMovieIds.forEach(item => {
      const movieId = item.movie_id;
      genreMatches[movieId] = (genreMatches[movieId] || 0) + 1;
    });

    // Get unique movie IDs
    const uniqueMovieIds = [...new Set(candidateMovieIds.map(item => item.movie_id))];

    // 4. Fetch details for these candidate movies
    const { data: candidateMovies, error: detailsError } = await supabase
      .from('movies')
      .select(`
        id, 
        slug, 
        release_date, 
        rating,
        duration
      `)
      .in('id', uniqueMovieIds)
      .order('release_date', { ascending: false }); // Prefer newer movies

    if (detailsError || !candidateMovies) {
      console.error('Error fetching candidate movie details:', detailsError);
      return await getFallbackRecommendations(supabase, locale, movieId, limit);
    }

    // 5. Get translations for the candidate movies
    const { data: translations, error: translationsError } = await supabase
      .from('movie_translations')
      .select('movie_id, title, poster_url, synopsis')
      .in('movie_id', uniqueMovieIds)
      .eq('language_code', locale);

    if (translationsError) {
      console.error('Error fetching movie translations:', translationsError);
      // Continue anyway, we'll use fallbacks
    }

    // Create a map of translations for easier lookup
    const translationMap = new Map();
    translations?.forEach(trans => {
      translationMap.set(trans.movie_id, trans);
    });

    // If we couldn't get translations in the requested locale, try English as fallback
    const missingTranslationIds = uniqueMovieIds.filter(id => !translationMap.has(id));
    
    if (missingTranslationIds.length > 0) {
      const { data: enTranslations } = await supabase
        .from('movie_translations')
        .select('movie_id, title, poster_url, synopsis')
        .in('movie_id', missingTranslationIds)
        .eq('language_code', 'en');

      enTranslations?.forEach(trans => {
        if (!translationMap.has(trans.movie_id)) {
          translationMap.set(trans.movie_id, trans);
        }
      });
    }

    // 6. Apply smart scoring algorithm
    const currentReleaseYear = currentMovie.release_date 
      ? new Date(currentMovie.release_date).getFullYear() 
      : null;
    
    const scoredMovies = candidateMovies.map(movie => {
      // Start with genre match score (most important factor)
      let score = (genreMatches[movie.id] || 0) * 10;
      
      // Add release year proximity score if available
      if (currentReleaseYear && movie.release_date) {
        const movieYear = new Date(movie.release_date).getFullYear();
        const yearDiff = Math.abs(currentReleaseYear - movieYear);
        // Movies from similar years get higher scores
        score += Math.max(0, 5 - yearDiff);
      }
      
      // Add rating proximity score if available
      if (currentMovie.rating !== null && movie.rating !== null) {
        const ratingDiff = Math.abs((currentMovie.rating || 0) - (movie.rating || 0));
        // Movies with similar ratings get higher scores
        score += Math.max(0, 5 - ratingDiff);
      }
      
      // Get translation data
      const translation = translationMap.get(movie.id);
      
      return {
        ...movie,
        title: translation?.title || movie.slug,
        hebrew_title: locale === 'he' ? translation?.title : null,
        poster_url: translation?.poster_url || null,
        synopsis: translation?.synopsis || null,
        score
      };
    });

    // 7. Sort by score (descending) and take the top results
    const recommendations = scoredMovies
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    console.log(`✅ Found ${recommendations.length} recommended movies`);
    
    // If no recommendations found, get fallback recommendations
    if (recommendations.length === 0) {
      console.log('⚠️ No genre-based recommendations found, fetching fallbacks...');
      return await getFallbackRecommendations(supabase, locale, movieId, limit);
    }
    
    return recommendations;
      
  } catch (error) {
    console.error('❌ Error in getRecommendedMovies:', error);
    return await getFallbackRecommendations(supabase, locale, movieId, limit);
  }
}

/**
 * Get fallback movie recommendations
 * Returns popular/recent movies when genre-based recommendations aren't available
 */
async function getFallbackRecommendations(
  supabase: ReturnType<typeof createClient<Database>>,
  locale: Locale,
  currentMovieId: string,
  limit: number = 10
): Promise<Movie[]> {
  console.log('🔄 Getting fallback recommendations');
  
  try {
    // Get recent, well-rated movies as fallbacks
    const { data: popularMovies, error: popularError } = await supabase
      .from('movies')
      .select('id, slug, release_date, rating, duration')
      .neq('id', currentMovieId)
      .order('rating', { ascending: false })
      .limit(limit * 2); // Fetch more than needed to account for any filtering
      
    if (popularError || !popularMovies || popularMovies.length === 0) {
      console.error('❌ Error fetching fallback movies:', popularError);
      return [];
    }
    
    // Get translations for these movies
    const movieIds = popularMovies.map((m: { id: string }) => m.id);
    const { data: translations, error: translationsError } = await supabase
      .from('movie_translations')
      .select('movie_id, title, poster_url, synopsis')
      .in('movie_id', movieIds)
      .eq('language_code', locale);
      
    if (translationsError) {
      console.error('❌ Error fetching fallback translations:', translationsError);
      // Continue anyway with fallbacks
    }
    
    // Create a translation map
    const translationMap = new Map();
    translations?.forEach((trans: { movie_id: string, title: string, poster_url: string, synopsis: string }) => {
      translationMap.set(trans.movie_id, trans);
    });
    
    // Fetch English translations for any missing ones
    const missingTranslationIds = movieIds.filter((id: string) => !translationMap.has(id));
    if (missingTranslationIds.length > 0) {
      const { data: enTranslations } = await supabase
        .from('movie_translations')
        .select('movie_id, title, poster_url, synopsis')
        .in('movie_id', missingTranslationIds)
        .eq('language_code', 'en');
        
      enTranslations?.forEach((trans: { movie_id: string, title: string, poster_url: string, synopsis: string }) => {
        if (!translationMap.has(trans.movie_id)) {
          translationMap.set(trans.movie_id, trans);
        }
      });
    }
    
    // Transform the movies with translations
    const processedMovies = popularMovies
      .map((movie: { id: string, slug: string, release_date: string, rating: number, duration: number }) => {
        const translation = translationMap.get(movie.id);
        if (!translation) return null; // Skip movies without translations
        
        return {
          id: movie.id,
          slug: movie.slug,
          release_date: movie.release_date,
          rating: movie.rating,
          duration: movie.duration,
          title: translation.title || movie.slug,
          hebrew_title: locale === 'he' ? translation.title : null,
          poster_url: translation.poster_url || null,
          synopsis: translation.synopsis || null
        } as Movie;
      })
      .filter(movie => movie !== null) as Movie[]; // Filter out nulls and cast to Movie[]
      
    console.log(`✅ Found ${processedMovies.length} fallback recommendations`);
    return processedMovies;
  } catch (error) {
    console.error('❌ Error in fallback recommendations:', error);
    return [];
  }
} 