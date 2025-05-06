'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BlogPost } from '@/lib/blog'
import { Locale } from '@/config/i18n'

interface BlogCardProps {
  post: BlogPost
  index?: number
  locale?: Locale
}

export function BlogCard({ post, index = 0, locale }: BlogCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Create link path based on locale
  const linkPath = locale ? `/${locale}/blog/${post.slug}` : `/blog/${post.slug}`
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Link href={linkPath} className="h-full">
        <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/10">
          {/* Card Media */}
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            {!imageLoaded && post.featured_image && (
              <Skeleton className="w-full h-full absolute inset-0" />
            )}
            {post.featured_image ? (
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className={`object-cover transition-all duration-700 ${
                  imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                }`}
                onLoadingComplete={() => setImageLoaded(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
            
            {/* Genres */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
              {post.genre_names.slice(0, 2).map((genre, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 text-xs rounded-full bg-primary/80 text-primary-foreground backdrop-blur-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
            
            {/* Rating badge */}
            {post.movie_rating && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-yellow-500/90 text-black font-bold text-xs backdrop-blur-sm z-10">
                {post.movie_rating}/10
              </div>
            )}
          </div>
          
          <CardContent className="p-4">
            {/* Title */}
            <h3 className="font-semibold text-xl mb-2 line-clamp-2">
              {post.title}
            </h3>
            
            {/* Excerpt */}
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {post.excerpt}
            </p>
            
            {/* Author and date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {post.author_avatar_url ? (
                <div className="w-6 h-6 rounded-full overflow-hidden relative">
                  <Image
                    src={post.author_avatar_url}
                    alt={post.author_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  {post.author_name.charAt(0)}
                </div>
              )}
              <span className="truncate max-w-[100px]" title={post.author_name}>
                {post.author_name}
              </span>
              <span>•</span>
              <time dateTime={post.published_at}>
                {format(new Date(post.published_at), 'MMM d, yyyy')}
              </time>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
} 