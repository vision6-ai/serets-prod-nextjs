'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlogCard } from './blog-card'
import { BlogPost } from '@/lib/blog'
import { motion, AnimatePresence } from 'framer-motion'
import { Locale } from '@/config/i18n'

interface BlogCarouselProps {
  title: string
  subtitle?: string
  posts: BlogPost[]
  viewAllHref?: string
  locale?: Locale
}

export function BlogCarousel({ title, subtitle, posts, viewAllHref, locale }: BlogCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    skipSnaps: true
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    
    // Initial check
    onSelect()
    
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <motion.h2 
            className="text-3xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p 
              className="text-muted-foreground mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="hidden md:flex"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous posts</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="hidden md:flex"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next posts</span>
          </Button>
          {viewAllHref && (
            <Button asChild variant="ghost">
              <a href={viewAllHref}>View All</a>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {posts.map((post, index) => (
            <div key={post.id} className="min-w-[300px] md:min-w-[350px] lg:min-w-[400px] pl-4 flex-grow max-w-full md:max-w-[33%]">
              <BlogCard post={post} index={index} locale={locale} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination dots (mobile only) */}
      <div className="mt-6 flex justify-center gap-1 md:hidden">
        {posts.slice(0, 6).map((_, idx) => (
          <button
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
            }`}
            onClick={() => emblaApi?.scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
} 