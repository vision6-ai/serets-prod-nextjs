'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { Volume2, VolumeX, Play, Pause, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Dynamically import ReactPlayer with no SSR to avoid hydration errors
const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
});

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
  language: string | null
  movies: Movie | Movie[]
}

interface VideoPlayerProps {
  trailer: Trailer
  isActive: boolean
  className?: string
}

export default function VideoPlayer({ trailer, isActive, className }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userPaused, setUserPaused] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [urlFormatIndex, setUrlFormatIndex] = useState(0)
  const playerRef = useRef<any>(null)
  const { ref, inView } = useInView({
    threshold: 0.6,
  })

  // Get the movie from the trailer
  const movie = Array.isArray(trailer.movies) ? trailer.movies[0] : trailer.movies

  // Client-side only mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Debug logging
  useEffect(() => {
    if (!isMounted) return;
    
    console.log('Rendering video player with props:', { 
      trailer: {
        id: trailer.id,
        title: trailer.title,
        cloudflare_id: trailer.cloudflare_id,
        language: trailer.language
      },
      movie: movie ? {
        id: movie.id,
        title: movie.title,
        slug: movie.slug
      } : 'No movie data',
      isActive,
      inView
    })
  }, [trailer, movie, isActive, inView, isMounted])

  // Auto-play when in view and active
  useEffect(() => {
    if (!isMounted) return;
    
    console.log('Video Player State:', {
      videoId: trailer.cloudflare_id,
      inView,
      isActive,
      ready,
      playing,
      userPaused,
      error: error ? 'Error present' : 'No error',
      timestamp: new Date().toISOString()
    })
    
    if (inView && isActive && ready && !userPaused && !error) {
      console.log('Starting video playback:', {
        videoId: trailer.cloudflare_id,
        reason: 'In view, active, and ready'
      })
      setPlaying(true)
    }
    if ((!inView || !isActive) && playing) {
      console.log('Stopping video playback:', {
        videoId: trailer.cloudflare_id,
        reason: !inView ? 'Not in view' : 'Not active'
      })
      setPlaying(false)
      setUserPaused(false) // Reset user pause state when video is not active
    }
  }, [inView, isActive, ready, playing, userPaused, trailer.cloudflare_id, error, isMounted])

  const handlePlayPause = () => {
    const newPlayingState = !playing
    setPlaying(newPlayingState)
    setUserPaused(!newPlayingState)
    console.log('User clicked play/pause:', {
      videoId: trailer.cloudflare_id,
      newState: newPlayingState ? 'playing' : 'paused'
    })
  }

  const handleToggleMute = () => {
    setMuted(!muted)
  }

  const handleProgress = (state: { played: number }) => {
    setProgress(state.played * 100)
  }

  const handleReady = () => {
    console.log('Video is ready:', trailer.cloudflare_id)
    setReady(true)
    setError(null)
    setRetryCount(0)
  }

  const handleError = (e: any) => {
    console.error('Video player error:', {
      error: e,
      videoId: trailer.cloudflare_id,
      retryCount,
      urlFormatIndex
    })
    
    // Try the next URL format if available
    if (urlFormatIndex < urlFormats.length - 1) {
      console.log(`Trying next URL format (${urlFormatIndex + 1}/${urlFormats.length - 1})`)
      setUrlFormatIndex(prev => prev + 1)
      return
    }
    
    // Determine error message based on the error type or message
    let errorMessage = 'This video may not be available or you don\'t have permission to view it.';
    
    if (e?.message) {
      if (e.message.includes('403')) {
        errorMessage = 'Access denied. You don\'t have permission to view this video.';
      } else if (e.message.includes('404')) {
        errorMessage = 'Video not found. The video ID may be incorrect.';
      } else if (e.message.includes('network') || e.message.includes('connection')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = `Error: ${e.message}`;
      }
    }
    
    setError(errorMessage);
    setReady(false);
  }

  // Handle retry
  const handleRetry = () => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please try again later.');
      return;
    }
    
    console.log(`Retrying video playback (attempt ${retryCount + 1}/3):`, trailer.cloudflare_id);
    setError(null);
    setRetryCount(prev => prev + 1);
    setReady(false);
    // Reset URL format index to try all formats again
    setUrlFormatIndex(0);
    
    // Force player to reload
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      if (player && player.load) {
        try {
          player.load();
        } catch (err) {
          console.error('Error reloading player:', err);
        }
      }
    }
  }

  // Get Cloudflare customer ID from env
  const cloudflareCustomerId = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_ID || '';
  
  // Array of URL formats to try
  const urlFormats = [
    // Format 1: Standard direct video URL
    `https://customer-${cloudflareCustomerId}.cloudflarestream.com/${trailer.cloudflare_id}/manifest/video.m3u8`,
    // Format 2: Standard videodelivery.net URL
    `https://videodelivery.net/${trailer.cloudflare_id}/manifest/video.m3u8`,
    // Format 3: iframe.videodelivery.net
    `https://iframe.videodelivery.net/${trailer.cloudflare_id}`,
    // Format 4: watch.videodelivery.net
    `https://watch.videodelivery.net/${trailer.cloudflare_id}`,
  ];
  
  // Get current URL based on format index
  const videoUrl = urlFormats[urlFormatIndex] || urlFormats[0];
  
  // Debug the video URL and config
  useEffect(() => {
    if (!isMounted) return;
    
    console.log('Video Player Config:', {
      videoUrl,
      urlFormatIndex,
      cloudflareId: trailer.cloudflare_id,
      streamSigningKey: process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SIGNING_KEY ? 'Is set' : 'Not set',
      customerId: cloudflareCustomerId ? cloudflareCustomerId : 'Not set',
      mounted: isMounted,
      retryCount
    })
  }, [videoUrl, urlFormatIndex, trailer.cloudflare_id, cloudflareCustomerId, isMounted, retryCount])

  // Only render player on the client side to avoid hydration errors
  if (!isMounted) {
    return (
      <div ref={ref} className={cn("relative w-full h-full bg-black flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="animate-pulse h-32 w-32 rounded-full bg-gray-700 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative w-full h-full bg-black", className)}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Video Error</h3>
          <p className="mb-6">{error}</p>
          <div className="text-sm text-gray-400 mb-4">
            <p>Video ID: {trailer.cloudflare_id}</p>
            
            {retryCount < 3 && (
              <Button 
                variant="outline" 
                className="mt-4 flex items-center gap-2"
                onClick={handleRetry}
              >
                <RefreshCw size={16} />
                Retry Video ({retryCount}/3)
              </Button>
            )}
            
            <div className="mt-3 p-2 bg-black/20 rounded text-xs text-left overflow-auto max-w-md">
              <p>URL: {videoUrl}</p>
              <p>CloudflareID: {trailer.cloudflare_id}</p>
              <p>Language: {trailer.language || 'Not specified'}</p>
              <p>Tried URL formats: {urlFormatIndex + 1}/{urlFormats.length}</p>
              <p>CustomerID: {cloudflareCustomerId || 'Not specified'}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Video Player */}
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            playing={playing}
            muted={muted}
            loop
            width="100%"
            height="100%"
            onProgress={handleProgress}
            onReady={handleReady}
            onError={handleError}
            config={{
              file: {
                forceHLS: true,
                attributes: {
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }
                }
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              background: '#000'
            }}
          />

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900">
            <div 
              className="h-full bg-blue-600" 
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Title and Description Overlay */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/70 to-transparent px-4 py-5 pt-16">
            <h3 className="text-xl font-bold mb-1 line-clamp-2">{trailer.title}</h3>
            {movie && movie.slug && movie.slug !== 'unknown' && (
              <Link 
                href={`/movies/${movie.slug}`}
                className="text-blue-400 hover:underline"
              >
                {movie.title || movie.hebrew_title}
              </Link>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-24 right-4 z-10 flex flex-col space-y-2">
            <Button
              className="rounded-full h-10 w-10 bg-black/50 hover:bg-black/70 p-2"
              onClick={handlePlayPause}
              variant="ghost"
            >
              {playing ? <Pause /> : <Play />}
            </Button>
            <Button
              className="rounded-full h-10 w-10 bg-black/50 hover:bg-black/70 p-2"
              onClick={handleToggleMute}
              variant="ghost"
            >
              {muted ? <VolumeX /> : <Volume2 />}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}