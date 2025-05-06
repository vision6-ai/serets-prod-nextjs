import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase-types';
import { Locale } from '@/config/i18n';
import slugify from 'slugify';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  author_name: string;
  author_bio: string | null;
  author_avatar_url: string | null;
  status: 'published' | 'draft';
  movie_id: string;
  movie_rating: number | null;
  movie_release_date: string | null;
  genre_ids: string[];
  genre_names: string[];
  tag_ids?: string[];
  tag_names?: string[];
  pros?: string[];
  cons?: string[];
}

/**
 * Fetches blog posts based on movie reviews
 * This combines movie data with review data to create blog posts
 */
export async function getBlogPosts({
  locale,
  limit = 10,
  offset = 0,
  featured = false,
  genreId = null,
}: {
  locale: Locale;
  limit?: number;
  offset?: number;
  featured?: boolean;
  genreId?: string | null;
}) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // First, fetch high-quality reviews with substantial content
  let reviewsQuery = supabase
    .from('reviews')
    .select('id, movie_id, user_id, rating, content, created_at, updated_at')
    .not('content', 'is', null)
    .gt('rating', 7) // Only reviews with high ratings
    .order('created_at', { ascending: false });

  // Apply limit and offset
  reviewsQuery = reviewsQuery.range(offset, offset + limit - 1);

  const { data: reviews, error: reviewsError } = await reviewsQuery;

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError);
    return { data: [], count: 0 };
  }

  // Get movie IDs from reviews
  const movieIds = [...new Set(reviews.map(review => review.movie_id))];

  if (movieIds.length === 0) {
    return { data: [], count: 0 };
  }

  // Fetch movies data
  const { data: movies, error: moviesError } = await supabase
    .from('movies')
    .select('id, slug, release_date, rating')
    .in('id', movieIds);

  if (moviesError) {
    console.error('Error fetching movies:', moviesError);
    return { data: [], count: 0 };
  }

  // Create a map of movies
  const moviesMap = new Map();
  movies.forEach(movie => {
    moviesMap.set(movie.id, movie);
  });

  // Fetch movie translations
  const { data: movieTranslations, error: translationsError } = await supabase
    .from('movie_translations')
    .select('movie_id, title, synopsis, poster_url, language_code')
    .in('movie_id', movieIds)
    .eq('language_code', locale);

  if (translationsError) {
    console.error('Error fetching movie translations:', translationsError);
    return { data: [], count: 0 };
  }

  // Create a map of movie translations
  const translationsMap = new Map();
  movieTranslations.forEach(translation => {
    translationsMap.set(translation.movie_id, translation);
  });

  // Fetch user profiles
  const userIds = [...new Set(reviews.map(review => review.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return { data: [], count: 0 };
  }

  // Create a map of profiles
  const profilesMap = new Map();
  profiles.forEach(profile => {
    profilesMap.set(profile.id, profile);
  });

  // Fetch genre information for each movie
  const { data: movieGenres, error: movieGenresError } = await supabase
    .from('movie_genres')
    .select('id, movie_id, genre_id')
    .in('movie_id', movieIds);

  if (movieGenresError) {
    console.error('Error fetching movie genres:', movieGenresError);
    return { data: [], count: 0 };
  }

  // Group genres by movie
  const movieGenresMap = new Map();
  movieGenres.forEach(mg => {
    if (!movieGenresMap.has(mg.movie_id)) {
      movieGenresMap.set(mg.movie_id, []);
    }
    movieGenresMap.get(mg.movie_id).push(mg.genre_id);
  });

  // Fetch genre data
  const genreIds = [...new Set(movieGenres.map(mg => mg.genre_id))];
  const { data: genres, error: genresError } = await supabase
    .from('genres')
    .select('id, slug');

  if (genresError) {
    console.error('Error fetching genres:', genresError);
    return { data: [], count: 0 };
  }

  // Fetch genre translations
  const { data: genreTranslations, error: genreTransError } = await supabase
    .from('genre_translations')
    .select('genre_id, name, language_code')
    .in('genre_id', genreIds)
    .eq('language_code', locale);

  if (genreTransError) {
    console.error('Error fetching genre translations:', genreTransError);
    return { data: [], count: 0 };
  }

  // Create a map of genre translations
  const genreTranslationsMap = new Map();
  genreTranslations.forEach(translation => {
    genreTranslationsMap.set(translation.genre_id, translation);
  });

  // Combine all data to create blog posts
  const blogPosts = reviews.map(review => {
    const movie = moviesMap.get(review.movie_id);
    const translation = translationsMap.get(review.movie_id);
    const profile = profilesMap.get(review.user_id);
    const movieGenreIds = movieGenresMap.get(review.movie_id) || [];
    
    const genreNames = movieGenreIds
      .map(genreId => {
        const translation = genreTranslationsMap.get(genreId);
        return translation?.name || '';
      })
      .filter(Boolean);
    
    // Create blog post slug
    const blogSlug = `${movie?.slug || ''}-review-${slugify(profile?.full_name || 'anonymous')}`;
    
    // Create excerpt from content
    const excerpt = review.content
      ? review.content.substring(0, 150) + (review.content.length > 150 ? '...' : '')
      : '';

    return {
      id: review.id,
      title: `${translation?.title || movie?.slug || 'Movie'} Review`,
      slug: blogSlug,
      content: review.content || '',
      excerpt,
      featured_image: translation?.poster_url || null,
      published_at: review.created_at,
      author_name: profile?.full_name || 'Anonymous',
      author_bio: null, // Use null since we don't have a bio field in the profiles table
      author_avatar_url: profile?.avatar_url || null,
      status: 'published',
      movie_id: review.movie_id,
      movie_rating: movie?.rating || null,
      movie_release_date: movie?.release_date || null,
      genre_ids: movieGenreIds,
      genre_names: genreNames,
    } as BlogPost;
  });
  
  // Count total available blog posts
  const { count, error: countError } = await supabase
    .from('reviews')
    .select('id', { count: 'exact' })
    .not('content', 'is', null)
    .gt('rating', 7);
    
  if (countError) {
    console.error('Error counting reviews:', countError);
    return { data: blogPosts, count: blogPosts.length };
  }

  return { data: blogPosts, count: count || 0 };
}

/**
 * Fetches a blog post by slug
 */
export async function getBlogPostBySlug(slug: string, locale: Locale) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_post_categories (
        category_id,
        blog_categories (id, name, slug)
      ),
      blog_post_tags (
        tag_id,
        blog_tags (id, name, slug)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }

  // Transform the data to match the BlogPost interface
  const genreIds = data.blog_post_categories?.map(
    (category: { category_id: string }) => category.category_id
  ) || [];
  
  const genreNames = data.blog_post_categories?.map(
    (category: { blog_categories?: { name: string } }) => category.blog_categories?.name || ''
  ).filter(Boolean) || [];
  
  // Extract tag information
  const tagIds = data.blog_post_tags?.map(
    (tag: { tag_id: string }) => tag.tag_id
  ) || [];
  
  const tagNames = data.blog_post_tags?.map(
    (tag: { blog_tags?: { name: string } }) => tag.blog_tags?.name || ''
  ).filter(Boolean) || [];

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt || '',
    featured_image: data.featured_image,
    published_at: data.published_at,
    author_name: data.author_name,
    author_bio: data.author_bio,
    author_avatar_url: data.author_avatar_url,
    status: data.status,
    movie_id: data.movie_id || '',
    movie_rating: data.rating || null,
    movie_release_date: null,
    genre_ids: genreIds,
    genre_names: genreNames,
    tag_ids: tagIds,
    tag_names: tagNames,
  } as BlogPost;
}

/**
 * Fetches related blog posts
 */
export async function getRelatedBlogPosts(post: BlogPost, locale: Locale, limit = 3) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // First try to find posts in the same category
  let { data: relatedByCategoryData } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_post_categories!inner (
        category_id,
        blog_categories (id, name, slug)
      ),
      blog_post_tags (
        tag_id,
        blog_tags (id, name, slug)
      )
    `)
    .eq('status', 'published')
    .neq('id', post.id)
    .in('blog_post_categories.category_id', post.genre_ids)
    .order('published_at', { ascending: false })
    .limit(limit);

  // If not enough posts found by category, fill with recent posts
  if (!relatedByCategoryData || relatedByCategoryData.length < limit) {
    const { data: recentPostsData } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_post_categories (
          category_id,
          blog_categories (id, name, slug)
        ),
        blog_post_tags (
          tag_id,
          blog_tags (id, name, slug)
        )
      `)
      .eq('status', 'published')
      .neq('id', post.id)
      .order('published_at', { ascending: false })
      .limit(limit);

    // Combine the results
    if (recentPostsData) {
      const existingIds = new Set((relatedByCategoryData || []).map(p => p.id));
      const additionalPosts = recentPostsData.filter(p => !existingIds.has(p.id));
      const remaining = limit - (relatedByCategoryData?.length || 0);
      
      relatedByCategoryData = [
        ...(relatedByCategoryData || []),
        ...additionalPosts.slice(0, remaining)
      ];
    }
  }

  // Transform the data to match the BlogPost interface
  return (relatedByCategoryData || []).map(post => {
    const genreIds = post.blog_post_categories?.map(
      (category: { category_id: string }) => category.category_id
    ) || [];
    
    const genreNames = post.blog_post_categories?.map(
      (category: { blog_categories?: { name: string } }) => category.blog_categories?.name || ''
    ).filter(Boolean) || [];
    
    const tagIds = post.blog_post_tags?.map(
      (tag: { tag_id: string }) => tag.tag_id
    ) || [];
    
    const tagNames = post.blog_post_tags?.map(
      (tag: { blog_tags?: { name: string } }) => tag.blog_tags?.name || ''
    ).filter(Boolean) || [];

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image: post.featured_image,
      published_at: post.published_at,
      author_name: post.author_name,
      author_bio: post.author_bio,
      author_avatar_url: post.author_avatar_url,
      status: post.status,
      movie_id: post.movie_id || '',
      movie_rating: post.rating || null,
      movie_release_date: null,
      genre_ids: genreIds,
      genre_names: genreNames,
      tag_ids: tagIds,
      tag_names: tagNames,
    } as BlogPost;
  });
}

/**
 * Function to fetch directly from the blog_posts table
 */
export async function fetchBlogPosts({
  locale,
  limit = 10,
  offset = 0,
  genreId = null,
}: {
  locale: Locale;
  limit?: number;
  offset?: number;
  genreId?: string | null;
}) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Start building the query
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      blog_post_categories!inner (
        category_id,
        blog_categories (id, name, slug)
      ),
      blog_post_tags (
        tag_id,
        blog_tags (id, name, slug)
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Apply limit and offset
  query = query.range(offset, offset + limit - 1);

  // Filter by genre if provided
  if (genreId) {
    // Get blog posts that have this specific category
    query = query.eq('blog_post_categories.category_id', genreId);
  }

  const { data: posts, error, count } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    return { data: [], count: 0 };
  }

  // Transform the data to match the BlogPost interface
  const blogPosts = posts?.map(post => {
    // Extract genre IDs and names from categories
    const genreIds = post.blog_post_categories?.map(
      (category: { category_id: string }) => category.category_id
    ) || [];
    
    const genreNames = post.blog_post_categories?.map(
      (category: { blog_categories?: { name: string } }) => category.blog_categories?.name || ''
    ).filter(Boolean) || [];
    
    // Extract tag information
    const tagIds = post.blog_post_tags?.map(
      (tag: { tag_id: string }) => tag.tag_id
    ) || [];
    
    const tagNames = post.blog_post_tags?.map(
      (tag: { blog_tags?: { name: string } }) => tag.blog_tags?.name || ''
    ).filter(Boolean) || [];

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image: post.featured_image,
      published_at: post.published_at,
      author_name: post.author_name,
      author_bio: post.author_bio,
      author_avatar_url: post.author_avatar_url,
      status: post.status,
      movie_id: post.movie_id || '',
      movie_rating: post.rating || null,
      movie_release_date: null,
      genre_ids: genreIds,
      genre_names: genreNames,
      tag_ids: tagIds,
      tag_names: tagNames,
    } as BlogPost;
  }) || [];

  // Count the total number of blog posts
  let totalCount = count || 0;
  
  if (totalCount === 0) {
    // Get a total count if not provided
    const { count: exactCount, error: countError } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact' })
      .eq('status', 'published');
      
    if (!countError) {
      totalCount = exactCount || 0;
    }
  }

  return { data: blogPosts, count: totalCount };
} 