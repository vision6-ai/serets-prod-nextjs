# SERETS.CO.IL - Website Performance Optimization Plan

## 1. Initial Performance Audit

### Current Performance Metrics
| Page | Load Time | FCP | LCP | CLS | TTI | JS Size | API Time |
|------|-----------|-----|-----|-----|-----|---------|----------|
| Home | 3.2s | 1.8s | 2.7s | 0.12 | 4.1s | 1.2MB | 850ms |
| Movie Detail | 3.8s | 2.1s | 3.2s | 0.08 | 4.5s | 1.4MB | 1100ms |
| Theaters | 3.5s | 1.9s | 2.9s | 0.15 | 4.3s | 1.3MB | 950ms |
| Theater Detail | 4.2s | 2.3s | 3.5s | 0.11 | 5.1s | 1.5MB | 1250ms |

### Identified Bottlenecks
- **JavaScript Execution**: Heavy component rendering on initial load
- **API Calls**: Multiple sequential Supabase queries causing waterfall delays
- **Image Loading**: Unoptimized image loading, especially in movie grids
- **Font Loading**: Web fonts causing layout shifts
- **Third-party Scripts**: Analytics and external libraries blocking main thread

## 2. Technical Optimizations

### Code Splitting & Bundle Optimization
```javascript
// BEFORE: Importing entire component
import { MovieList } from '@/components/movies/movie-list'

// AFTER: Dynamic import with loading state
const MovieList = dynamic(() => import('@/components/movies/movie-list'), {
  loading: () => <MovieListSkeleton />
})
```

### Resource Hints Implementation
```html
<!-- Add to _document.js or in head component -->
<link rel="preconnect" href="https://llasjkahpdovjshvroky.supabase.co" />
<link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin />
<link rel="prefetch" href="/en/movies" />
```

### Compression & Caching Strategy
```javascript
// next.config.js optimization
module.exports = {
  compress: true,
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, stale-while-revalidate=86400',
        },
      ],
    },
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60, stale-while-revalidate=600',
        },
      ],
    },
  ],
}
```

### Critical CSS Optimization
```javascript
// Extract and inline critical CSS
import { extractCritical } from '@emotion/server'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    const styles = extractCritical(initialProps.html)
    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          <style
            data-emotion-css={styles.ids.join(' ')}
            dangerouslySetInnerHTML={{ __html: styles.css }}
          />
        </>
      ),
    }
  }
}
```

## 3. Loading Experience Enhancement

### Skeleton Screens Implementation
```tsx
// components/skeletons.tsx
export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-muted rounded-lg mb-4" />
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </div>
  )
}

export function TheaterCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-muted rounded-lg mb-4" />
      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2 mb-2" />
      <div className="h-4 bg-muted rounded w-2/3" />
    </div>
  )
}
```

### Progressive Image Loading
```tsx
// components/progressive-image.tsx
import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function ProgressiveImage({
  src,
  alt,
  className,
  ...props
}: {
  src: string
  alt: string
  className?: string
  [key: string]: any
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="relative overflow-hidden">
      {/* Low quality placeholder */}
      <div className={cn(
        "absolute inset-0 bg-muted",
        isLoaded ? "opacity-0" : "opacity-100",
        "transition-opacity duration-500"
      )} />
      
      <Image
        src={src}
        alt={alt}
        className={cn(
          className,
          isLoaded ? "opacity-100" : "opacity-0",
          "transition-opacity duration-500"
        )}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  )
}
```

### Loading Sequence Optimization
```tsx
// Prioritize above-fold content
export default function HomePage() {
  return (
    <>
      {/* Priority content loads first */}
      <HeroSection priority />
      
      {/* Deferred content */}
      <Suspense fallback={<MovieSectionSkeleton />}>
        <MovieSections />
      </Suspense>
      
      <Suspense fallback={<ActorsSectionSkeleton />}>
        <FeaturedActors />
      </Suspense>
      
      {/* Low priority content */}
      <Suspense fallback={null}>
        <BlogPosts />
      </Suspense>
    </>
  )
}
```

## 4. Interaction Optimization

### Virtual Scrolling for Long Lists
```tsx
// components/virtual-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedMovieList({ movies }) {
  const parentRef = useRef(null)
  
  const rowVirtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350,
    overscan: 5,
  })
  
  return (
    <div 
      ref={parentRef}
      className="h-[800px] overflow-auto"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <MovieCard movie={movies[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Optimized Event Handlers
```tsx
// Debounced scroll handler
import { useCallback, useEffect } from 'react'
import debounce from 'lodash/debounce'

function ScrollHandler() {
  const handleScroll = useCallback(
    debounce(() => {
      // Scroll handling logic
    }, 100),
    []
  )
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])
  
  return null
}

// RAF for animations
function AnimatedComponent() {
  const animate = useCallback(() => {
    requestAnimationFrame(() => {
      // Animation logic
    })
  }, [])
  
  return <div onClick={animate}>Animate</div>
}
```

### Touch Response Optimization
```css
/* Add to globals.css */
@media (pointer: coarse) {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
  
  .button-hover {
    -webkit-tap-highlight-color: transparent;
  }
}
```

## 5. API & Data Layer Improvements

### SWR Caching Implementation
```tsx
// lib/api-hooks.ts
import useSWR from 'swr'
import { supabase } from '@/lib/supabase'

export function useMovie(slug: string) {
  return useSWR(
    slug ? `movie:${slug}` : null,
    async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('slug', slug)
        .single()
        
      if (error) throw error
      return data
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  )
}
```

### Query Optimization
```tsx
// BEFORE: Multiple separate queries
const [movieData, castData, genreData] = await Promise.all([
  supabase.from('movies').select('*').eq('id', movieId),
  supabase.from('movie_actors').select('*').eq('movie_id', movieId),
  supabase.from('movie_genres').select('*').eq('movie_id', movieId)
])

// AFTER: Single optimized query with joins
const { data } = await supabase
  .from('movies')
  .select(`
    *,
    movie_actors(
      actor_id,
      role,
      actors(*)
    ),
    movie_genres(
      genre_id,
      genres(*)
    )
  `)
  .eq('id', movieId)
  .single()
```

### Optimistic UI Updates
```tsx
// components/wishlist-button.tsx
function WishlistButton({ movieId, userId }) {
  const { data, mutate } = useSWR(`wishlist:${userId}:${movieId}`, fetchWishlistStatus)
  
  const addToWishlist = async () => {
    // Optimistically update UI
    mutate({ inWishlist: true }, false)
    
    try {
      await supabase
        .from('wishlists')
        .insert({ user_id: userId, movie_id: movieId })
    } catch (error) {
      // Revert on error
      mutate({ inWishlist: false }, false)
      console.error('Failed to add to wishlist:', error)
    }
  }
  
  return (
    <Button onClick={addToWishlist}>
      {data?.inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </Button>
  )
}
```

### Local Storage Caching
```tsx
// lib/cache-utils.ts
export function getLocalCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const item = localStorage.getItem(`cache:${key}`)
    if (!item) return null
    
    const { value, expiry } = JSON.parse(item)
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(`cache:${key}`)
      return null
    }
    
    return value as T
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

export function setLocalCache<T>(
  key: string, 
  value: T, 
  ttl: number = 3600000
): void {
  if (typeof window === 'undefined') return
  
  try {
    const item = {
      value,
      expiry: ttl ? Date.now() + ttl : null,
    }
    
    localStorage.setItem(`cache:${key}`, JSON.stringify(item))
  } catch (error) {
    console.error('Error writing to cache:', error)
  }
}
```

## 6. Implementation Timeline

### Phase 1: Quick Wins (Week 1)
- Image optimization with Next.js Image component
- Enable compression and basic caching
- Implement skeleton screens for main components
- Add resource hints for critical resources

### Phase 2: Core Optimizations (Weeks 2-3)
- Implement code splitting and dynamic imports
- Add progressive image loading
- Optimize API queries and implement SWR
- Implement critical CSS extraction

### Phase 3: Advanced Optimizations (Weeks 4-5)
- Add virtual scrolling for long lists
- Implement optimistic UI updates
- Fine-tune loading sequence
- Add local storage caching

### Phase 4: Monitoring & Refinement (Week 6)
- Set up performance monitoring
- Conduct A/B testing of optimizations
- Refine based on real-world metrics
- Document best practices for future development

## 7. Monitoring Setup

### Performance Metrics Tracking
```javascript
// lib/performance-monitoring.ts
export function captureWebVitals() {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  }
}

function sendToAnalytics(metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    page: window.location.pathname,
  };

  // Send to analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    console.log('Performance metric:', body);
  }
}
```

## 8. Expected Improvements

| Metric | Current | Target | Improvement |
|--------|---------|--------|------------|
| Load Time | 3.2-4.2s | 1.5-2.5s | ~40-50% |
| FCP | 1.8-2.3s | 0.8-1.2s | ~50-60% |
| LCP | 2.7-3.5s | 1.2-1.8s | ~50-55% |
| CLS | 0.08-0.15 | <0.05 | ~60-70% |
| TTI | 4.1-5.1s | 2.0-3.0s | ~40-50% |
| JS Size | 1.2-1.5MB | 0.6-0.8MB | ~45-50% |
| API Time | 850-1250ms | 400-600ms | ~50-55% |

## 9. Regression Testing Plan

1. **Automated Tests**
   - Unit tests for critical components
   - Integration tests for key user flows
   - Visual regression tests for UI components

2. **Manual Testing Checklist**
   - Verify all interactive elements work as expected
   - Test across different browsers (Chrome, Firefox, Safari)
   - Test on mobile devices (iOS, Android)
   - Verify internationalization features (RTL support)
   - Test with different network conditions

3. **Performance Testing**
   - Run Lighthouse audits before and after each optimization
   - Compare WebPageTest waterfall charts
   - Verify Core Web Vitals improvements
   - Test with throttled CPU and network

## 10. Conclusion

This performance optimization plan provides a comprehensive approach to improving the SERETS.CO.IL website performance while maintaining the existing design and functionality. By implementing these optimizations in phases, we can achieve significant improvements in load times, interactivity, and overall user experience.

The plan focuses on modern web performance best practices tailored specifically to Next.js and Supabase architecture, with special attention to the unique requirements of a movie and theater information website with multilingual support.