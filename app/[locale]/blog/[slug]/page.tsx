import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Locale } from '@/config/i18n'
import { unstable_setRequestLocale } from 'next-intl/server'
import { FilmIcon } from 'lucide-react'
import { BlogHero } from '@/components/blog/blog-hero'
import { BlogContent } from '@/components/blog/blog-content'
import { RelatedPosts } from '@/components/blog/related-posts'
import { BlogSEO } from '@/components/blog/blog-seo'
import { MovieCard } from '@/components/blog/movie-card'
import { getBlogPostBySlug, getRelatedBlogPosts } from '@/lib/blog'
import { Database } from '@/types/supabase-types'

export const revalidate = 3600 // Revalidate every hour

interface BlogPostPageProps {
  params: { locale: Locale; slug: string }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = params
  const blogPost = await getBlogPostBySlug(slug, locale)
  
  if (!blogPost) {
    return {
      title: 'Blog Post Not Found',
    }
  }
  
  return {
    title: blogPost.title,
    description: blogPost.excerpt,
    openGraph: {
      title: blogPost.title,
      description: blogPost.excerpt,
      images: blogPost.featured_image ? [{ url: blogPost.featured_image }] : [],
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = params
  unstable_setRequestLocale(locale)
  
  const blogPost = await getBlogPostBySlug(slug, locale)
  
  if (!blogPost) {
    notFound()
  }
  
  // Fetch additional movie data if there's a movie_id
  let movieData = null
  if (blogPost.movie_id) {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Get movie details
    const { data: movie } = await supabase
      .from('movies')
      .select('id, slug, release_date, rating')
      .eq('id', blogPost.movie_id)
      .single()
    
    if (movie) {
      // Get movie translation for title and poster
      const { data: translation } = await supabase
        .from('movie_translations')
        .select('title, poster_url')
        .eq('movie_id', blogPost.movie_id)
        .eq('language_code', locale)
        .single()
      
      movieData = {
        id: movie.id,
        slug: movie.slug,
        title: translation?.title || movie.slug,
        posterUrl: translation?.poster_url || null,
        rating: movie.rating,
        releaseDate: movie.release_date,
        genres: blogPost.genre_names || []
      }
    }
  }
  
  const relatedPosts = await getRelatedBlogPosts(blogPost, locale)

  return (
    <div className="blog-post-page">
      <BlogSEO post={blogPost} locale={locale} />
      
      <BlogHero 
        title={blogPost.title}
        author={blogPost.author_name}
        authorAvatar={blogPost.author_avatar_url}
        date={blogPost.published_at}
        image={blogPost.featured_image}
        genres={blogPost.genre_names}
        readingTime={Math.max(Math.ceil(blogPost.content.length / 1000), 1)}
      />
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <BlogContent 
          content={blogPost.content} 
          rating={blogPost.movie_rating}
          pros={blogPost.pros || []}
          cons={blogPost.cons || []}
        />
        
        {/* Movie Card */}
        {movieData && (
          <div className="my-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FilmIcon className="w-6 h-6 text-primary" />
              <span>Related Movie</span>
            </h2>
            <MovieCard 
              locale={locale}
              movieId={movieData.id}
              slug={movieData.slug}
              title={movieData.title}
              posterUrl={movieData.posterUrl}
              rating={movieData.rating}
              releaseDate={movieData.releaseDate}
              genres={movieData.genres}
            />
          </div>
        )}
      </div>
      
      {relatedPosts.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <RelatedPosts posts={relatedPosts} currentPostId={blogPost.id} locale={locale} />
        </div>
      )}
    </div>
  )
} 