import { Metadata } from 'next'
import { Locale } from '@/config/i18n'
import { createClient } from '@supabase/supabase-js'
import { unstable_setRequestLocale } from 'next-intl/server'
import { BlogHero } from '@/components/blog/blog-hero'
import { BlogCarousel } from '@/components/blog/blog-carousel'
import { BlogCard } from '@/components/blog/blog-card'
import { BlogFilter } from '@/components/blog/blog-filter'
import { getBlogPosts, fetchBlogPosts } from '@/lib/blog'

export const revalidate = 3600 // Revalidate every hour

interface BlogPageProps {
  params: { locale: Locale }
  searchParams: { 
    genre?: string
    sort?: 'date' | 'rating' | 'title'
    page?: string
  }
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = params
  
  return {
    title: 'Movie Reviews Blog | MovieTime',
    description: 'Discover the latest movie reviews, insights, and analysis from our movie experts.',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog`,
      languages: {
        'en': `${process.env.NEXT_PUBLIC_SITE_URL}/en/blog`,
        'he': `${process.env.NEXT_PUBLIC_SITE_URL}/he/blog`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog`,
      title: 'Movie Reviews Blog | MovieTime',
      description: 'Discover the latest movie reviews, insights, and analysis from our movie experts.',
      siteName: 'MovieTime',
    },
  }
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = params
  const { genre: genreId, sort = 'date', page = '1' } = searchParams
  
  unstable_setRequestLocale(locale)
  
  // Pagination settings
  const currentPage = parseInt(page, 10) || 1
  const postsPerPage = 9
  const offset = (currentPage - 1) * postsPerPage
  
  // First try to fetch posts from blog_posts table
  let { data: posts, count: totalPosts } = await fetchBlogPosts({
    locale,
    limit: postsPerPage,
    offset,
    genreId: genreId || null,
  })
  
  // If no posts found, fall back to review-based posts
  if (posts.length === 0) {
    const reviewPosts = await getBlogPosts({
      locale,
      limit: postsPerPage,
      offset,
      genreId: genreId || null,
    })
    posts = reviewPosts.data
    totalPosts = reviewPosts.count
  }
  
  // Sort posts based on the sort parameter
  const sortedPosts = [...posts].sort((a, b) => {
    if (sort === 'rating') {
      return (b.movie_rating || 0) - (a.movie_rating || 0)
    } else if (sort === 'title') {
      return a.title.localeCompare(b.title)
    } else {
      // Default sort by date
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    }
  })
  
  // Get featured post for hero section (first post if none is explicitly featured)
  const featuredPost = sortedPosts[0]
  
  // Fetch all genres for the filter
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: genresData } = await supabase
    .from('genres')
    .select('id, slug')
  
  const { data: genreTranslations } = await supabase
    .from('genre_translations')
    .select('genre_id, name, language_code')
    .eq('language_code', locale)
  
  // Create a map of genre translations
  const genreMap = new Map()
  genreTranslations?.forEach(translation => {
    genreMap.set(translation.genre_id, translation)
  })
  
  // Create genres array for the filter
  const genres = genresData?.map(genre => ({
    id: genre.id,
    name: genreMap.get(genre.id)?.name || genre.slug
  })) || []
  
  // Calculate pagination values
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Filters */}
      <BlogFilter genres={genres} totalPosts={totalPosts} />
      
      {/* Hero section */}
      {featuredPost && currentPage === 1 && !genreId && (
        <BlogHero 
          title={featuredPost.title}
          author={featuredPost.author_name}
          authorAvatar={featuredPost.author_avatar_url}
          date={featuredPost.published_at}
          image={featuredPost.featured_image}
          genres={featuredPost.genre_names}
          readingTime={Math.max(Math.ceil(featuredPost.content.length / 1000), 1)}
        />
      )}
      
      {/* Latest posts grid */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8">
          {genreId 
            ? `${genres.find(g => g.id === genreId)?.name || ''} Reviews` 
            : 'Latest Reviews'
          }
        </h2>
        
        {sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts
              .filter((_, index) => featuredPost && currentPage === 1 && !genreId ? index > 0 : true)
              .map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} locale={locale} />
              ))
            }
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold mb-2">No reviews found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new reviews.
            </p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <a
                  key={pageNum}
                  href={`?page=${pageNum}${genreId ? `&genre=${genreId}` : ''}${sort !== 'date' ? `&sort=${sort}` : ''}`}
                  className={`px-4 py-2 rounded-md ${
                    pageNum === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
      
      {/* Categorized sections */}
      {currentPage === 1 && !genreId && sortedPosts.length > 0 && (
        <>
          {/* Popular by rating */}
          <BlogCarousel 
            title="Top Rated Reviews" 
            subtitle="Our highest-rated movie reviews"
            posts={[...posts].sort((a, b) => (b.movie_rating || 0) - (a.movie_rating || 0)).slice(0, 6)}
            viewAllHref="?sort=rating"
            locale={locale}
          />
          
          {/* By genre - display for popular genres */}
          {genres.slice(0, 2).map(genre => {
            const genrePosts = posts.filter(post => post.genre_ids.includes(genre.id))
            if (genrePosts.length >= 3) {
              return (
                <BlogCarousel 
                  key={genre.id}
                  title={`${genre.name} Reviews`}
                  posts={genrePosts.slice(0, 6)}
                  viewAllHref={`?genre=${genre.id}`}
                  locale={locale}
                />
              )
            }
            return null
          })}
        </>
      )}
    </main>
  )
} 