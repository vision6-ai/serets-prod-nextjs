'use client'

import Head from 'next/head'
import { BlogPost } from '@/lib/blog'
import { Locale } from '@/config/i18n'

interface BlogSEOProps {
  post: BlogPost;
  locale: Locale;
}

export function BlogSEO({ post, locale }: BlogSEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://movietime.co.il'
  const canonicalUrl = `${siteUrl}/${locale}/blog/${post.slug}`
  
  // Format the publication date
  const formattedDate = new Date(post.published_at).toISOString()
  
  // Create structured data for Article
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.featured_image ? [post.featured_image] : [],
    datePublished: formattedDate,
    dateModified: formattedDate,
    author: {
      '@type': 'Person',
      name: post.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MovieTime',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    description: post.excerpt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    keywords: [...post.genre_names, 'movie review', 'film review'],
  }
  
  // Create structured data for Review
  const reviewStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Movie',
      name: post.title.replace(' Review', ''),
      datePublished: post.movie_release_date,
      genre: post.genre_names.join(', ')
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: post.movie_rating || '0',
      bestRating: '10',
      worstRating: '0'
    },
    author: {
      '@type': 'Person',
      name: post.author_name
    },
    publisher: {
      '@type': 'Organization',
      name: 'MovieTime'
    },
    datePublished: formattedDate,
    reviewBody: post.excerpt
  }
  
  return (
    <Head>
      <title>{post.title} | MovieTime Blog</title>
      <meta name="description" content={post.excerpt} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang tags for multilingual SEO */}
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en/blog/${post.slug}`} />
      <link rel="alternate" hrefLang="he" href={`${siteUrl}/he/blog/${post.slug}`} />
      <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/en/blog/${post.slug}`} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      {post.featured_image && (
        <meta property="og:image" content={post.featured_image} />
      )}
      <meta property="og:site_name" content="MovieTime" />
      <meta property="article:published_time" content={formattedDate} />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.excerpt} />
      {post.featured_image && (
        <meta name="twitter:image" content={post.featured_image} />
      )}
      
      {/* Structured data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewStructuredData) }}
      />
    </Head>
  )
} 