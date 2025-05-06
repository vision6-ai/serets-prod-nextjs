'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

export interface BlogHeroProps {
  title: string;
  author: string;
  authorAvatar: string | null;
  date: string;
  image: string | null;
  genres?: string[];
  readingTime: number;
}

export function BlogHero({ 
  title, 
  author, 
  authorAvatar, 
  date, 
  image, 
  genres = [], 
  readingTime 
}: BlogHeroProps) {
  const [loaded, setLoaded] = useState(false)
  
  // Show skeleton while image loads for better UX
  useEffect(() => {
    if (image) {
      const img = new window.Image()
      img.src = image
      img.onload = () => setLoaded(true)
    } else {
      setLoaded(true)
    }
  }, [image])
  
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      {/* Parallax background */}
      <div className="absolute inset-0 w-full h-full">
        {image ? (
          <>
            {!loaded && <Skeleton className="w-full h-full" />}
            {image && (
              <Image 
                src={image}
                alt={title}
                fill
                priority
                className={`object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                sizes="100vw"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full w-full flex flex-col justify-end p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Genre badges */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.slice(0, 3).map((genre, index) => (
                <motion.span
                  key={index}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-primary/80 text-primary-foreground backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                >
                  {genre}
                </motion.span>
              ))}
            </div>
          )}
          
          {/* Title */}
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {title}
          </motion.h1>
          
          {/* Author and date */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              {authorAvatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  <Image
                    src={authorAvatar}
                    alt={author}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  {author.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-white font-medium">{author}</p>
                <p className="text-gray-400 text-sm">
                  {format(new Date(date), 'MMM dd, yyyy')} · {readingTime} min read
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 