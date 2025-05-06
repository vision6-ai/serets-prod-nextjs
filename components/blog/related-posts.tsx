'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BlogPost } from '@/lib/blog'
import { BlogCard } from './blog-card'
import { Locale } from '@/config/i18n'

interface RelatedPostsProps {
  posts: BlogPost[]
  currentPostId: string
  locale: Locale
}

export function RelatedPosts({ posts, currentPostId, locale }: RelatedPostsProps) {
  // Filter out the current post if it's in the list
  const filteredPosts = posts.filter(post => post.id !== currentPostId)
  
  if (filteredPosts.length === 0) {
    return null
  }
  
  return (
    <section className="py-12 border-t">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-8">Related Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <BlogCard 
              key={post.id} 
              post={post} 
              index={index}
              locale={locale}
            />
          ))}
        </div>
      </motion.div>
    </section>
  )
} 