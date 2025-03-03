'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  slug: string
  featured_image: string | null
  published_at: string
  author_name: string
  author_bio: string | null
  author_avatar_url: string | null
}

export function BlogSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  })

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            excerpt,
            slug,
            featured_image,
            published_at,
            author_name,
            author_bio,
            author_avatar_url
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(6)
        
        if (error) throw error
        setPosts(data || [])
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Latest from the Blog</h2>
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
          <Button asChild variant="ghost">
            <Link href="/blog">View All</Link>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {loading ? (
            // Loading skeleton
            Array(3).fill(null).map((_, i) => (
              <div key={i} className="min-w-[400px] max-w-[400px] pl-4">
                <Card className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="aspect-[16/9] bg-muted rounded-md mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            // Actual blog post cards
            posts.map((post) => (
              <div key={post.id} className="min-w-[400px] max-w-[400px] pl-4">
                <Card className="hover-card h-full">
                  <Link href={`/blog/${post.slug}`}>
                    <CardContent className="p-4">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="aspect-[16/9] object-cover rounded-md mb-4"
                          loading="lazy"
                        />
                      ) : (
                        <div className="aspect-[16/9] bg-muted rounded-md mb-4 flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                      <h3 className="font-semibold text-xl mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {post.author_avatar_url ? (
                          <img
                            src={post.author_avatar_url}
                            alt={post.author_name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            {post.author_name.charAt(0)}
                          </div>
                        )}
                        <span>{post.author_name}</span>
                        <span>•</span>
                        <time dateTime={post.published_at}>
                          {new Date(post.published_at).toLocaleDateString()}
                        </time>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}