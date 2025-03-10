import { Locale } from '@/config/i18n';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase-types';

/**
 * Get content in the specified language with fallback to default language
 * @param locale Current locale
 * @param defaultLocale Default locale to fall back to
 * @returns Function to get content in the correct language
 */
export function getLocalizedContent<T extends Record<string, any>>(
  locale: Locale,
  defaultLocale: Locale = 'en'
) {
  /**
   * Get the value in the current language or fall back to default language
   * @param translations Object containing translations for different languages
   * @param field Field name to get
   * @returns The localized content
   */
  return function getContent(
    translations: Record<string, T>,
    field: keyof T
  ): T[keyof T] | null {
    // Try to get the content in the current language
    if (translations[locale] && translations[locale][field] !== null && translations[locale][field] !== undefined) {
      return translations[locale][field];
    }
    
    // Fall back to default language
    if (translations[defaultLocale] && translations[defaultLocale][field] !== null && translations[defaultLocale][field] !== undefined) {
      return translations[defaultLocale][field];
    }
    
    // If no content is found, return null
    return null;
  };
}

/**
 * Fetch translations for a specific entity
 * @param supabase Supabase client
 * @param table Translation table name
 * @param idField ID field name
 * @param id Entity ID
 * @returns Object with translations grouped by language
 */
export async function fetchTranslations<T>(
  supabase: ReturnType<typeof createClient<Database>>,
  table: 'movie_translations' | 'actor_translations' | 'genre_translations' | 'award_translations' | 'seo_meta_translations',
  idField: string,
  id: string
): Promise<Record<string, T>> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(idField, id);

  if (error || !data) {
    console.error(`Error fetching translations from ${table}:`, error);
    return {};
  }

  // Group translations by language
  return data.reduce((acc, item) => {
    acc[item.language_code] = item as unknown as T;
    return acc;
  }, {} as Record<string, T>);
}

// Define specific types for translations
type MovieTranslation = {
  title: string;
  synopsis: string | null;
};

type ActorTranslation = {
  name: string;
  biography: string | null;
};

type GenreTranslation = {
  name: string;
};

/**
 * Get movie translations with proper language fallback
 * @param supabase Supabase client
 * @param movieId Movie ID
 * @param locale Current locale
 * @returns Movie translations with proper language fallback
 */
export async function getMovieTranslations(
  supabase: ReturnType<typeof createClient<Database>>,
  movieId: string,
  locale: Locale
) {
  const translations = await fetchTranslations<MovieTranslation>(
    supabase,
    'movie_translations',
    'movie_id',
    movieId
  );
  
  const getContent = getLocalizedContent<MovieTranslation>(locale);
  
  return {
    title: getContent(translations, 'title'),
    synopsis: getContent(translations, 'synopsis'),
  };
}

/**
 * Get actor translations with proper language fallback
 * @param supabase Supabase client
 * @param actorId Actor ID
 * @param locale Current locale
 * @returns Actor translations with proper language fallback
 */
export async function getActorTranslations(
  supabase: ReturnType<typeof createClient<Database>>,
  actorId: string,
  locale: Locale
) {
  const translations = await fetchTranslations<ActorTranslation>(
    supabase,
    'actor_translations',
    'actor_id',
    actorId
  );
  
  const getContent = getLocalizedContent<ActorTranslation>(locale);
  
  return {
    name: getContent(translations, 'name'),
    biography: getContent(translations, 'biography'),
  };
}

/**
 * Get genre translations with proper language fallback
 * @param supabase Supabase client
 * @param genreId Genre ID
 * @param locale Current locale
 * @returns Genre translations with proper language fallback
 */
export async function getGenreTranslations(
  supabase: ReturnType<typeof createClient<Database>>,
  genreId: string,
  locale: Locale
) {
  const translations = await fetchTranslations<GenreTranslation>(
    supabase,
    'genre_translations',
    'genre_id',
    genreId
  );
  
  const getContent = getLocalizedContent<GenreTranslation>(locale);
  
  return {
    name: getContent(translations, 'name'),
  };
} 