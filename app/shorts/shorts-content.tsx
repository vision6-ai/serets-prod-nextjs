'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import VideoPlayer from './video-player'

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  poster_url: string | null
  slug: string
}

interface Trailer {
  id: string
  title: string
  cloudflare_id: string
  cloudflare_status: string
  language: string | null
  movies: Movie
}

interface ShortsContentProps {
  trailers: Trailer[]
}

export default function ShortsContent({ trailers }: ShortsContentProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [touchDirection, setTouchDirection] = useState<'up' | 'down' | null>(null)
  const touchStartTime = useRef<number>(0)
  const lastTouchPosition = useRef<number | null>(null)

  // Handle touch events
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0].clientY
    touchStartTime.current = performance.now()
    lastTouchPosition.current = touch
    setTouchEnd(null)
    setTouchStart(touch)
    setIsScrolling(true)
    setTouchDirection(null)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return

    const currentTouch = e.targetTouches[0].clientY
    const distance = touchStart - currentTouch
    const timeDiff = performance.now() - touchStartTime.current
    const velocity = Math.abs(distance) / timeDiff

    lastTouchPosition.current = currentTouch

    if (distance > 0) {
      setTouchDirection('up')
    } else if (distance < 0) {
      setTouchDirection('down')
    }

    setTouchEnd(currentTouch)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const duration = performance.now() - touchStartTime.current
    const velocity = Math.abs(distance) / duration

    const minSwipeDistance = 50
    const minVelocity = 0.3

    const isValidSwipe = Math.abs(distance) > minSwipeDistance || 
      (velocity > minVelocity && Math.abs(distance) > 20)

    if (isValidSwipe) {
      if (distance > 0 && activeIndex < trailers.length - 1) {
        setActiveIndex(prev => prev + 1)
      } else if (distance < 0 && activeIndex > 0) {
        setActiveIndex(prev => prev - 1)
      }
    }

    setTouchStart(null)
    setTouchEnd(null)
    setIsScrolling(false)
    setTouchDirection(null)
    lastTouchPosition.current = null
  }

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' && activeIndex > 0) {
      setActiveIndex(prev => prev - 1)
    } else if (e.key === 'ArrowDown' && activeIndex < trailers.length - 1) {
      setActiveIndex(prev => prev + 1)
    }
  }, [activeIndex, trailers.length])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div 
      className="fixed inset-0 bg-black touch-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      data-testid="shorts-feed"
    >
      <div className="relative h-full w-full">
        {trailers.map((trailer, index) => (
          <div
            key={trailer.id}
            className={cn(
              "fixed inset-0 transition-transform duration-300",
              "will-change-transform",
              isScrolling ? "transition-none" : "transition-transform duration-300 ease-out",
              index === activeIndex ? "translate-y-0 z-10" :
              index < activeIndex ? "-translate-y-full z-0" :
              "translate-y-full z-0"
            )}
            data-testid={`video-container-${trailer.cloudflare_id}`}
          >
            <VideoPlayer
              key={trailer.id}
              trailer={trailer}
              isActive={index === activeIndex}
              className={cn(
                "transition-all duration-500",
                index !== activeIndex && "opacity-50 scale-95"
              )}
            />
          </div>
        ))}
      </div>

      {/* Navigation Indicators */}
      <div className="fixed right-4 top-20 z-50 flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/50 hover:text-white"
          onClick={() => activeIndex > 0 && setActiveIndex(prev => prev - 1)}
          disabled={activeIndex === 0}
          data-testid="nav-up"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
        <span className="text-sm text-white/80">
          {activeIndex + 1} / {trailers.length}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/50 hover:text-white"
          onClick={() => activeIndex < trailers.length - 1 && setActiveIndex(prev => prev + 1)}
          disabled={activeIndex === trailers.length - 1}
          data-testid="nav-down"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
